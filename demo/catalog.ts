export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Displays' | 'Desk essentials';
  price: number;
  tagline: string;
  description: string;
  color: string;
  art: 'compact' | 'pro' | 'light' | 'bag';
  specs: Record<string, string>;
  suitableFor: string;
  limitations: string[];
  stock: number;
  reviews: ProductReview[];
}

export const products: Product[] = [
  {
    id: 'luma-27',
    name: 'Luma 27',
    category: 'Displays',
    price: 34900,
    tagline: 'A clearer everyday workspace.',
    color: 'blue',
    art: 'compact',
    stock: 14,
    description:
      'A compact 27-inch 4K display for writing, web design and a desk that needs a little breathing room. One USB-C connection carries video and up to 65 W of charging.',
    specs: {
      Screen: '27 inches',
      Resolution: '3840 × 2160 (4K)',
      'Refresh rate': '60 Hz',
      'Color coverage': '99% sRGB',
      'USB-C charging': '65 W',
      Brightness: '350 nits',
      'Desk footprint': '22 × 19 cm',
      Weight: '5.2 kg',
      Warranty: '2 years',
    },
    suitableFor:
      'Web designers, writers and smaller desks; the lower-cost option for everyday 4K work.',
    limitations: [
      '60 Hz is not intended for competitive gaming.',
      '65 W cannot fully power a laptop that requires more than 65 W under load.',
      'No claimed DCI-P3 coverage or HDR mastering capability.',
    ],
    reviews: [
      {
        id: 'l27-1',
        author: 'Alex Rivera',
        rating: 5,
        date: '2026-09-10',
        title: 'Just enough desk, plenty of screen',
        text: 'Sharp type and a small stand. It fits my 100 cm desk with room left for a notebook.',
      },
      {
        id: 'l27-2',
        author: 'Sam Park',
        rating: 4,
        date: '2026-09-08',
        title: 'Good for my everyday design work',
        text: 'Web layouts look crisp. I use a separate charger for my high-power laptop.',
      },
    ],
  },
  {
    id: 'luma-32-pro',
    name: 'Luma 32 Pro',
    category: 'Displays',
    price: 59900,
    tagline: 'Room for the whole picture.',
    color: 'peach',
    art: 'pro',
    stock: 6,
    description:
      'A 32-inch 4K display with 98% DCI-P3 coverage. More space for timelines, side-by-side designs and color-focused studio work, with a 90 W USB-C connection.',
    specs: {
      Screen: '32 inches',
      Resolution: '3840 × 2160 (4K)',
      'Refresh rate': '60 Hz',
      'Color coverage': '98% DCI-P3',
      'USB-C charging': '90 W',
      Brightness: '450 nits',
      'Desk footprint': '28 × 24 cm',
      Weight: '7.8 kg',
      Warranty: '3 years',
    },
    suitableFor:
      'Editors and designers who need a larger canvas and specified wide-gamut coverage, with room for its larger stand.',
    limitations: [
      'Costs $250 more than Luma 27.',
      '90 W is insufficient for a laptop requiring 140 W under load.',
      'The 28 × 24 cm stand needs more desk depth.',
      '60 Hz; no claim of HDR mastering accuracy.',
    ],
    reviews: [
      {
        id: 'l32-1',
        author: 'Nina Patel',
        rating: 5,
        date: '2026-09-12',
        title: 'A whole timeline at once',
        text: 'The larger canvas makes editing easier. I can keep reference material beside my timeline.',
      },
      {
        id: 'l32-2',
        author: 'Maya Chen',
        rating: 3,
        date: '2026-09-14',
        title: 'Beautiful color, two practical compromises',
        text: 'Beautiful color, but my laptop still needs its charger. It needs 140 W under load; this display supplies 90 W. The 28 × 24 cm stand takes too much space on my small desk.',
      },
      {
        id: 'l32-3',
        author: 'Jon Bell',
        rating: 4,
        date: '2026-09-16',
        title: 'Great for layouts, not fast games',
        text: 'I like the extra room for layouts. The 60 Hz refresh rate is fine for work, but I use another screen for gaming.',
      },
    ],
  },
  {
    id: 'arc-light',
    name: 'Arc Desk Light',
    category: 'Desk essentials',
    price: 8900,
    tagline: 'Light where the work happens.',
    color: 'green',
    art: 'light',
    stock: 21,
    description:
      'A dimmable desk light with an adjustable arm and three color temperatures. A weighted base keeps it steady beside your display.',
    specs: {
      Brightness: '650 lumens',
      'Color temperature': '2700 / 4000 / 5000 K',
      Power: '12 W, wall adapter included',
      'Desk footprint': '16 × 16 cm',
      Warranty: '2 years',
    },
    suitableFor: 'Reading, sketching and changing light through the working day.',
    limitations: ['Requires a wall outlet; no battery.', 'Not a calibrated color-proofing light.'],
    reviews: [
      {
        id: 'arc-1',
        author: 'Elena Ross',
        rating: 5,
        date: '2026-09-11',
        title: 'My evening sketching companion',
        text: 'The warm setting and adjustable arm make long sketching sessions more comfortable.',
      },
    ],
  },
  {
    id: 'field-carry',
    name: 'Field Carry',
    category: 'Desk essentials',
    price: 7900,
    tagline: 'Your studio, for the road.',
    color: 'lavender',
    art: 'bag',
    stock: 18,
    description:
      'An 18-liter everyday bag with a padded 14-inch laptop sleeve, a document pocket and a water-resistant outer fabric.',
    specs: {
      Capacity: '18 liters',
      'Laptop sleeve': 'Up to 14 inches',
      Weight: '620 g',
      Material: 'Recycled polyester',
      Warranty: '2 years',
    },
    suitableFor: 'Short commutes and compact mobile setups.',
    limitations: [
      'The laptop sleeve does not fit a 16-inch laptop.',
      'Water-resistant fabric, not waterproof construction.',
    ],
    reviews: [
      {
        id: 'field-1',
        author: 'Chris Lee',
        rating: 4,
        date: '2026-09-09',
        title: 'A lighter commute',
        text: 'My 14-inch laptop fits well. I would choose a larger bag for overnight travel.',
      },
    ],
  },
];

