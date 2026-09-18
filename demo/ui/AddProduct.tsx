import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../catalog';
import type { DemoCartStore } from '../cart-store';

export function AddProduct({ product, store }: { product: Product; store: DemoCartStore }) {
  const [state, setState] = useState<'ready' | 'adding' | 'added'>('ready');
  const [error, setError] = useState('');
  return (
    <div className="add-product">
      <button
        className="button primary-button"
        disabled={state === 'adding'}
        onClick={async () => {
          setState('adding');
          setError('');
          try {
            await store.change(product.id, 'add');
            setState('added');
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Could not add this product.');
            setState('ready');
          }
        }}
      >
        {state === 'added' ? <Check size={16} /> : <Plus size={16} />}
        {state === 'adding' ? 'Adding…' : state === 'added' ? 'Add another' : 'Add to demo cart'}
      </button>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
