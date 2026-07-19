import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// config
import { Config } from '@/config';
// hooks
import { useGoodsReceivedNoteQuery } from '@/data/grn';
// components
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import ErrorMessage from '@/components/ui/error-message';
import CreateOrUpdateGRNForm from '@/components/grn/grn-form';

export default function UpdateGRNPage() {
  const { query, locale } = useRouter();
  const { t } = useTranslation();
  const { grn, loading, error } = useGoodsReceivedNoteQuery({
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
          {t('form:form-title-edit-grn')}
        </h1>
      </div>

      <CreateOrUpdateGRNForm initialValues={grn} />
    </>
  );
}
UpdateGRNPage.authenticate = {
  permissions: adminOnly,
};
UpdateGRNPage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
