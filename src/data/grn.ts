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
import { grnClient } from '@/data/client/grn';
// types
import {
  GetParams,
  GoodsReceivedNote,
  GoodsReceivedNotePaginator,
  GoodsReceivedNoteQueryOptions,
} from '@/types';

export const useGoodsReceivedNotesQuery = (options: Partial<GoodsReceivedNoteQueryOptions>) => {
  const { data, error, isLoading } = useQuery<GoodsReceivedNotePaginator, Error>(
    [API_ENDPOINTS.GRNS, options],
    ({ queryKey, pageParam }) =>
      grnClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    },
  );

  return {
    grns: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useGoodsReceivedNoteQuery = ({ slug, language }: GetParams) => {
  const { data, error, isLoading } = useQuery<GoodsReceivedNote, Error>(
    [API_ENDPOINTS.GRNS, { slug, language }],
    () => grnClient.get({ slug, language }),
  );
  return {
    grn: data,
    error,
    loading: isLoading,
  };
};

export const useCreateGoodsReceivedNoteMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(grnClient.create, {
    onSuccess: () => {
      Router.push(Routes.grn.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.GRNS);
    },
  });
};

export const useUpdateGoodsReceivedNoteMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(grnClient.update, {
    onSuccess: async (data) => {
      const generateRedirectUrl = router.query.shop
        ? `/${router.query.shop}${Routes.grn.list}`
        : Routes.grn.list;
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
      queryClient.invalidateQueries(API_ENDPOINTS.GRNS);
    },
  });
};

export const useDeleteGoodsReceivedNoteMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(grnClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.GRNS);
    },
  });
};
