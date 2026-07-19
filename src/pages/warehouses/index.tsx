import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// utils
import { adminOnly } from '@/utils/auth-utils';
// config
import { Config } from '@/config';
import { Routes } from '@/config/routes';
// types
import { SortOrder, Type } from '@/types';
// hooks
import { useWarehousesQuery } from '@/data/warehouse';
// components
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import Loader from '@/components/ui/loader/loader';
import LinkButton from '@/components/ui/link-button';
import ErrorMessage from '@/components/ui/error-message';
import PageHeading from '@/components/common/page-heading';
import BasicFilter from '@/components/filters/basic-filter';
import WarehouseList from '@/components/warehouse/warehouse-list';

export default function Warehouses() {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const {
    warehouses,
    loading: loading,
    paginatorInfo,
    error,
  } = useWarehousesQuery({
    limit: 10,
    orderBy,
    sortedBy,
    name: searchTerm,
    page,
    language: locale,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center md:flex-row">
        <div className="mb-4 md:mb-0 md:w-1/4">
          <PageHeading title={t('common:sidebar-nav-item-warehouses')} />
        </div>

        <div className="flex w-full flex-col items-center space-y-4 ms-auto md:w-1/2 md:flex-row md:space-y-0">
          <Search
            onSearch={handleSearch}
            placeholderText={t('form:input-placeholder-search-name')}
          />

          <BasicFilter
            className="md:ms-6"
            onFilterFunction={(type: Type) => {
              // setType(type?.slug!);
              setPage(1);
            }}
          />

          {locale === Config.defaultLanguage && (
            <LinkButton
              href={`${Routes.warehouse.create}`}
              className="h-12 w-full md:w-auto md:ms-6"
            >
              <span className="block md:hidden xl:block">
                + {t('form:button-label-add-warehouse')}
              </span>
              <span className="hidden md:block xl:hidden">
                + {t('form:button-label-add')}
              </span>
            </LinkButton>
          )}
        </div>
      </Card>

      <WarehouseList
        warehouses={warehouses}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
        paginatorInfo={paginatorInfo}
      />
    </>
  );
}
Warehouses.authenticate = {
  permissions: adminOnly,
};
Warehouses.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});
