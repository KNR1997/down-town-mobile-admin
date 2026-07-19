import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// components
import Layout from '@/components/layouts/admin';
import CreateOrUpdatePurchaseOrderForm from '@/components/purchase-order/purchase-order-form';

export default function CreateWarehousePage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-gray-300 pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:button-label-add-purchase-order')}
        </h1>
      </div>
      <CreateOrUpdatePurchaseOrderForm />
    </>
  );
}
CreateWarehousePage.authenticate = {
  permissions: adminOnly,
};
CreateWarehousePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
