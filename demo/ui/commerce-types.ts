import type { OrfinController } from '../../src/index';
import type { DemoCartStore } from '../cart-store';

export interface ShopProps {
  orfin: OrfinController | null;
  store: DemoCartStore;
  navigate: (path: string) => void;
}
