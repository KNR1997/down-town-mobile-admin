import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// config
import { Config } from '@/config';
// hooks
import { useSupplierQuery } from '@/data/supplier';
// components
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import CreateOrUpdateSupplierForm from '@/components/supplier/supplier-form';

export default function UpdateSupplierPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { supplier, loading, error } = useSupplierQuery({
    slug: query.id as string,
    language:
      query.action!.toString() === 'edit' ? locale! : Config.defaultLanguage,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <>
      <div className="flex pb-5 border-b border-dashed border-border-base md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-supplier')}
        </h1>
      </div>

      <CreateOrUpdateSupplierForm initialValues={supplier} />
    </>
  );
}
UpdateSupplierPage.authenticate = {
  permissions: adminOnly,
};
UpdateSupplierPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
