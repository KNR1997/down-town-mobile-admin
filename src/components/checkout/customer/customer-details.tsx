import * as yup from 'yup';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import { QueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { useState, useEffect, useRef } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { customerClient } from '@/data/client/customer';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
// contexts
import { customerAtom } from '@/contexts/checkout';
// types
import { Customer } from '@/types';
// hooks
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '@/data/customer';
// components
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';

// Validation schema for customer form
const customerFormSchema = yup.object().shape({
  contact_number: yup
    .string()
    .required('Contact number is required')
    .min(10, 'Contact number must be at least 10 digits')
    .matches(/^[0-9]+$/, 'Contact number must contain only digits'),
  name: yup
    .string()
    .required('Customer name is required')
    .min(2, 'Name must be at least 2 characters'),
});

type FormValues = {
  contact_number: string;
  name: string;
};

interface ContactProps {
  initialValues: Customer | undefined;
  label: string;
  count?: number;
  className?: string;
  onCustomerSelect?: (customer: Customer) => void;
}

const CustomerDetailsGrid = ({
  initialValues,
  label,
  count,
  className,
  onCustomerSelect,
}: ContactProps) => {
  const [customer, setCustomer] = useAtom(customerAtom);
  const { t } = useTranslation('common');
  const { mutate: createCustomer, isLoading: isCreating } =
    useCreateCustomerMutation({redirect: false});
  const { mutate: updateCustomer, isLoading: isUpdating } =
    useUpdateCustomerMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(
    null,
  );
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(customerFormSchema),
    ...(initialValues && {
      defaultValues: {
        contact_number: initialValues.contact_number,
        name: initialValues.name,
      },
    }),
    mode: 'onChange',
  });

  const watchedContact = watch('contact_number');
  const watchedName = watch('name');

  // Function to check if customer exists by contact number
  const checkCustomerExists = async (contactNumber: string) => {
    if (initialValues?.id || !contactNumber || contactNumber.length < 4) {
      setExistingCustomer(null);
      setIsNewCustomer(false);
      setValue('name', '');
      return;
    }

    setIsLoading(true);
    try {
      const queryClient = new QueryClient();
      const data = await queryClient.fetchQuery(
        [API_ENDPOINTS.USERS, { text: contactNumber, page: 1 }],
        () =>
          customerClient.paginated({ contact_number: contactNumber, page: 1 }),
      );

      const existingCustomers = data?.data?.filter(
        (customer: Customer) => customer?.contact_number === contactNumber,
      );

      if (existingCustomers && existingCustomers.length > 0) {
        // Customer exists - auto-fill the name
        const foundCustomer = existingCustomers[0];
        setExistingCustomer(foundCustomer);
        setIsNewCustomer(false);
        return true;
      } else {
        // New customer - clear name field for manual entry
        setExistingCustomer(null);
        setIsNewCustomer(true);
        setValue('name', '');
        return false;
      }
    } catch (error) {
      console.error('Error checking customer:', error);
      toast.error('Failed to check customer existence');
      setExistingCustomer(null);
      setIsNewCustomer(false);
      setValue('name', '');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search when user types
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (initialValues) return;

    const newValue = e.target.value;
    setValue('contact_number', newValue);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Reset states when input is cleared
    if (!newValue || newValue.length < 3) {
      setExistingCustomer(null);
      setIsNewCustomer(false);
      setValue('name', '');
      return;
    }

    // Set new timeout to check after user stops typing (500ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      checkCustomerExists(newValue);
    }, 500);
  };

  // Handle selecting existing customer
  const handleSelectCustomer = () => {
    if (existingCustomer) {
      setCustomer(existingCustomer);
      setIsCustomerSelected(true);
      setValue('name', existingCustomer.name || '');
      if (onCustomerSelect) {
        onCustomerSelect(existingCustomer);
      }
      toast.success(`Selected customer: ${existingCustomer.name}`, {
        position: 'top-right',
      });
    }
  };

  // Handle creating new customer
  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name,
      contact_number: values.contact_number,
    };
    try {
      if (!initialValues) {
        createCustomer({
          ...input,
        });
      } else {
        updateCustomer({
          ...input,
          id: initialValues.id!,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setCustomer(null);
    setIsCustomerSelected(false);
    reset({
      contact_number: '',
      name: '',
    });
    setExistingCustomer(null);
    setIsNewCustomer(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Set initial value from props
  // useEffect(() => {
  //   if (initialValues?.contact_number) {
  //     setValue('contact_number', initialValues?.contact_number);
  //     setValue('name', initialValues?.name);
  //     if (initialValues?.contact_number.length >= 3) {
  //       checkCustomerExists(initialValues?.contact_number);
  //     }
  //   }
  // }, [initialValues?.contact_number]);

  // Determine if the name field should be disabled
  const isNameDisabled = !!existingCustomer || isCustomerSelected;

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

        {customer && (
          <button
            className="flex items-center text-sm font-semibold text-accent transition-colors duration-200 hover:text-accent-hover focus:text-accent-hover focus:outline-none"
            onClick={handleClearCustomer}
          >
            <span className="me-1">✕</span>
            {t('text-clear')}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="my-5 flex flex-wrap sm:my-8">
          <div className="w-full">
            {/* Contact Number Input */}
            <div className="relative">
              <Input
                label="Contact Number"
                placeholder="Enter contact number..."
                {...register('contact_number')}
                onChange={handleContactChange}
                type="tel"
                variant="outline"
                className="mb-4"
                error={t(errors.contact_number?.message!)}
                // disabled={isCustomerSelected}
                required
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Customer Name Input */}
            <div className="relative">
              <Input
                label="Customer Name"
                placeholder={
                  isNewCustomer
                    ? 'Enter customer name...'
                    : existingCustomer
                      ? 'Customer name auto-filled'
                      : 'Enter customer name...'
                }
                {...register('name')}
                type="text"
                variant="outline"
                className="mb-4"
                error={t(errors.name?.message!)}
                // disabled={isNameDisabled}
                required={isNewCustomer}
              />
            </div>

            {/* Status Messages */}
            {!isCustomerSelected &&
              watchedContact &&
              watchedContact.length >= 3 &&
              !isLoading && (
                <div className="mt-1 text-sm">
                  {existingCustomer ? (
                    <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
                      <span className="text-green-700">
                        ✓ Customer found:{' '}
                        <strong>{existingCustomer.name}</strong>
                        <span className="ml-2 text-xs text-gray-500">
                          ({existingCustomer?.contact_number})
                        </span>
                      </span>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={handleSelectCustomer}
                        className="ml-2"
                        type="button"
                      >
                        Select
                      </Button>
                    </div>
                  ) : isNewCustomer ? (
                    <div className="flex items-center justify-between rounded border border-blue-200 bg-blue-50 p-3">
                      <span className="text-blue-700">
                        ✨ New customer number:{' '}
                        <strong>{watchedContact}</strong>
                      </span>
                    </div>
                  ) : watchedContact.length < 3 ? (
                    <span className="text-gray-500">
                      ℹ Enter at least 3 digits to check
                    </span>
                  ) : null}
                </div>
              )}

            {/* Submit Button for New Customer */}
            <div className="mt-4 text-end">
              <Button
                type="submit"
                loading={isCreating}
                disabled={!isValid || isCreating || !watchedName}
              >
                {initialValues
                  ? t('form:button-label-update-customer')
                  : t('form:button-label-add-customer')}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Show hint when no input */}
      {!watchedContact && !customer && (
        <div className="rounded border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          Enter a contact number to check if customer exists or create a new one
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsGrid;
