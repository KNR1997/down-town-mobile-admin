import { useAtom } from 'jotai';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// contexts
import {
  billingAddressAtom,
  customerAtom,
  shippingAddressAtom,
} from '@/contexts/checkout';
// types
import { AddressType } from '@/types';
// hooks
import { useUserQuery } from '@/data/user';
// components
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
const CustomerNameGrid = dynamic(
  () => import('@/components/checkout/customer/customer-name-grid'),
);
const CustomerContactNumberGrid = dynamic(
  () => import('@/components/checkout/customer/customer-contact-number-grid'),
);
const RightSideView = dynamic(
  () => import('@/components/checkout/right-side-view'),
);

export default function CheckoutPage() {
  const [customer] = useAtom(customerAtom);
  const { t } = useTranslation();

  const {
    data: user,
    isLoading: loading,
    refetch,
  } = useUserQuery({ id: customer?.value });

  useEffect(() => {
    if (customer?.value) {
      refetch(customer?.value);
    }
  }, [customer?.value]);

  if (loading) return <Loader text={t('common:text-loading')} />;

  return (
    <div className="bg-gray-100">
      <div className="lg:space-s-8 m-auto flex w-full max-w-5xl flex-col items-center lg:flex-row lg:items-start">
        <div className="w-full space-y-6 lg:max-w-2xl">
          <CustomerNameGrid
            className="shadow-700 bg-light p-5 md:p-8"
            label={t('text-customer-name')}
            count={1}
          />
          <CustomerContactNumberGrid
            className="shadow-700 bg-light p-5 md:p-8"
            label={t('text-contact-number')}
            count={2}
          />
          {/* <CustomerGrid
            className="shadow-700 bg-light p-5 md:p-8"
            //@ts-ignore
            // contact={user?.profile?.contact}
            label={t('text-customer')}
            count={1}
          /> */}
          {/* <ContactGrid
            className="shadow-700 bg-light p-5 md:p-8"
            //@ts-ignore
            contact={user?.profile?.contact}
            label={t('text-contact-number')}
            count={1}
          /> */}
          {/* <AddressGrid
            userId={user?.id!}
            className="shadow-700 bg-light p-5 md:p-8"
            label={t('text-billing-address')}
            count={2}
            //@ts-ignore
            addresses={user?.addresses?.filter(
              (address) => address?.type === AddressType.Billing
            )}
            //@ts-ignore
            atom={billingAddressAtom}
            type={AddressType.Billing}
          /> */}
          {/* <AddressGrid
            userId={user?.id!}
            className="shadow-700 bg-light p-5 md:p-8"
            label={t('text-shipping-address')}
            count={3}
            //@ts-ignore
            addresses={user?.addresses?.filter(
              (address) => address?.type === AddressType.Shipping
            )}
            //@ts-ignore
            atom={shippingAddressAtom}
            type={AddressType.Shipping}
          /> */}
          {/* <ScheduleGrid
            className="shadow-700 bg-light p-5 md:p-8"
            label={t('text-delivery-schedule')}
            count={4}
          /> */}
        </div>
        <div className="mb-10 mt-10 w-full sm:mb-12 lg:mb-0 lg:w-96">
          <RightSideView />
        </div>
      </div>
    </div>
  );
}
CheckoutPage.authenticate = {
  permissions: adminOnly,
};
CheckoutPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['table', 'common', 'form'])),
  },
});
