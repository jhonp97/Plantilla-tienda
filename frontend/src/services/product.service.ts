/**
 * Product Service - API calls for product management
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import type {
  Product,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  PaginatedProducts,
  StockUpdateInput,
} from '../types/product.types';

const deps = {
  getCartId: () => useCartStore.getState().getCartId(),
  logout: () => useAuthStore.getState().logout(),
};

/**
 * Get products with optional filters and pagination
 */
export async function getProducts(filters?: ProductFilters): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
  }

  const queryString = params.toString();
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;
  
  return apiGet<PaginatedProducts>(url, {}, deps);
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  return apiGet<Product>(`/api/products/slug/${slug}`, {}, deps);
}

/**
 * Get product by ID (admin)
 */
export async function getProductById(id: string): Promise<Product> {
  return apiGet<Product>(`/api/products/${id}`, {}, deps);
}

/**
 * Create a new product (admin only)
 */
export async function createProduct(data: CreateProductInput): Promise<Product> {
  return apiPost<Product>('/api/products', data, {}, deps);
}

/**
 * Update an existing product (admin only)
 */
export async function updateProduct(id: string, data: Omit<UpdateProductInput, 'id'>): Promise<Product> {
  return apiPut<Product>(`/api/products/${id}`, data, {}, deps);
}

/**
 * Deactivate a product (soft delete - admin only)
 */
export async function deactivateProduct(id: string): Promise<void> {
  await apiDelete<void>(`/api/products/${id}`, {}, deps);
}

/**
 * Update product stock (admin only)
 */
export async function updateStock(data: StockUpdateInput): Promise<void> {
  await apiPost<void>('/api/products/stock', data, {}, deps);
}

/**
 * Get related products (same category, excluding current product)
 */
export async function getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  return apiGet<Product[]>(`/api/products/${productId}/related?limit=${limit}`, {}, deps);
}