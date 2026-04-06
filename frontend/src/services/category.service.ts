/**
 * Category Service - API calls for category management
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/product.types';

const deps = {
  getCartId: () => useCartStore.getState().getCartId(),
  logout: () => useAuthStore.getState().logout(),
};

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>('/api/categories', {}, deps);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiGet<Category>(`/api/categories/slug/${slug}`, {}, deps);
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  return apiGet<Category>(`/api/categories/${id}`, {}, deps);
}

/**
 * Create a new category (admin only)
 */
export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  return apiPost<Category>('/api/categories', data, {}, deps);
}

/**
 * Update an existing category (admin only)
 */
export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  return apiPut<Category>(`/api/categories/${id}`, data, {}, deps);
}

/**
 * Delete a category (admin only)
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiDelete<void>(`/api/categories/${id}`, {}, deps);
}