import { describe, expect, it } from 'vitest';
import { analyzeDelivery, dailyDelivery } from '../../demo/analytics';
import { cartSummary, emptyCart, products, updateCart, validateCart } from '../../demo/catalog';
import { createDemoSessions } from '../../demo/sessions';
import { createStudioTools } from '../../demo/tools';
import { workspaceStatistics } from '../../demo/data';
import { DemoCartStore } from '../../demo/cart-store';
import { studioScenario } from '../../demo/studio-mock';
import { DemoReportStore } from '../../demo/report-store';
import { collect, request } from './helpers';
import type { BrowserAction, ToolContext } from '../../src/core/types';

describe('studio data and tools', () => {
  it('does not replace a recent cart snapshot with a late response', () => {
    const store = new DemoCartStore();
    const first = updateCart(emptyCart(), 'luma-27', 'add', 1);
    const second = updateCart(first, 'luma-27', 'add', 1);
    store.accept(second);
    store.accept(first);
    expect(store.get()).toEqual(second);
  });
  it('reconciles chart totals, segment totals and the overview', () => {
    const report = analyzeDelivery();
    expect(report.comparison).toMatchObject({ previous: 48, current: 66, changePercent: 37.5 });
    expect(report.segments.reduce((sum, segment) => sum + segment.current, 0)).toBe(
      report.comparison.current,
    );
    expect(report.segments.reduce((sum, segment) => sum + segment.previous, 0)).toBe(
      report.comparison.previous,
    );
    expect(dailyDelivery.current.reduce((sum, count) => sum + count, 0)).toBe(
      workspaceStatistics.completedTasks,
    );
    expect(report.lastWeek!.delivered).toBe(workspaceStatistics.completedTasks);
    expect(dailyDelivery.previous.reduce((sum, count) => sum + count, 0)).toBe(
      report.weeks.at(-2)!.delivered,
    );
    const { previousStart, previousEnd, currentStart, currentEnd } = report.comparison;
    const days = (start: string, end: string) =>
      (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
    expect(days(previousStart, previousEnd)).toBe(21);
    expect(days(currentStart, currentEnd)).toBe(21);
    expect(Math.round((report.lastWeek!.delivered / report.lastWeek!.planned) * 100) + '%').toBe(
      workspaceStatistics.onTimeDelivery,
    );
  });
  it('preserves visible report filters in tool results and browser actions', async () => {
    const store = new DemoReportStore();
    store.set({ period: 'recent', segment: 'web' });
    const input = request();
    input.page.sections = [{ id: 'delivery-chart', title: 'Report', description: 'Delivery' }];
    const actions: BrowserAction[] = [];
    const tool = createStudioTools({ get: emptyCart, set: () => {} }).find(
      (item) => item.name === 'get_delivery_report',
    )!;
    const result = await tool.execute(
      {},
      {
        request: store.context(input),
        signal: AbortSignal.timeout(1000),
        emitAction: (action) => actions.push(action),
      },
    );
    expect(result).toMatchObject({
      selection: { period: 'recent', segment: 'web' },
      visibleWeeks: analyzeDelivery().weeks.slice(3),
      visibleSegments: [expect.objectContaining({ id: 'web', previous: 24, current: 30 })],
    });
    expect(actions[0]).toEqual({
      type: 'custom',
      name: 'report_view_changed',
      payload: { view: { period: 'recent', segment: 'web' } },
    });
  });
  it('calculates a cart from catalog prices and supports set/remove without mutating old snapshots', () => {
    const original = emptyCart();
    const one = updateCart(original, 'luma-27', 'add', 2);
    const two = updateCart(one, 'luma-32-pro', 'add', 1);
    expect(original.items).toEqual([]);
    expect(cartSummary(two).total).toBe(1297);
    const changed = updateCart(two, 'luma-27', 'set', 1);
    expect(cartSummary(changed).total).toBe(948);
    const removed = updateCart(changed, 'luma-32-pro', 'remove');
    expect(cartSummary(removed).total).toBe(349);
    expect(validateCart(removed)).toBe(true);
    expect(() => updateCart(removed, 'luma-27', 'add', 9)).toThrow();
    expect(() => updateCart(removed, 'unknown', 'add', 1)).toThrow();
    expect(validateCart({ revision: 1, items: [{ productId: 'luma-27', quantity: -1 }] })).toBe(
      false,
    );
  });
  it('isolates visitor carts and retrieves the actual three-star review', async () => {
    const sessions = createDemoSessions();
    const first = sessions.identify();
    const second = sessions.identify();
    expect(first.id).not.toBe(second.id);
    const actions: BrowserAction[] = [];
    const context: ToolContext = {
      signal: AbortSignal.timeout(1000),
      request: request(),
      identity: first.id,
      emitAction: (action) => actions.push(action),
    };
    const tools = createStudioTools(sessions.carts);
    const result = await tools
      .find((tool) => tool.name === 'update_cart')!
      .execute({ productId: 'luma-32-pro', operation: 'add', quantity: 1 }, context);
    expect(result).toMatchObject({ total: 599, checkout: false });
    expect(sessions.read(second.id).items).toHaveLength(0);
    expect(actions).toContainEqual({
      type: 'custom',
      name: 'cart_changed',
      payload: { cart: sessions.read(first.id) },
    });
    expect(sessions.identify(`orfin_demo=${first.id}`).id).toBe(first.id);
    const review = await tools
      .find((tool) => tool.name === 'product_reviews')!
      .execute({ productId: 'luma-32-pro', rating: 3 }, context);
    expect(review).toMatchObject({ reviews: [products[1]!.reviews[1]] });
    expect(actions.at(-1)).toMatchObject({ type: 'navigate', sectionId: 'reviews-luma-32-pro' });
  });
  it('public sample responses execute actual local cart tools, and disabled tools cannot change state', async () => {
    const store = new DemoCartStore();
    const input = request();
    input.messages = [{ role: 'user', content: 'Open Luma 27 and add two to my cart.' }];
    const events = await collect(studioScenario(input, AbortSignal.timeout(10000), store));
    expect(store.get().items).toEqual([{ productId: 'luma-27', quantity: 2 }]);
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'tool',
        tool: expect.objectContaining({ name: 'update_cart', status: 'complete' }),
      }),
    );
    input.features.tools = false;
    await collect(studioScenario(input, AbortSignal.timeout(1000), store));
    expect(store.get().items[0]!.quantity).toBe(2);
  });
});
