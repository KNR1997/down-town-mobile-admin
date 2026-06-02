import { useAtom } from 'jotai';
import { QueryClient } from 'react-query';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { customerClient } from '@/data/client/customer';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
// contexts
import { customerContactAtom } from '@/contexts/checkout';
// components
import { selectStyles } from '@/components/ui/select/select.styles';
import Select from '@/components/ui/select/select';
import Input from '@/components/ui/input';

interface CustomerProps {
  label: string;
  count?: number;
  className?: string;
}

const CustomerContactNumberGrid = ({
  label,
  count,
  className,
}: CustomerProps) => {
  const [customerContact, setCustomerContact] = useAtom(customerContactAtom);

  const handleChange = (e: any) => {
    setCustomerContact(e.target.value);
  };

  function onCustomerUpdate(customer: any) {
    setCustomerContact(customer);
  }

  async function fetchAsyncOptions(inputValue: string) {
    const queryClient = new QueryClient();
    const data = await queryClient.fetchQuery(
      [API_ENDPOINTS.USERS, { text: inputValue, page: 1 }],
      () => customerClient.paginated({ contact: inputValue, page: 1 }),
    );

    return data?.data?.map((user: any) => ({
      value: user.id,
      label: `${user.name} - ${user?.profile?.contact}`,
    }));
  }

  async function handleCreateCustomer(inputValue: string) {
    setCustomerContact(inputValue);
  }

  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <div className="space-s-3 md:space-s-4 flex items-center">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AsyncCreatableSelect
          styles={selectStyles}
          cacheOptions
          defaultOptions
          loadOptions={fetchAsyncOptions}
          onChange={onCustomerUpdate}
          onCreateOption={handleCreateCustomer}
          isClearable
        />
        {/* <Input name="contact" value={customerContact.label} /> */}
      </div>
    </div>
  );
};

export default CustomerContactNumberGrid;
