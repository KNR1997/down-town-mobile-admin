import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// contexts
import { useCart } from '@/contexts/quick-cart/cart.context';
// components
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Button from '@/components/ui/button';
// utils
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';

type FormValues = {
  discountAmount: string;
  discountType: 'percentage' | 'fixed';
};

const ItemDiscountView = () => {
  const { t } = useTranslation();
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    'fixed',
  );
  const { applyDiscountToItem, removeDiscountFromItem } = useCart();
  const { data: item } = useModalState();
  const { closeModal } = useModalAction();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      discountAmount: '',
      discountType: 'fixed',
    },
  });

  const watchedDiscountAmount = watch('discountAmount');
  const watchedDiscountType = watch('discountType');

  // Check if item has existing discount
  const hasDiscount = item.discount > 0;
  const isPercentageDiscount = item?.discountType === 'percentage';

  // Pre-fill form with existing discount data when modal opens
  useEffect(() => {
    if (item && hasDiscount) {
      // If it's a percentage discount, show the percentage value
      if (isPercentageDiscount && item.originalPrice) {
        const percentage = (item.discount / item.originalPrice) * 100;
        setValue('discountAmount', percentage.toFixed(0));
        setValue('discountType', 'percentage');
        setDiscountType('percentage');
      } else {
        // For fixed discount, show the amount
        setValue('discountAmount', item.discount.toString());
        setValue('discountType', 'fixed');
        setDiscountType('fixed');
      }
    } else {
      // Reset form when no discount
      setValue('discountAmount', '');
      setValue('discountType', 'fixed');
      setDiscountType('fixed');
    }
  }, [item, hasDiscount, isPercentageDiscount, setValue]);

  const handleModalClose = () => {
    closeModal();
    setValue('discountAmount', '');
    setValue('discountType', 'fixed');
    setDiscountType('fixed');
  };

  const handleRemoveDiscount = () => {
    if (item && removeDiscountFromItem) {
      removeDiscountFromItem(item.id);
      closeModal();
    }
  };

  const onSubmit = (data: FormValues) => {
    const amount = parseFloat(data.discountAmount);
    if (isNaN(amount) || amount <= 0) {
      return; // Handle validation
    }

    // Validate percentage doesn't exceed 100
    if (data.discountType === 'percentage' && amount > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    applyDiscountToItem(item.id, amount, data.discountType);
    closeModal();
  };

  // Calculate and format prices for display
  const { price: originalPrice } = usePrice({
    amount: item?.originalPrice || item?.price || 0,
  });

  const { price: discountedPrice } = usePrice({
    amount: item?.price || 0,
  });

  const { price: totalDiscount } = usePrice({
    amount: hasDiscount ? item.discount || 0 : 0,
  });

  // Calculate preview price
  const previewAmount = parseFloat(watchedDiscountAmount);
  const previewPrice =
    !isNaN(previewAmount) && previewAmount > 0
      ? watchedDiscountType === 'percentage'
        ? (item?.originalPrice || item?.price) * (1 - previewAmount / 100)
        : Math.max(0, (item?.originalPrice || item?.price) - previewAmount)
      : null;

  const { price: previewPriceFormatted } = usePrice({
    amount: previewPrice || 0,
  });

  return (
    <div className="m-auto w-full max-w-lg rounded bg-light sm:w-[32rem]">
      <div className="flex items-center border-b border-border-200 p-7">
        <div className="flex-1">
          <h3 className="mb-1 text-sm font-semibold text-heading md:text-base">
            {item?.name}
          </h3>
          <div className="text-sm text-body text-opacity-80">
            {t('common:text-quantity')}:{' '}
            <span className="font-semibold text-accent">{item?.quantity}</span>
          </div>
          <div className="mt-1 flex items-center gap-4">
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                {originalPrice}
              </p>
            )}
            <p
              className={`text-sm font-semibold ${
                hasDiscount ? 'text-green-600' : 'text-heading'
              }`}
            >
              {discountedPrice}
            </p>
            {hasDiscount && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                -{totalDiscount}{' '}
                {isPercentageDiscount ? `(${watchedDiscountAmount}%)` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-7 pt-6 pb-7">
        <form
          className="flex w-full flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-heading">
              {t('common:text-discount-type')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center text-sm text-body">
                <input
                  type="radio"
                  value="fixed"
                  {...register('discountType')}
                  onChange={(e) => {
                    setDiscountType(e.target.value as 'fixed');
                    register('discountType').onChange(e);
                  }}
                  className="mr-2 h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                  disabled={hasDiscount && isPercentageDiscount}
                />
                {t('common:text-fixed')}
              </label>
              <label className="flex items-center text-sm text-body">
                <input
                  type="radio"
                  value="percentage"
                  {...register('discountType')}
                  onChange={(e) => {
                    setDiscountType(e.target.value as 'percentage');
                    register('discountType').onChange(e);
                  }}
                  className="mr-2 h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                  disabled={hasDiscount && !isPercentageDiscount}
                />
                {t('common:text-percentage')}
              </label>
            </div>
            {hasDiscount && (
              <p className="mt-1 text-xs text-gray-500">
                {isPercentageDiscount
                  ? t('common:text-currently-percentage')
                  : t('common:text-currently-fixed')}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-heading">
              {watchedDiscountType === 'percentage'
                ? t('common:text-discount-percentage')
                : t('common:text-discount-amount')}
            </label>
            <div className="relative">
              {watchedDiscountType === 'fixed' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
              )}
              <input
                type="number"
                {...register('discountAmount', {
                  required: t('form:error-discount-required'),
                  min: {
                    value: 0,
                    message: t('form:error-discount-min'),
                  },
                  max:
                    watchedDiscountType === 'percentage'
                      ? {
                          value: 100,
                          message: t('form:error-discount-max'),
                        }
                      : undefined,
                })}
                placeholder={
                  watchedDiscountType === 'percentage'
                    ? t('form:placeholder-enter-percentage')
                    : t('form:placeholder-enter-amount')
                }
                className={`w-full rounded-md border ${
                  errors.discountAmount ? 'border-red-500' : 'border-border-200'
                } px-3 py-2 text-sm text-heading outline-none transition focus:border-accent ${
                  watchedDiscountType === 'fixed' ? 'pl-7' : 'pl-3'
                }`}
                min="0"
                step={watchedDiscountType === 'percentage' ? '1' : '0.01'}
              />
            </div>
            {errors.discountAmount && (
              <p className="mt-1 text-xs text-red-500">
                {t(errors.discountAmount.message!)}
              </p>
            )}
            {watchedDiscountType === 'percentage' && (
              <p className="mt-1 text-xs text-gray-500">
                {t('form:info-percentage-range')}
              </p>
            )}
          </div>

          {/* Show preview of discounted price */}
          {watchedDiscountAmount && parseFloat(watchedDiscountAmount) > 0 && (
            <div className="mb-4 rounded-md bg-blue-50 p-3">
              <p className="text-sm text-gray-600">
                {watchedDiscountType === 'percentage'
                  ? `${t('common:text-discount')}: ${watchedDiscountAmount}% off`
                  : `${t('common:text-discount')}: $${watchedDiscountAmount} off`}
                <span className="mt-1 block text-xs text-gray-500">
                  {originalPrice} → {previewPriceFormatted}
                </span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {hasDiscount ? (
              <>
                <button
                  type="button"
                  onClick={handleRemoveDiscount}
                  className="inline-flex items-center justify-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {t('common:text-remove-discount')}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="inline-flex items-center justify-center rounded-md border border-border-200 px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  {t('common:text-cancel')}
                </button>
                <Button type="submit" loading={false} disabled={false}>
                  {t('common:text-update-discount')}
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="inline-flex items-center justify-center rounded-md border border-border-200 px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  {t('common:text-cancel')}
                </button>
                <Button type="submit" loading={false} disabled={false}>
                  {t('common:text-apply-discount')}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemDiscountView;
