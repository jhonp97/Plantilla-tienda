import type { ProductImage, CreateProductImageInput } from '../entities/ProductImage';

export interface IProductImageRepository {
  // Create
  create(input: CreateProductImageInput): Promise<ProductImage>;
  createMany(inputs: CreateProductImageInput[]): Promise<ProductImage[]>;

  // Read
  findById(id: string): Promise<ProductImage | null>;
  findByProductId(productId: string): Promise<ProductImage[]>;
  findPrimaryByProductId(productId: string): Promise<ProductImage | null>;

  // Delete
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  deleteByProductId(productId: string): Promise<void>;

  // Utility
  countByProductId(productId: string): Promise<number>;
}