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
import { purchaseOrderClient } from '@/data/client/purchase-order';
// types
import {
  PurchaseOrderQueryOptions,
  GetParams,
  PurchaseOrderPaginator,
  PurchaseOrder,
} from '@/types';

export const usePurchaseOrdersQuery = (options: Partial<PurchaseOrderQueryOptions>) => {
  const { data, error, isLoading } = useQuery<PurchaseOrderPaginator, Error>(
    [API_ENDPOINTS.WAREHOUSES, options],
    ({ queryKey, pageParam }) =>
      purchaseOrderClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    purchaseOrders: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const usePurchaseOrderQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<PurchaseOrder, Error>(
    [API_ENDPOINTS.WAREHOUSES, { slug, language }],
    () => purchaseOrderClient.get({ slug, language }),
  );
  return {
    purchaseOrder: data,
    error,
    loading: isLoading,
  };
};

export const useCreatePurchaseOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(purchaseOrderClient.create, {
    onSuccess: () => {
      Router.push(Routes.purchaseOrder.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WAREHOUSES);
    },
  });
};

export const useUpdatePurchaseOrderMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(purchaseOrderClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.purchaseOrder.list}`
        : Routes.purchaseOrder.list;
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

export const useDeletePurchaseOrderMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(purchaseOrderClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.WAREHOUSES);
    },
  });
};
