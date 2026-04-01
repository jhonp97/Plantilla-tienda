import { useCartStore } from '@store/cartStore';
import { apiGet, apiPost, apiDelete } from './api';
import type { CartItem } from '@store/cartStore';

const deps = {
  getCartId: () => useCartStore.getState().getCartId(),
  logout: () => {
    // Cart service doesn't trigger logout directly
  },
};

export async function getCart(): Promise<CartItem[]> {
  return apiGet<CartItem[]>('/api/cart', {}, deps);
}

export async function addItem(productId: string, quantity: number = 1): Promise<CartItem> {
  const item = await apiPost<CartItem>(
    '/api/cart/items',
    { productId, quantity },
    {},
    deps
  );
  useCartStore.getState().addItem(item);
  return item;
}

export async function removeItem(productId: string): Promise<void> {
  await apiDelete<void>(`/api/cart/items/${productId}`, {}, deps);
  useCartStore.getState().removeItem(productId);
}

export async function mergeCartService(): Promise<void> {
  await useCartStore.getState().mergeCart();
}
