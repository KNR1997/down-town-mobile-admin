import { Item } from '@/contexts/quick-cart/cart.utils';

export function formatOrderedProduct(item: Item) {
  return {
    product_id: item?.itemId ? item.itemId : item.id,
    ...(item?.variationId ? { variation_option_id: item.variationId } : {}),
    order_quantity: item.quantity,
    unit_price: item.price,
    discount: item.discount,
    discount_type: item.discountType,
    discount_total: item.discountTotal,
    subtotal: item.itemTotal,
  };
}
