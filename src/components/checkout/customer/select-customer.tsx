import { useAtom } from 'jotai';
import { QueryClient } from 'react-query';
import AsyncSelect from 'react-select/async';
import { useTranslation } from 'next-i18next';
import { customerClient } from '@/data/client/customer';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
// types
import { Customer } from '@/types';
// contexts
import { customerAtom } from '@/contexts/checkout';
// components
import { selectStyles } from '@/components/ui/select/select.styles';
import { useModalAction } from '@/components/ui/modal/modal.context';

const AddOrUpdateCheckoutCustomer = () => {
  const { closeModal } = useModalAction();
  const { t } = useTranslation('common');
  const [selectedCustomer, setCustomer] = useAtom(customerAtom);

  function onCustomerUpdate(option: any) {
    setCustomer(option.value);
    closeModal();
  }

  async function fetchAsyncOptions(inputValue: string) {
    const queryClient = new QueryClient();
    const data = await queryClient.fetchQuery(
      [API_ENDPOINTS.USERS, { text: inputValue, page: 1 }],
      () => customerClient.paginated({ contact: inputValue, page: 1 }),
    );

    return data?.data?.map((customer: Customer) => ({
      value: customer,
      label: `${customer.name} - ${customer?.profile?.contact}`,
    }));
  }

  return (
    <div className="flex min-h-screen w-screen max-w-sm flex-col justify-center bg-light p-5 sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-5 text-center text-sm font-semibold text-heading sm:mb-6">
        {selectedCustomer ? t('text-update') : t('text-select')}{' '}
        {t('text-customer')}
      </h1>
      <div>
        <AsyncSelect
          styles={selectStyles}
          cacheOptions
          placeholder="Search by contact number"
          loadOptions={fetchAsyncOptions}
          defaultOptions
          onChange={onCustomerUpdate}
        />
      </div>
    </div>
  );
};

export default AddOrUpdateCheckoutCustomer;
