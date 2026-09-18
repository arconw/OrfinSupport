import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { money, productById } from '../catalog';
import type { DemoCartStore } from '../cart-store';

export function CartStatus({
  store,
  navigate,
}: {
  store: DemoCartStore;
  navigate: (path: string) => void;
}) {
  const cart = useSyncExternalStore(store.subscribe, store.get);
  if (!cart.items.length) return null;
  const total = cart.items.reduce(
    (sum, item) => sum + productById(item.productId)!.price * item.quantity,
    0,
  );
  return (
    <div className="cart-status" role="status">
      <ShoppingBag size={17} />
      <span>
        {cart.items
          .map((item) => `${item.quantity} × ${productById(item.productId)!.name}`)
          .join(', ')}
        <strong>{money(total)} in your demo cart</strong>
      </span>
      <button onClick={() => navigate('/shop')}>View cart</button>
    </div>
  );
}

export function Cart({
  store,
  navigate,
}: {
  store: DemoCartStore;
  navigate: (path: string) => void;
}) {
  const cart = useSyncExternalStore(store.subscribe, store.get);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const total = cart.items.reduce(
    (sum, item) => sum + productById(item.productId)!.price * item.quantity,
    0,
  );
  const change = async (id: string, operation: 'set' | 'remove', quantity: number) => {
    setBusy(true);
    setError('');
    try {
      await store.change(id, operation, quantity);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not update the cart.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="cart-panel" data-orfin-section="demo-cart" aria-label="Demo cart">
      <div className="section-heading">
        <h2>
          <ShoppingBag size={17} /> Your shortlist
        </h2>
        <output className="cart-count" aria-label="Cart item count">
          {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
        </output>
      </div>
      {!cart.items.length ? (
        <p className="cart-empty">
          Room for your next good idea.
          <br />
          Add something yourself, or ask Orfin.
        </p>
      ) : (
        <ul className="cart-items">
          {cart.items.map((item) => {
            const product = productById(item.productId)!;
            return (
              <li key={item.productId}>
                <div className="cart-item-heading">
                  <button onClick={() => navigate(`/shop/${product.id}`)}>{product.name}</button>
                  <strong>{money(product.price * item.quantity)}</strong>
                </div>
                <div className="cart-quantity">
                  <button
                    aria-label={`Decrease ${product.name} quantity`}
                    disabled={busy}
                    onClick={() => void change(product.id, 'set', item.quantity - 1)}
                  >
                    <Minus size={13} />
                  </button>
                  <output aria-label={`${product.name} quantity`}>{item.quantity}</output>
                  <button
                    aria-label={`Increase ${product.name} quantity`}
                    disabled={busy || item.quantity >= Math.min(9, product.stock)}
                    onClick={() => void change(product.id, 'set', item.quantity + 1)}
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    className="cart-remove"
                    aria-label={`Remove ${product.name}`}
                    disabled={busy}
                    onClick={() => void change(product.id, 'remove', 0)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="cart-total" role="status" aria-live="polite">
        <span>Demo total</span>
        <strong>{money(total)}</strong>
      </div>
      <p className="cart-note">A working cart. No checkout, no charges.</p>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
