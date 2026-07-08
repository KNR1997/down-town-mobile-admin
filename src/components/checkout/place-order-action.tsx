import { useAtom } from 'jotai';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// utils
import { formatOrderedProduct } from '@/utils/format-ordered-product';
// contexts
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/contexts/quick-cart/cart.utils';
import { useCart } from '@/contexts/quick-cart/cart.context';
import { checkoutAtom, discountAtom, walletAtom } from '@/contexts/checkout';
// types
import { PaymentGateway } from '@/types';
// hooks
import { useCreateOrderMutation } from '@/data/order';
// components
import Button from '@/components/ui/button';
import ValidationError from '@/components/ui/validation-error';

export const PlaceOrderAction: React.FC<{
  children?: React.ReactNode;
}> = (props) => {
  const { t } = useTranslation();
  const { locale, ...router } = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { createOrder, isLoading: loading } = useCreateOrderMutation();

  const { items } = useCart();
  const [
    {
      billing_address,
      shipping_address,
      delivery_time,
      coupon,
      verified_response,
      customer,
      payment_gateway,
      token,
      card_details,
    },
  ] = useAtom(checkoutAtom);
  const [discount] = useAtom(discountAtom);
  const [use_wallet_points] = useAtom(walletAtom);

  useEffect(() => {
    setErrorMessage(null);
  }, [payment_gateway]);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id),
  );

  const subtotal = calculateTotal(available_items);
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax: verified_response?.total_tax!,
      shipping_charge: verified_response?.shipping_charge!,
    },
    Number(discount),
  );
  const handlePlaceOrder = () => {
    if (!customer?.contact_number) {
      setErrorMessage('Contact Number Is Required');
      return;
    }
    if (!use_wallet_points && !payment_gateway) {
      setErrorMessage('Gateway Is Required');
      return;
    }
    // if (!use_wallet_points && payment_gateway === "STRIPE" && !token) {
    //   setErrorMessage("Please Pay First");
    //   return;
    // }
    let input = {
      language: locale,
      products: available_items?.map((item) => formatOrderedProduct(item)),
      amount: subtotal,
      coupon_id: Number(coupon?.id),
      discount: discount ?? 0,
      paid_total: total,
      sales_tax: verified_response?.total_tax,
      delivery_fee: verified_response?.shipping_charge,
      total,
      delivery_time: delivery_time?.title,
      customer_name: customer?.name,
      customer_contact: customer.contact_number,
      customer_id: customer?.id,
      use_wallet_points,
      payment_gateway: use_wallet_points
        ? PaymentGateway.FULL_WALLET_PAYMENT
        : payment_gateway,
      payment_method: payment_gateway,
      card_details: payment_gateway== PaymentGateway.CARD && card_details
        ? {
            card_type: card_details?.cardType,
            card_number: card_details?.maskedCardNumber,
            // last_digits: card_details?.lastDigits,
            expiry_month: card_details?.expireMonth,
            expiry_year: card_details?.expireYear,
            // cvv: card_details?.cvv,
            card_holder_name: card_details?.cardHolderName,
          }
        : null,
      billing_address: {
        ...(billing_address?.address && billing_address.address),
      },
      shipping_address: {
        ...(shipping_address?.address && shipping_address.address),
      },
    };
    // if (payment_gateway === "STRIPE") {
    //   //@ts-ignore
    //   input.token = token;
    // }

    // delete input.billing_address.__typename;
    // delete input.shipping_address.__typename;
    // console.log('input-----------------: ', input);
    createOrder(input);
  };
  const isAllRequiredFieldSelected = [
    customer,
    // payment_gateway,
    // billing_address,
    // shipping_address,
    // delivery_time,
    available_items,
  ].every((item) => !isEmpty(item));
  return (
    <>
      <Button
        loading={loading}
        className="mt-5 w-full"
        onClick={handlePlaceOrder}
        disabled={!isAllRequiredFieldSelected || loading}
        {...props}
      >
        {props.children as any}
      </Button>
      {errorMessage && (
        <div className="mt-3">
          <ValidationError message={errorMessage} />
        </div>
      )}
    </>
  );
};