export const productIds = products.map((product) => product.id);
export const productById = (id: string) => products.find((product) => product.id === id);
export const money = (cents: number, locale = 'en') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export interface CartItem {
  productId: string;
  quantity: number;
}
export interface CartSnapshot {
  revision: number;
  items: CartItem[];
}
export const emptyCart = (): CartSnapshot => ({ revision: 0, items: [] });

export function validateCart(value: unknown): value is CartSnapshot {
  if (!value || typeof value !== 'object') return false;
  const cart = value as CartSnapshot;
  return (
    Number.isSafeInteger(cart.revision) &&
    cart.revision >= 0 &&
    Array.isArray(cart.items) &&
    cart.items.length <= products.length &&
    new Set(cart.items.map((item) => item?.productId)).size === cart.items.length &&
    cart.items.every(
      (item) =>
        item &&
        productIds.includes(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 9,
    )
  );
}

export function updateCart(
  cart: CartSnapshot,
  productId: string,
  operation: 'add' | 'set' | 'remove',
  quantity = 1,
): CartSnapshot {
  const product = productById(productId);
  if (!product || !Number.isInteger(quantity) || quantity < 0 || quantity > 9)
    throw new Error('Choose a valid product and quantity from 0 to 9.');
  const current = cart.items.find((item) => item.productId === productId)?.quantity ?? 0;
  const nextQuantity =
    operation === 'remove' ? 0 : operation === 'add' ? current + quantity : quantity;
  if (nextQuantity > Math.min(9, product.stock) || (operation === 'add' && !quantity))
    throw new Error('The requested quantity exceeds the demo limit or stock.');
  const items = cart.items.filter((item) => item.productId !== productId);
  if (nextQuantity) items.push({ productId, quantity: nextQuantity });
  return { revision: cart.revision + 1, items };
}

export function cartSummary(cart: CartSnapshot) {
  const items = cart.items.map((item) => ({
    ...item,
    name: productById(item.productId)!.name,
    unitPrice: productById(item.productId)!.price / 100,
  }));
  return {
    ...cart,
    items,
    currency: 'USD',
    total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    checkout: false,
    source: 'Northstar equipment catalog, fictional demo prices',
  };
}
