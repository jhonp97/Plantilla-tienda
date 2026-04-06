import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../entities/Category';

export interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryRepository {
  // Create
  create(input: CreateCategoryInput): Promise<Category>;

  // Read
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findAll(): Promise<CategoryWithProductCount[]>;

  // Update
  update(id: string, data: UpdateCategoryInput): Promise<Category>;

  // Delete
  delete(id: string): Promise<void>;

  // Utility
  existsBySlug(slug: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}