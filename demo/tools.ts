import type { Tool, ToolContext } from '../src/core/types';
import { analyzeDelivery } from './analytics';
import { cartSummary, productById, productIds, products, updateCart } from './catalog';
import type { CartSnapshot } from './catalog';
import { reportViewFromRequest, type ReportView } from './report-store';

export interface CartRepository {
  get(context: ToolContext): CartSnapshot;
  set(cart: CartSnapshot, context: ToolContext): void;
}

const productParameter = { type: 'string', enum: productIds };
const schema = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

export function createStudioTools(carts: CartRepository): Tool[] {
  return [
    {
      name: 'browse_products',
      description:
        'List actual Northstar demo equipment, prices, stock, specifications and limitations. Use for product recommendations and catalog questions.',
      parameters: schema({}),
      execute: () => ({
        products,
        currency: 'USD',
        pricesIn: 'cents',
        source: 'Northstar equipment catalog',
      }),
    },
    {
      name: 'open_product',
      description:
        'Open a specific product detail page and highlight its specifications. Returns its actual price, features and limitations. Call when the visitor asks to open or see a product, including before adding it when both are requested.',
      parameters: schema({ productId: productParameter }),
      execute: (args, context) => {
        const product = productById(String(args.productId))!;
        context.emitAction?.({
          type: 'navigate',
          path: `/shop/${product.id}`,
          sectionId: `product-${product.id}`,
        });
        return {
          product,
          pricesIn: 'cents',
          page: `/shop/${product.id}`,
          status: 'Navigation requested',
          source: 'Northstar equipment catalog',
        };
      },
    },
    {
      name: 'update_cart',
      description:
        'Actually add, set quantity, or remove a product in this visitor’s demo cart. Use ONLY when the visitor requests a cart change. Add increments quantity; set replaces quantity; remove deletes the line. No checkout, payment or order placement exists. The browser updates from the returned cart.',
      parameters: schema({
        productId: productParameter,
        operation: { type: 'string', enum: ['add', 'set', 'remove'] },
        quantity: { type: 'integer', minimum: 0, maximum: 9 },
      }),
      execute: (args, context) => {
        const cart = updateCart(
          carts.get(context),
          String(args.productId),
          args.operation as 'add' | 'set' | 'remove',
          Number(args.quantity),
        );
        carts.set(cart, context);
        context.emitAction?.({ type: 'custom', name: 'cart_changed', payload: { cart } });
        return cartSummary(cart);
      },
    },
    {
      name: 'get_cart',
      description:
        'Read this visitor’s actual demo cart, quantities and total in USD. Never infer the current cart from earlier messages.',
      parameters: schema({}),
      execute: (_args, context) => cartSummary(carts.get(context)),
    },
    {
      name: 'compare_products',
      description:
        'Compare Luma 27 and Luma 32 Pro using actual specs, prices, suitability and limitations; open the side-by-side comparison. No cart changes.',
      parameters: schema({}),
      execute: (_args, context) => {
        context.emitAction?.({
          type: 'navigate',
          path: '/compare',
          sectionId: 'product-comparison',
        });
        return {
          products: products.slice(0, 2),
          priceDifferenceUSD: 250,
          source: 'Northstar equipment catalog; prices in cents',
          caveat:
            'Different color-space percentages are not directly comparable measurements. Neither model claims HDR mastering accuracy.',
        };
      },
    },
    {
      name: 'product_reviews',
      description:
        'Find actual customer reviews for a product, optionally filtered by star rating. The second display, Luma 32 Pro, has a specific 3-star review from Maya Chen. Return exact review text; do not invent reasons. Open and highlight the reviews.',
      parameters: schema(
        { productId: productParameter, rating: { type: 'integer', minimum: 1, maximum: 5 } },
        ['productId'],
      ),
      execute: (args, context) => {
        const product = productById(String(args.productId))!;
        context.emitAction?.({
          type: 'navigate',
          path: `/shop/${product.id}`,
          sectionId: `reviews-${product.id}`,
        });
        return {
          product: product.name,
          reviews: product.reviews.filter(
            (review) => !args.rating || review.rating === args.rating,
          ),
          source: 'Northstar fictional customer reviews',
          caveat:
            'Explain only the reasons the review states. Preserve short exact quotes in their source language, with a translation if useful.',
        };
      },
    },
    {
      name: 'get_delivery_report',
      description:
        'Read studio analytics and its current visible filters. Optional period/segment change the displayed view; omit them to preserve visitor selections from page context. Returns visible chart/table rows plus explicitly labeled full-studio comparison and evidence. Focus on the requested view and distinguish association from causation. Opens the report.',
      parameters: schema(
        {
          period: { type: 'string', enum: ['all', 'recent'] },
          segment: { type: 'string', enum: ['all', 'brand', 'web'] },
        },
        [],
      ),
      execute: (args, context) => {
        const current = reportViewFromRequest(context.request);
        const view: ReportView = {
          period: (args.period ?? current.period) as ReportView['period'],
          segment: (args.segment ?? current.segment) as ReportView['segment'],
        };
        const report = analyzeDelivery();
        context.emitAction?.({ type: 'custom', name: 'report_view_changed', payload: { view } });
        context.emitAction?.({ type: 'navigate', path: '/reports', sectionId: 'delivery-chart' });
        return {
          ...report,
          selection: view,
          visibleWeeks: view.period === 'recent' ? report.weeks.slice(3) : report.weeks,
          visibleSegments: report.segments.filter(
            (item) => view.segment === 'all' || item.id === view.segment,
          ),
          comparisonScope:
            'The 48-to-66 comparison is for the full studio. Segment selection filters only the discipline table, not the studio chart or summary.',
        };
      },
    },
  ];
}
