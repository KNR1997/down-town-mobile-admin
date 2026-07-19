import Image from 'next/image';
import { useTranslation } from 'next-i18next';
// settings
import { siteSettings } from '@/settings/site.settings';
// utils
import usePrice from '@/utils/use-price';
import { useIsRTL } from '@/utils/locals';
// types
import { Attachment, Product } from '@/types';
// components
import { Table } from '@/components/ui/table';
import { NoDataFound } from '@/components/icons/no-data-found';

type IProps = {
  items: Product[] | undefined;
};

const OrderItemList = ({ items }: IProps) => {
  const { t } = useTranslation();
  const { alignLeft, alignRight } = useIsRTL();

  const columns = [
    {
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (image: Attachment) => (
        <div className="relative h-[50px] w-[50px]">
          <Image
            src={image?.thumbnail ?? siteSettings.product.placeholder}
            alt="alt text"
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-fill"
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'product_name',
      key: 'product_name',
      align: alignLeft,
      render: (product_name: string, item: any) => (
        <div>
          <span>{product_name}</span>
          <span className="mx-2">x</span>
          <span className="font-semibold text-heading">
            {item.order_quantity}
          </span>
          {item.unit && (
            <span className="ml-1 text-xs text-gray-400">/{item.unit}</span>
          )}
        </div>
      ),
    },
    {
      title: t('table:table-item-unit-price'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: alignRight,
      render: function Render(_: any, item: any) {
        const hasDiscount = item.discount && item.discount > 0;
        const unitPrice = parseFloat(item.unit_price || item.price);

        const { price } = usePrice({
          amount: unitPrice,
        });

        if (hasDiscount) {
          const discountAmount = parseFloat(item.discount);
          let discountedPrice = unitPrice;

          if (item.discount_type === 'percentage') {
            discountedPrice = unitPrice * (1 - discountAmount / 100);
          } else {
            discountedPrice = unitPrice - discountAmount;
          }

          const { price: discountedPriceFormatted } = usePrice({
            amount: discountedPrice,
          });

          return (
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 line-through">
                {price}
              </span>
              <span className="text-green-600 font-medium">
                {discountedPriceFormatted}
              </span>
            </div>
          );
        }

        return <span>{price}</span>;
      },
    },
    {
      title: t('table:table-item-discount'),
      dataIndex: 'discount',
      key: 'discount',
      align: alignRight,
      render: function Render(_: any, item: any) {
        const hasDiscount = item.discount && item.discount > 0;

        if (!hasDiscount) {
          return <span className="text-gray-400">—</span>;
        }

        const discountAmount = parseFloat(item.discount);
        const quantity = parseFloat(item.order_quantity);
        const totalDiscount = discountAmount * quantity;
        const { price: totalDiscountPrice } = usePrice({
          amount: totalDiscount,
        });

        return (
          <div className="flex flex-col items-end">
            <span className="text-red-500 font-medium">
              -{totalDiscountPrice}
            </span>
            <span className="text-xs text-gray-500">
              {item.discount_type === 'percentage'
                ? `${discountAmount}% off`
                : `$${discountAmount.toFixed(2)}/unit`}
            </span>
          </div>
        );
      },
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: alignRight,
      render: function Render(_: any, item: any) {
        const unitPrice = parseFloat(item.unit_price || item.price);
        const quantity = parseFloat(item.order_quantity);
        const hasDiscount = item.discount && item.discount > 0;

        let total = unitPrice * quantity;
        let originalTotal = total;

        if (hasDiscount) {
          const discountAmount = parseFloat(item.discount);
          if (item.discount_type === 'percentage') {
            const discountPerUnit = (unitPrice * discountAmount) / 100;
            total = (unitPrice - discountPerUnit) * quantity;
          } else {
            total = (unitPrice - discountAmount) * quantity;
          }
        }

        const { price: totalPrice } = usePrice({
          amount: total,
        });

        if (hasDiscount) {
          const { price: originalPrice } = usePrice({
            amount: originalTotal,
          });

          return (
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 line-through">
                {originalPrice}
              </span>
              <span className="text-green-600 font-semibold">{totalPrice}</span>
            </div>
          );
        }

        return <span>{totalPrice}</span>;
      },
    },
  ];
  return (
    <>
      <Table
        //@ts-ignore
        columns={columns}
        emptyText={() => (
          <div className="flex flex-col items-center py-7">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
        data={items!}
        rowKey="id"
        scroll={{ x: 300 }}
      />
    </>
  );
};

export default OrderItemList;
