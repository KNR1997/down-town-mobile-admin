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
import { warehouseClient } from '@/data/client/warehouse';
// types
import {
  WarehouseQueryOptions,
  GetParams,
  WarehousePaginator,
  Warehouse,
} from '@/types';

export const useWarehousesQuery = (options: Partial<WarehouseQueryOptions>) => {
  const { data, error, isLoading } = useQuery<WarehousePaginator, Error>(
    [API_ENDPOINTS.WAREHOUSES, options],
    ({ queryKey, pageParam }) =>
      warehouseClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    warehouses: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useWarehouseQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<Warehouse, Error>(
    [API_ENDPOINTS.WAREHOUSES, { slug, language }],
    () => warehouseClient.get({ slug, language }),
  );
  return {
    warehouse: data,
    error,
    loading: isLoading,
  };
};

export const useCreateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(warehouseClient.create, {
    onSuccess: () => {
      Router.push(Routes.warehouse.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WAREHOUSES);
    },
    onError: (error: any) => {
      const { data, status } = error?.response;
      if (status === 422) {
        const errorMessage: any = Object.values(data).flat();
        toast.error(errorMessage[0]);
      } else {
        // toast.error(t(`common:${error?.response?.data.message}`));
        toast.error(error?.response?.data.message);
      }
    },
  });
};

export const useUpdateWarehouseMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(warehouseClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.warehouse.list}`
        : Routes.warehouse.list;
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
      queryClient.invalidateQueries(API_ENDPOINTS.WAREHOUSES);
    },
  });
};

export const useDeleteWarehouseMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(warehouseClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WAREHOUSES);
    },
  });
};
