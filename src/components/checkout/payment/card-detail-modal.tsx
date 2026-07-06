import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
// hooks
import { useModalAction } from '@/components/ui/modal/modal.context';
// components
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import SelectInput from '@/components/ui/select-input';
import { useAtom } from 'jotai';
import { CardDetails, cardDetailsAtom } from '@/contexts/checkout';
import { useState } from 'react';

type FormValues = {
  cardType: {value: string; label: string};
  cardNumber: string;
  lastDigits: string;
  expireMonth: {value: string; label: string};
  expireYear: {value: string; label: string};
  cvv: string;
  cardHolderName: string;
};

const defaultValues = {
  cardType: '',
  cardNumber: '',
  lastDigits: '',
  expireMonth: '',
  expireYear: '',
  cvv: '',
  cardHolderName: '',
};

const cardTypeOptions = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
];

const monthOptions = [
  { value: '01', label: '01 - January' },
  { value: '02', label: '02 - February' },
  { value: '03', label: '03 - March' },
  { value: '04', label: '04 - April' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - June' },
  { value: '07', label: '07 - July' },
  { value: '08', label: '08 - August' },
  { value: '09', label: '09 - September' },
  { value: '10', label: '10 - October' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - December' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 15 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString(), label: year.toString() };
});

const validationSchema = yup.object().shape({
  cardType: yup.object().required('Card Type required'),
  cardNumber: yup
    .string()
    .required('Card Number required')
    .matches(/^\d{16}$/, 'Invalid Card Number'),
  lastDigits: yup
    .string()
    .required('Last 4 digits required')
    .matches(/^\d{4}$/, 'Invalid last 4 digits'),
  expireMonth: yup.object().required('Expire Month required'),
  expireYear: yup.object().required('Expire Year required'),
  cvv: yup
    .string()
    .required('CVV required')
    .matches(/^\d{3,4}$/, 'Invalid CVV'),
  cardHolderName: yup.string().required('Card Holder name required'),
});

const CardDetailsModal = () => {
  const { t } = useTranslation('common');
  const { closeModal } = useModalAction();
  const [cardDetails, setCardDetails] = useAtom(cardDetailsAtom);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: cardDetails || defaultValues,
    //@ts-ignore
        resolver: yupResolver(validationSchema),
  });

    // Mask card number for display
  const maskCardNumber = (cardNumber: string) => {
    if (cardNumber.length === 16) {
      return `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 6)}XX XXXX ${cardNumber.slice(-4)}`;
    }
    return cardNumber;
  };

  const onSubmit = async (values: FormValues) => {
    setIsProcessing(true);
    
    try {
      // Step 1: Send card details to payment gateway (NOT your server!)
      // This should be a direct call to your payment processor (Stripe, Braintree, etc.)
      // const paymentToken = await processCardWithGateway({
      //   cardNumber: values.cardNumber,
      //   cvv: values.cvv,
      //   expireMonth: values.expireMonth,
      //   expireYear: values.expireYear,
      //   cardHolderName: values.cardHolderName,
      // });

      // Step 2: Store ONLY non-sensitive data
      const safeCardDetails: CardDetails = {
        cardType: values.cardType.value,
        lastDigits: values.lastDigits,
        maskedCardNumber: maskCardNumber(values.cardNumber),
        expireMonth: values.expireMonth.value,
        expireYear: values.expireYear.value,
        cardHolderName: values.cardHolderName,
        // The token should be stored separately (e.g., in a different atom or with your server)
      };

      console.log('safeCardDetails-------------: ', safeCardDetails)

      // Save safe data to atom
      setCardDetails(safeCardDetails);
      
      // Close modal
      closeModal();
    } catch (error) {
      console.error('Payment processing error:', error);
      // Show error to user
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen max-w-lg p-5 bg-light sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-4 text-lg font-semibold text-center text-heading sm:mb-6">
        Add Card Details
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        {/* Card Type */}
        <div className="col-span-2">
          <SelectInput
            label="Card Type"
            name="cardType"
            control={control}
            options={cardTypeOptions}
            error={t(errors.cardType?.message!)}
            placeholder="Select Card Type"
            required
          />
        </div>

        {/* Card Number */}
        <div className="col-span-1">
          <Input
            label="Card Number"
            {...register('cardNumber')}
            error={t(errors.cardNumber?.message!)}
            variant="outline"
            placeholder="1234 5678 9012 3456"
            maxLength={16}
            required
          />
        </div>

        {/* Last 4 Digits */}
        <div className="col-span-1">
          <Input
            label="Last Digits"
            {...register('lastDigits')}
            error={t(errors.lastDigits?.message!)}
            variant="outline"
            placeholder="1234"
            maxLength={4}
            required
          />
        </div>

        {/* Expire Month */}
        <div className="col-span-1">
          <SelectInput
            label="Expire Month"
            name="expireMonth"
            control={control}
            options={monthOptions}
            placeholder="Select Expiry Month"
            error={t(errors.expireMonth?.message!)}
            required
          />
        </div>

        {/* Expire Year */}
        <div className="col-span-1">
          <SelectInput
            label="Expire Year"
            name="expireYear"
            control={control}
            options={yearOptions}
            placeholder="Year"
            error={t(errors.expireYear?.message!)}
            required
          />
        </div>

        {/* CVV */}
        <div className="col-span-1">
          <Input
            label="CVV"
            {...register('cvv')}
            error={t(errors.cvv?.message!)}
            variant="outline"
            placeholder="123"
            maxLength={4}
            type="password"
            required
          />
        </div>

        {/* Card Holder Name */}
        <div className="col-span-1">
          <Input
            label="Card Holder Name"
            {...register('cardHolderName')}
            error={t(errors.cardHolderName?.message!)}
            variant="outline"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Action Buttons */}
        {/* <div className="flex col-span-2 gap-3 mt-2"> */}
        {/* <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={closeModal}
          >
            {t('text-cancel')}
          </Button> */}
        <Button type="submit" className="w-full col-span-2">
          Save Card
        </Button>
        {/* </div> */}
      </form>
    </div>
  );
};

export default CardDetailsModal;
