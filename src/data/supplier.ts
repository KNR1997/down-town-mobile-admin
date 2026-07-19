import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
// utils
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
// config
import { Config } from '@/config';
import { Routes } from '@/config/routes';
// client
import { supplierClient } from '@/data/client/supplier';
// types
import {
  SupplierQueryOptions,
  GetParams,
  SupplierPaginator,
  Supplier,
} from '@/types';

export const useSuppliersQuery = (options: Partial<SupplierQueryOptions>) => {
  const { data, error, isLoading } = useQuery<SupplierPaginator, Error>(
    [API_ENDPOINTS.SUPPLIERS, options],
    ({ queryKey, pageParam }) =>
      supplierClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    suppliers: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useSupplierQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<Supplier, Error>(
    [API_ENDPOINTS.SUPPLIERS, { slug, language }],
    () => supplierClient.get({ slug, language }),
  );
  return {
    supplier: data,
    error,
    loading: isLoading,
  };
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(supplierClient.create, {
    onSuccess: () => {
      Router.push(Routes.supplier.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPLIERS);
    },
  });
};

export const useUpdateSupplierMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(supplierClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.supplier.list}`
        : Routes.supplier.list;
      await router.push(`${generateRedirectUrl}/${data?.id}/edit`, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-updated'));
    },
    // onSuccess: () => {
    //   toast.success(t('common:successfully-updated'));
    // },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPLIERS);
    },
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(supplierClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPLIERS);
    },
  });
};
