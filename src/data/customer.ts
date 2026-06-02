import Router, { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import { Config } from '@/config';
import { customerClient } from './client/customer';

export const useCreateCustomerMutation = (options?: { redirect?: boolean }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(customerClient.create, {
    onSuccess: () => {
      if (options?.redirect !== false) {
        Router.push(Routes.user.list, undefined, {
          locale: Config.defaultLanguage,
        });
      }
      toast.success(t('common:successfully-created'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data.message);
    },
  });
};

export const useUpdateCustomerMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(customerClient.update, {
    onSuccess: async (data) => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data.message);
    },
  });
};
