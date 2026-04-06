import type { Product, CreateProductInput, UpdateProductInput } from '../entities/Product';

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type SortOption = 'priceAsc' | 'priceDesc' | 'newest' | 'nameAsc';

export interface IProductRepository {
  // Create
  create(input: CreateProductInput): Promise<Product>;

  // Read
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(
    filters?: ProductFilters,
    pagination?: PaginationParams,
    sort?: SortOption
  ): Promise<PaginatedResult<Product>>;

  // Update
  update(id: string, data: UpdateProductInput): Promise<Product>;

  // Delete (soft delete)
  deactivate(id: string): Promise<Product>;

  // Utility
  existsBySlug(slug: string): Promise<boolean>;
  count(filters?: ProductFilters): Promise<number>;
}