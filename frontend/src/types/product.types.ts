/**
 * Product Types - Matching backend Product model with full details
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  taxRate: number;
  isActive: boolean;
  images: ProductImage[];
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categorySlug?: string;
  isActive?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  taxRate: number;
  isActive: boolean;
  categoryId?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  taxRate?: number;
  isActive?: boolean;
  categoryId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockUpdateInput {
  productId: string;
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
}