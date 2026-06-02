import { useState } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
// types
import { Customer } from '@/types';
// contexts
import { customerAtom } from '@/contexts/checkout';
// components
import Button from '@/components/ui/button';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { useUpdateCustomerMutation } from '@/data/customer';

const AddOrUpdateCheckoutContact = () => {
  const { closeModal } = useModalAction();
  const { t } = useTranslation('common');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useAtom(customerAtom);
  const { mutate: updateCustomer, isLoading } =
    useUpdateCustomerMutation();

  function onContactUpdate() {
    if (!phone || !customer) return;
    const input = {
      id: customer?.id,
      profile: {
        contact: phone,
      },
    };
    updateCustomer(
      { ...input },
      {
        onSuccess: (data: Customer) => {
          setCustomer({
            ...customer,
            profile: {
              ...customer?.profile,
              contact: data?.profile?.contact,
            }
          });
          closeModal();
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-light p-5 sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-5 text-center text-sm font-semibold text-heading sm:mb-6">
        {customer?.profile?.contact ? t('text-update') : t('text-add-new')}{' '}
        {t('text-contact-number')}
      </h1>

      <div className="flex items-center">
        {/* <Input name='contact' value={customer?.profile?.contact}/> */}
        <PhoneInput
          country={'lk'}
          value={customer?.profile?.contact}
          onChange={(phoneNumber) => setPhone(`+${phoneNumber}`)}
          inputClass="!p-0 !pe-4 !ps-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-border-base !border-e-0 !rounded !rounded-e-none focus:!border-accent !h-12"
          dropdownClass="focus:!ring-0 !border !border-border-base !shadow-350"
        />
        <Button
          loading={isLoading}
          disabled={isLoading}
          className="!rounded-s-none"
          onClick={onContactUpdate}
        >
          {t('text-save')}
        </Button>
      </div>
    </div>
  );
};

export default AddOrUpdateCheckoutContact;
