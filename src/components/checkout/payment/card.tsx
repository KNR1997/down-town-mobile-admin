import { useAtom } from 'jotai';
import { useTranslation } from 'next-i18next';
// contexts
import { cardDetailsAtom } from '@/contexts/checkout';
// hooks
import { useModalAction } from '@/components/ui/modal/modal.context';
// components
import Button from '@/components/ui/button';

const CardPayment = () => {
  const { t } = useTranslation('common');
  const [cardDetails] = useAtom(cardDetailsAtom);
  const { openModal } = useModalAction();

  const handleAddCard = () => {
    openModal('CARD_DETAILS');
  };

  const handleEditCard = () => {
    openModal('CARD_DETAILS');
  };

  return (
    <div className="space-y-4">
      {cardDetails ? (
        // Show saved card details
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-heading">
                  {cardDetails.cardType.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  •••• {cardDetails.lastDigits}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Card Holder: {cardDetails?.cardHolderName}</p>
                <p>
                  Expired: {cardDetails.expireMonth}/
                  {cardDetails.expireYear}
                </p>
              </div>
            </div>
            <Button variant="outline" size="small" onClick={handleEditCard}>
              {t('text-edit')}
            </Button>
          </div>
        </div>
      ) : (
        // Show add card button
        <div className="p-4 border border-dashed rounded-lg text-center">
          <p className="text-sm text-gray-500 mb-3">
            {t('text-no-card-added')}
          </p>
          <Button onClick={handleAddCard} className="w-full sm:w-auto">
            {t('text-add-card')}
          </Button>
        </div>
      )}

      <span className="text-sm text-body block">{t('text-card-message')}</span>
    </div>
  );
};

export default CardPayment;
