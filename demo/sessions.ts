import { randomUUID } from 'node:crypto';
import { emptyCart, updateCart } from './catalog';
import type { CartSnapshot } from './catalog';
import type { CartRepository } from './tools';

export function createDemoSessions() {
  const sessions = new Map<string, { cart: CartSnapshot; updated: number }>();
  function session(id: unknown) {
    if (typeof id !== 'string' || !sessions.has(id)) throw new Error('Demo session unavailable.');
    const entry = sessions.get(id)!;
    entry.updated = Date.now();
    return entry;
  }
  return {
    identify(cookie = '') {
      for (const [id, value] of sessions)
        if (Date.now() - value.updated > 3600000) sessions.delete(id);
      const current = /(?:^|;\s*)orfin_demo=([a-f0-9-]{36})(?:;|$)/.exec(cookie)?.[1];
      if (current && sessions.has(current)) return { id: current };
      if (sessions.size >= 500) throw new Error('Demo session limit reached.');
      const id = randomUUID();
      sessions.set(id, { cart: emptyCart(), updated: Date.now() });
      return { id, cookie: `orfin_demo=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600` };
    },
    carts: {
      get: (context) => session(context.identity).cart,
      set: (cart, context) => {
        session(context.identity).cart = cart;
      },
    } satisfies CartRepository,
    read: (id: string) => session(id).cart,
    change(id: string, input: unknown) {
      if (!input || typeof input !== 'object') throw new Error('Invalid cart action.');
      const data = input as Record<string, unknown>;
      if (
        typeof data.productId !== 'string' ||
        !['add', 'set', 'remove'].includes(String(data.operation)) ||
        typeof data.quantity !== 'number'
      )
        throw new Error('Invalid cart action.');
      const entry = session(id);
      entry.cart = updateCart(
        entry.cart,
        data.productId,
        data.operation as 'add' | 'set' | 'remove',
        data.quantity,
      );
      return entry.cart;
    },
  };
}
