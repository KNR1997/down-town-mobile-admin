import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/utils/format-address';
import usePrice from '@/utils/use-price';

interface Props {
  order: any;
}

const OrderInvoice: FC<Props> = ({ order }) => {
  const { t } = useTranslation();

  const { price: subtotal } = usePrice({
    amount: Number(order?.amount),
  });

  const { price: tax } = usePrice({
    amount: Number(order?.sales_tax),
  });

  const { price: discount } = usePrice({
    amount: Number(order?.discount),
  });

  const { price: total } = usePrice({
    amount: Number(order?.paid_total),
  });

  return (
    <div className="invoice mx-auto max-w-4xl bg-white p-10 text-gray-900">
      {/* Header */}

      <div className="mb-10 flex justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">YOUR COMPANY</h1>

          <p>Colombo, Sri Lanka</p>
          <p>+94 77 123 4567</p>
          <p>support@company.com</p>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold">INVOICE</h2>

          <p>Invoice #: {order?.tracking_number}</p>

          <p>Date: {new Date(order?.created_at).toLocaleDateString()}</p>

          <p>Payment: {order?.payment_status}</p>
        </div>
      </div>

      {/* Customer */}

      <div className="mb-10">
        <h3 className="mb-2 text-lg font-semibold">Bill To</h3>

        <p>{order?.customer_name}</p>

        {order?.customer_contact && <p>{order.customer_contact}</p>}

        {order?.billing_address && (
          <p>{formatAddress(order.billing_address)}</p>
        )}
      </div>

      {/* Items */}

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="px-4 py-3 text-left">Product</th>

            <th className="px-4 py-3 text-center">Qty</th>

            <th className="px-4 py-3 text-right">Unit Price</th>

            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {order?.items?.map((item: any) => {
            const itemTotal = item.quantity * item.unit_price;

            return (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.name}</td>

                <td className="text-center">{item.quantity}</td>

                <td className="text-right">{item.unit_price}</td>

                <td className="text-right">{itemTotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}

      <div className="mt-10 ml-auto w-80">
        <div className="flex justify-between py-2">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>

        <div className="flex justify-between py-2">
          <span>Tax</span>
          <span>{tax}</span>
        </div>

        {order.discount > 0 && (
          <div className="flex justify-between py-2">
            <span>Discount</span>
            <span>{discount}</span>
          </div>
        )}

        <div className="mt-3 flex justify-between border-t pt-3 text-xl font-bold">
          <span>Total</span>
          <span>{total}</span>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-20 border-t pt-6 text-center text-sm text-gray-500">
        Thank you for your purchase.
      </div>
    </div>
  );
};

export default OrderInvoice;
