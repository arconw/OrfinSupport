import { emptyCart, updateCart, validateCart } from './catalog';
import type { CartSnapshot } from './catalog';

export class DemoCartStore {
  private cart = emptyCart();
  private demoCart = this.cart;
  private listeners = new Set<() => void>();
  private mode: 'demo' | 'live' = 'demo';
  private ready: Promise<void> = Promise.resolve();
  private pending = Promise.resolve();
  private generation = 0;
  get = () => this.cart;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  replace = (cart: CartSnapshot) => {
    if (!validateCart(cart)) throw new Error('Invalid demo cart response.');
    this.cart = cart;
    if (this.mode === 'demo') this.demoCart = cart;
    this.listeners.forEach((listener) => listener());
  };
  accept = (cart: CartSnapshot) => {
    if (!validateCart(cart)) throw new Error('Invalid demo cart response.');
    if (cart.revision >= this.cart.revision) this.replace(cart);
  };
  async switchMode(mode: 'demo' | 'live') {
    const generation = ++this.generation;
    this.mode = mode;
    this.ready =
      mode === 'demo'
        ? Promise.resolve(this.replace(this.demoCart))
        : this.request('GET').then((cart) => {
            if (this.generation === generation) this.replace(cart);
          });
    await this.ready;
  }
  async whenReady() {
    try {
      await this.ready;
    } catch (error) {
      if (this.mode !== 'live') throw error;
      const generation = this.generation;
      this.ready = this.request('GET').then((cart) => {
        if (this.generation === generation) this.accept(cart);
      });
      await this.ready;
    }
  }
  change(productId: string, operation: 'add' | 'set' | 'remove', quantity = 1) {
    const mode = this.mode;
    const generation = this.generation;
    const operationPromise = this.pending.then(async () => {
      await this.whenReady();
      if (this.mode !== mode) return;
      const cart =
        mode === 'demo'
          ? updateCart(this.cart, productId, operation, quantity)
          : await this.request('PATCH', { productId, operation, quantity });
      if (this.generation === generation) this.accept(cart);
    });
    this.pending = operationPromise.catch(() => {});
    return operationPromise;
  }
  private async request(method: string, body?: unknown): Promise<CartSnapshot> {
    const response = await fetch('/api/cart', {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok)
      throw new Error(
        response.status === 400
          ? 'The requested quantity is unavailable. Choose 0–9 per product.'
          : 'Could not update the demo cart. Try again.',
      );
    const cart: unknown = await response.json();
    if (!validateCart(cart)) throw new Error('Invalid demo cart response.');
    return cart;
  }
}
