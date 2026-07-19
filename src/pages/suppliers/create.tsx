import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// components
import Layout from '@/components/layouts/admin';
import CreateOrUpdateSupplierForm from '@/components/supplier/supplier-form';

export default function CreateSupplierPage() {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex border-b border-dashed border-gray-300 pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:button-label-add-supplier')}
        </h1>
      </div>
      <CreateOrUpdateSupplierForm />
    </>
  );
}
CreateSupplierPage.authenticate = {
  permissions: adminOnly,
};
CreateSupplierPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
