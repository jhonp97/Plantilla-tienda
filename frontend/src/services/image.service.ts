/**
 * Image Service - API calls for product image management
 */

import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { apiPost, apiDelete, apiPut } from './api';
import type { ProductImage } from '../types/product.types';

const deps = {
  getCartId: () => useCartStore.getState().getCartId(),
  logout: () => useAuthStore.getState().logout(),
};

interface ReorderItem {
  imageId: string;
  order: number;
}

/**
 * Upload images for a product (admin only)
 * Uses FormData for file upload
 */
export async function uploadImages(
  productId: string, 
  files: File[]
): Promise<ProductImage[]> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/products/${productId}/images`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload images');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Delete an image (admin only)
 */
export async function deleteImage(imageId: string): Promise<void> {
  await apiDelete<void>(`/api/images/${imageId}`, {}, deps);
}

/**
 * Reorder images for a product (admin only)
 */
export async function reorderImages(
  productId: string, 
  orders: ReorderItem[]
): Promise<void> {
  await apiPut<void>(`/api/products/${productId}/images/reorder`, { orders }, {}, deps);
}

/**
 * Set an image as primary
 */
export async function setPrimaryImage(imageId: string): Promise<void> {
  await apiPost<void>(`/api/images/${imageId}/primary`, {}, {}, deps);
}