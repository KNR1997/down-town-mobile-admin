import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// config
import { Config } from '@/config';
// hooks
import { useWarehouseQuery } from '@/data/warehouse';
// components
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import CreateOrUpdateWarehouseForm from '@/components/warehouse/warehouse-form';

export default function UpdateWarehousePage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { warehouse, loading, error } = useWarehouseQuery({
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
          {t('form:form-title-edit-warehouse')}
        </h1>
      </div>

      <CreateOrUpdateWarehouseForm initialValues={warehouse} />
    </>
  );
}
UpdateWarehousePage.authenticate = {
  permissions: adminOnly,
};
UpdateWarehousePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
