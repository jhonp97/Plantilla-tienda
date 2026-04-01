/**
 * Product Types - Matching backend Product model
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  taxRate: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  isActive?: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  taxRate: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
