import cn from 'classnames';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { RadioGroup } from '@headlessui/react';
// contexts
import {
  paymentGatewayAtom,
  PaymentMethodName,
} from '@/contexts/checkout';
// hooks
import { useModalAction } from '@/components/ui/modal/modal.context';
// components
import Alert from '@/components/ui/alert';
import CashPayment from '@/components/checkout/payment/cash';
import CardPayment from '@/components/checkout/payment/card';
import CashOnDelivery from '@/components/checkout/payment/cash-on-delivery';

interface PaymentMethodInformation {
  name: string;
  value: PaymentMethodName;
  icon: string;
  component: React.FunctionComponent;
}

// Payment Methods Mapping Object
const AVAILABLE_PAYMENT_METHODS_MAP: Record<
  PaymentMethodName,
  PaymentMethodInformation
> = {
  CASH: {
    name: 'common:payment-cash',
    value: 'CASH',
    icon: '',
    component: CashPayment,
  },
  // CASH_ON_DELIVERY: {
  //   name: 'common:text-cash-on-delivery',
  //   value: 'CASH_ON_DELIVERY',
  //   icon: '',
  //   component: CashOnDelivery,
  // },
  CARD: {
    name: 'common:payment-card',
    value: 'CARD',
    icon: '',
    component: CardPayment,
  },
};

const PaymentGrid: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gateway, setGateway] = useAtom<PaymentMethodName>(paymentGatewayAtom);
  const PaymentMethod = AVAILABLE_PAYMENT_METHODS_MAP[gateway];
  const Component = PaymentMethod?.component ?? CashOnDelivery;

  function handleSelectGateway(gateway: PaymentMethodName) {
    switch (gateway) {
      case 'CARD':
        openModal('CARD_DETAILS');
        break;
      case 'CASH':
        // Handle CASH selection if needed
        break;
      // case 'CASH_ON_DELIVERY':
      //   // Handle CASH_ON_DELIVERY selection if needed
      //   break;
      default:
        break;
    }
  }

  return (
    <div className={className}>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <RadioGroup
        value={gateway}
        onChange={(value) => {
          setGateway(value);
          handleSelectGateway(value);
        }}
      >
        <RadioGroup.Label className="mb-5 block text-base font-semibold text-heading">
          {t('text-choose-payment')}
        </RadioGroup.Label>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {Object.values(AVAILABLE_PAYMENT_METHODS_MAP).map(
            ({ name, icon, value }) => (
              <RadioGroup.Option value={value} key={value}>
                {({ checked }) => (
                  <div
                    className={cn(
                      'relative flex h-full w-full cursor-pointer items-center justify-center rounded border py-3 text-center',
                      checked
                        ? 'shadow-600 border-accent bg-light'
                        : 'border-gray-200 bg-light',
                    )}
                  >
                    {icon ? (
                      <>
                        {/* eslint-disable */}
                        <img src={icon} alt={t(name)} className="h-[30px]" />
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-heading">
                        {t(name)}
                      </span>
                    )}
                  </div>
                )}
              </RadioGroup.Option>
            ),
          )}
        </div>
      </RadioGroup>
      <div>
        <Component />
      </div>
    </div>
  );
};

export default PaymentGrid;
