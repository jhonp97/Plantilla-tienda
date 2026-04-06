/**
 * Product Store - Zustand state management for products
 */

import { create } from 'zustand';
import type {
  Product,
  Category,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  ProductImage,
} from '../types/product.types';
import * as productService from '../services/product.service';
import * as categoryService from '../services/category.service';

interface ProductState {
  // Products
  products: Product[];
  selectedProduct: Product | null;
  relatedProducts: Product[];
  
  // Categories
  categories: Category[];
  
  // Filters & Pagination
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions - Products
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductBySlug: (slug: string) => Promise<void>;
  fetchRelatedProducts: (productId: string, limit?: number) => Promise<void>;
  clearSelectedProduct: () => void;
  
  // Actions - Filters
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  
  // Actions - Categories
  fetchCategories: () => Promise<void>;
  
  // Actions - Admin
  createProduct: (data: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, data: Omit<UpdateProductInput, 'id'>) => Promise<Product>;
  deactivateProduct: (id: string) => Promise<void>;
  createCategory: (data: { name: string; description?: string }) => Promise<Category>;
  updateCategory: (id: string, data: { name: string; description?: string }) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

const DEFAULT_LIMIT = 12;

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial State
  products: [],
  selectedProduct: null,
  relatedProducts: [],
  categories: [],
  filters: {},
  pagination: {
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  // Products Actions
  fetchProducts: async (filters?: ProductFilters) => {
    set({ isLoading: true, error: null });
    
    const currentFilters = filters || get().filters;
    const pagination = get().pagination;
    
    try {
      const result = await productService.getProducts({
        ...currentFilters,
        page: pagination.page,
        limit: pagination.limit,
      });
      
      set({
        products: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      });
    }
  },

  fetchProductBySlug: async (slug: string) => {
    set({ isLoading: true, error: null, selectedProduct: null });
    
    try {
      const product = await productService.getProductBySlug(slug);
      set({ selectedProduct: product, isLoading: false });
      
      // Also fetch related products
      get().fetchRelatedProducts(product.id);
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Product not found',
      });
    }
  },

  fetchRelatedProducts: async (productId: string, limit: number = 4) => {
    try {
      const related = await productService.getRelatedProducts(productId, limit);
      set({ relatedProducts: related });
    } catch {
      // Silently fail for related products
      set({ relatedProducts: [] });
    }
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null, relatedProducts: [] });
  },

  // Filters Actions
  setFilters: (filters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter change
    }));
    get().fetchProducts();
  },

  resetFilters: () => {
    set({
      filters: {},
      pagination: { page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 0 },
    });
    get().fetchProducts();
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchProducts();
  },

  // Categories Actions
  fetchCategories: async () => {
    try {
      const categories = await categoryService.getCategories();
      set({ categories });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      });
    }
  },

  // Admin Actions
  createProduct: async (data: CreateProductInput) => {
    set({ isLoading: true, error: null });
    
    try {
      const product = await productService.createProduct(data);
      set((state) => ({
        products: [product, ...state.products],
        isLoading: false,
      }));
      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      });
      throw error;
    }
  },

  updateProduct: async (id: string, data: Omit<UpdateProductInput, 'id'>) => {
    set({ isLoading: true, error: null });
    
    try {
      const product = await productService.updateProduct(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
        selectedProduct: state.selectedProduct?.id === id ? product : state.selectedProduct,
        isLoading: false,
      }));
      return product;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      });
      throw error;
    }
  },

  deactivateProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await productService.deactivateProduct(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to deactivate product',
      });
      throw error;
    }
  },

  createCategory: async (data: { name: string; description?: string }) => {
    set({ isLoading: true, error: null });
    
    try {
      const category = await categoryService.createCategory(data);
      set((state) => ({
        categories: [...state.categories, category],
        isLoading: false,
      }));
      return category;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
      throw error;
    }
  },

  updateCategory: async (id: string, data: { name: string; description?: string }) => {
    set({ isLoading: true, error: null });
    
    try {
      const category = await categoryService.updateCategory(id, data);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? category : c)),
        isLoading: false,
      }));
      return category;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await categoryService.deleteCategory(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      });
      throw error;
    }
  },
}));