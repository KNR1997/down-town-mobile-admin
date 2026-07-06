import isEmpty from 'lodash/isEmpty';

interface Item {
  id: string | number;
  name: string;
  slug: string;
  image: {
    thumbnail: string;
    [key: string]: unknown;
  };
  price: string;
  sale_price?: string;
  quantity?: number;
  [key: string]: unknown;
}

interface Variation {
  id: string | number;
  title: string;
  price: number;
  sale_price?: number;
  quantity: number;
  [key: string]: unknown;
}

export function generateCartItem(item: Item, variation: Variation) {
  const {
    id,
    name,
    slug,
    image,
    price,
    sale_price,
    quantity,
    unit,
    is_digital,
  } = item;

  // Helper function to convert string to number
  const parsePrice = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value) || 0;
  };

  if (!isEmpty(variation)) {
    return {
      id: `${id}.${variation.id}`,
      productId: id,
      name: `${name} - ${variation.title}`,
      slug,
      unit,
      is_digital,
      stock: variation.quantity,
      price: variation.sale_price
        ? parsePrice(variation.sale_price)
        : parsePrice(variation.price),
      image: image?.thumbnail,
      variationId: variation.id,
    };
  }

  return {
    id,
    name,
    slug,
    unit,
    is_digital,
    image: image?.thumbnail,
    stock: quantity,
    price: sale_price ? parsePrice(sale_price) : parsePrice(price),
  };
}
