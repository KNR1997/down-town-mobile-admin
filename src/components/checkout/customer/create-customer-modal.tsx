import * as yup from 'yup';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
// utils
import { passwordRules } from '@/utils/constants';
// contexts
import { customerAtom } from '@/contexts/checkout';
// types
import { Customer } from '@/types';
// hooks
import { useCreateCustomerMutation } from '@/data/customer';
// components
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import PasswordInput from '@/components/ui/password-input';
import PhoneNumberInput from '@/components/ui/phone-input';
import { useModalAction } from '@/components/ui/modal/modal.context';

type FormValues = {
  name: string;
  contact: string;
  email: string;
  password: string;
};

const defaultValues = {
  email: '',
  password: '',
};

const validationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  contact: yup.string().required('form:error-contact-number-required'),
  email: yup.string().required('form:error-email-required'),
  password: yup
    .string()
    .required('form:error-password-required')
    .matches(passwordRules, {
      message:
        'Please create a stronger password. hint: Min 8 characters, 1 Upper case letter, 1 Lower case letter, 1 Numeric digit.',
    }),
});

const CreateCustomerView = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const [_, setCustomer] = useAtom(customerAtom);
  const { mutate: createCustomer, isLoading: creating } =
    useCreateCustomerMutation({ redirect: false });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    //@ts-ignore
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (values: FormValues) => {
    const input = {
      name: values.name,
      email: values.email,
      password: values.password,
      profile: {
        contact: `+${values.contact}`,
      },
    };

    createCustomer(
      { ...input },
      {
        onSuccess: (data: Customer) => {
          setCustomer(data);
          closeModal();
        },
      },
    );
  };

  return (
    <div className="min-h-screen max-w-lg p-5 bg-light sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-4 text-lg font-semibold text-center text-heading sm:mb-6">
        Create Customer
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid h-full grid-cols-2 gap-5"
      >
        <Input
          label={t('text-name')}
          {...register('name')}
          error={t(errors.name?.message!)}
          variant="outline"
          required
        />
        <PhoneNumberInput
          control={control}
          label={t('form:input-label-contact')}
          {...register('contact')}
          error={t(errors.contact?.message!)}
          required
        />
        <Input
          label={t('text-email')}
          {...register('email')}
          error={t(errors.email?.message!)}
          variant="outline"
          required
        />
        <PasswordInput
          label={t('form:input-label-password')}
          {...register('password')}
          error={t(errors.password?.message!)}
          variant="outline"
          className="mb-4"
          required
        />
        <Button
          loading={creating}
          disabled={creating}
          className="w-full col-span-2"
        >
          {t('text-save')}
        </Button>
      </form>
    </div>
  );
};

export default CreateCustomerView;
