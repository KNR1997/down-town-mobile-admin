import cn from 'classnames';
import { useTranslation } from 'next-i18next';
// utils
import usePrice from '@/utils/use-price';
// components
import { CheckMark } from '@/components/icons/checkmark';
import { DiscountIcon } from '@/components/icons/discount';
import { useModalAction } from '@/components/ui/modal/modal.context';

interface Props {
  item: any;
  notAvailable?: boolean;
  onApplyDiscount?: (
    id: string | number,
    discount: number,
    type: 'percentage' | 'fixed',
  ) => void;
  onRemoveDiscount?: (id: string | number) => void;
}

const ItemCard = ({ item, notAvailable }: Props) => {
  const { t } = useTranslation('common');
  const { openModal } = useModalAction();

  // Total price (quantity * unit price)
  const { price } = usePrice({
    amount: item.itemTotal || item.price * item.quantity,
  });

  // Original total price (without discount)
  const { price: originalTotalPrice } = usePrice({
    amount: item.originalPrice
      ? item.originalPrice * item.quantity
      : item.price * item.quantity,
  });

  // Unit price (price per single item)
  const { price: unitPrice } = usePrice({
    amount: item.originalPrice || item.price,
  });

  console.log("unitPrice-----------: ", unitPrice)

  // Discounted unit price
  const { price: discountedUnitPrice } = usePrice({
    amount: item.price,
  });

  const hasDiscount = item.discount > 0;

  const handleDiscountClick = () => {
    openModal('CART_ITEM_DISCOUNT', item);
  };

  return (
    <>
      <div className={cn('flex justify-between py-2')} key={item.id}>
        <div className="flex flex-col">
          <p className="flex items-center text-base">
            <span
              className={cn(
                'text-sm',
                notAvailable ? 'text-red-500' : 'text-body',
              )}
            >
              <span
                className={cn(
                  'text-sm font-bold',
                  notAvailable ? 'text-red-500' : 'text-heading',
                )}
              >
                {item.quantity}
              </span>
              <span className="mx-2">x</span>
              <span>{item.name}</span> | <span>{item.unit}</span>
            </span>
          </p>
          {/* Show unit price */}
          <span className="text-xs text-gray-400 mt-0.5">
            {hasDiscount ? (
              <>
                <span className="line-through mr-1">{unitPrice}</span>
                <span className="text-green-600 font-medium">
                  {discountedUnitPrice}
                </span>
                <span className="ml-1">/ {item.unit}</span>
              </>
            ) : (
              <>
                {unitPrice} <span className="ml-1">/ {item.unit}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through block">
                {originalTotalPrice}
              </span>
            )}
            <span
              className={cn(
                'text-sm',
                notAvailable ? 'text-red-500' : 'text-body',
                hasDiscount && 'text-green-600 font-semibold',
              )}
            >
              {!notAvailable ? price : t('text-unavailable')}
            </span>
            {/* Show total price label */}
            <span className="text-xs text-gray-400 block">
              {t('text-total')}
            </span>
          </div>
          {!notAvailable && (
            <button
              onClick={handleDiscountClick}
              className={cn(
                'p-1 transition-colors duration-200 focus:outline-none rounded',
                hasDiscount
                  ? 'text-green-500 hover:text-green-700 bg-green-50'
                  : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
              )}
              aria-label={hasDiscount ? 'Remove discount' : 'Add discount'}
            >
              {hasDiscount ? (
                // Checkmark icon when discount is applied
                <CheckMark width={14} />
              ) : (
                // Discount icon
                <DiscountIcon width={18} />
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemCard;
