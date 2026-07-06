export interface Item {
  id: string | number;
  price: number;
  quantity?: number;
  stock?: number;
  discount?: number; // Add discount field
  discountType?: 'percentage' | 'fixed' | null; // Add discount type
  discountTotal?: number;
  originalPrice?: number; // Store original price before discount
  [key: string]: any;
}

export interface UpdateItemInput extends Partial<Omit<Item, 'id'>> {}

export function addItemWithQuantity(
  items: Item[],
  item: Item,
  quantity: number,
) {
  if (quantity <= 0)
    throw new Error("cartQuantity can't be zero or less than zero");
  const existingItemIndex = items.findIndex(
    (existingItem) => existingItem.id === item.id,
  );

  if (existingItemIndex > -1) {
    const newItems = [...items];
    newItems[existingItemIndex].quantity! += quantity;
    return newItems;
  }
  // Initialize discount fields for new item
  return [
    ...items,
    {
      ...item,
      quantity,
      discount: item.discount || 0,
      discountType: item.discountType || null,
      originalPrice: item.originalPrice || item.price,
    },
  ];
}

export function removeItemOrQuantity(
  items: Item[],
  id: Item['id'],
  quantity: number,
) {
  return items.reduce((acc: Item[], item) => {
    if (item.id === id) {
      const newQuantity = item.quantity! - quantity;

      return newQuantity > 0
        ? [...acc, { ...item, quantity: newQuantity }]
        : [...acc];
    }
    return [...acc, item];
  }, []);
}

// Simple CRUD for Item
export function addItem(items: Item[], item: Item) {
  return [
    ...items,
    {
      ...item,
      discount: item.discount || 0,
      discountType: item.discountType || 'fixed',
      originalPrice: item.originalPrice || item.price,
    },
  ];
}

export function getItem(items: Item[], id: Item['id']) {
  return items.find((item) => item.id === id);
}

export function updateItem(
  items: Item[],
  id: Item['id'],
  item: UpdateItemInput,
) {
  return items.map((existingItem) => {
    if (existingItem.id === id) {
      // If updating price, store original price if not already set
      const updatedItem = { ...existingItem, ...item };
      if (item.price !== undefined && !existingItem.originalPrice) {
        updatedItem.originalPrice = existingItem.price;
      }
      return updatedItem;
    }
    return existingItem;
  });
}

export function removeItem(items: Item[], id: Item['id']) {
  return items.filter((existingItem) => existingItem.id !== id);
}

export function inStock(items: Item[], id: Item['id']) {
  const item = getItem(items, id);
  if (item) return item['quantity']! < item['stock']!;
  return false;
}

// New function to apply discount to a specific item
export function applyDiscountToItem(
  items: Item[],
  id: Item['id'],
  discountAmount: number,
  discountType: 'percentage' | 'fixed' = 'fixed',
): Item[] {
  return items.map((item) => {
    if (item.id === id) {
      // Store original price if not already set
      const originalPrice = item.originalPrice || item.price;

      let newPrice = item.price;
      let discount = 0;

      if (discountType === 'percentage') {
        // Percentage discount (e.g., 10% off)
        discount = (originalPrice * discountAmount) / 100;
        newPrice = originalPrice - discount;
      } else {
        // Fixed discount (e.g., $5 off)
        discount = Math.min(discountAmount, originalPrice); // Don't discount below 0
        newPrice = originalPrice - discount;
      }

      return {
        ...item,
        price: Math.max(0, newPrice), // Ensure price doesn't go below 0
        discount: discount,
        discountType: discountType,
        originalPrice: originalPrice,
      };
    }
    return item;
  });
}

// New function to remove discount from a specific item
export function removeDiscountFromItem(items: Item[], id: Item['id']): Item[] {
  return items.map((item) => {
    if (item.id === id && item.originalPrice !== undefined) {
      return {
        ...item,
        price: item.originalPrice,
        discount: 0,
        discountType: 'fixed',
        originalPrice: undefined,
      };
    }
    return item;
  });
}

// Updated calculateItemTotals to consider discounts
export const calculateItemTotals = (items: Item[]) =>
  items.map((item) => ({
    ...item,
    itemTotal: item.price * item.quantity!,
    originalTotal: item.originalPrice
      ? item.originalPrice * item.quantity!
      : item.price * item.quantity!,
    discountTotal: item.discount ? item.discount * item.quantity! : 0,
  }));

// Updated calculateTotal to use discounted prices
export const calculateTotal = (items: Item[]) =>
  items.reduce((total, item) => total + item.price * item.quantity!, 0);

// New function to calculate original total (without discounts)
export const calculateOriginalTotal = (items: Item[]) =>
  items.reduce((total, item) => {
    const price = item.originalPrice || item.price;
    return total + price * item.quantity!;
  }, 0);

// New function to calculate total discount amount
export const calculateTotalDiscount = (items: Item[]) =>
  items.reduce((total, item) => {
    const discount = item.discount || 0;
    return total + discount * item.quantity!;
  }, 0);

export const calculateTotalItems = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.quantity!, 0);

export const calculateUniqueItems = (items: Item[]) => items.length;

interface PriceValues {
  totalAmount: number;
  tax: number;
  shipping_charge: number;
}

// Updated to use the new total calculation
export const calculatePaidTotal = (
  { totalAmount, tax, shipping_charge }: PriceValues,
  discount?: number,
) => {
  let paidTotal = totalAmount + tax + shipping_charge;
  if (discount) {
    paidTotal = paidTotal - discount;
  }
  return paidTotal;
};
