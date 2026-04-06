import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProductUseCase } from '../product/UpdateProductUseCase';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockCategoryRepo: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockProductRepo = {
      create: vi.fn(),
      existsBySlug: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
      count: vi.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    mockCategoryRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsBySlug: vi.fn(),
      existsByName: vi.fn(),
    } as unknown as jest.Mocked<ICategoryRepository>;

    useCase = new UpdateProductUseCase(mockProductRepo, mockCategoryRepo);
  });

  it('should update product fields', async () => {
    const existingProduct = {
      id: 'prod-123',
      name: 'Old Product',
      slug: 'old-product',
      description: 'Old description',
      price: 5000,
      stockQuantity: 10,
      categoryId: 'cat-123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findById.mockResolvedValue(existingProduct);
    mockProductRepo.update.mockResolvedValue({
      ...existingProduct,
      name: 'Updated Product',
      description: 'Updated description',
    });

    const result = await useCase.execute({
      id: 'prod-123',
      data: {
        name: 'Updated Product',
        description: 'Updated description',
      },
    });

    expect(result.product.name).toBe('Updated Product');
    expect(result.product.description).toBe('Updated description');
  });

  it('should regenerate slug if name changes', async () => {
    const existingProduct = {
      id: 'prod-123',
      name: 'Old Product',
      slug: 'old-product',
      description: 'Description',
      price: 5000,
      stockQuantity: 10,
      categoryId: 'cat-123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findById.mockResolvedValue(existingProduct);
    mockProductRepo.existsBySlug.mockResolvedValue(false);
    mockProductRepo.update.mockResolvedValue({
      ...existingProduct,
      name: 'New Product',
      slug: 'new-product',
    });

    const result = await useCase.execute({
      id: 'prod-123',
      data: {
        name: 'New Product',
      },
    });

    expect(result.product.slug).toBe('new-product');
  });

  it('should throw error if product does not exist', async () => {
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'non-existent-id',
        data: {
          name: 'Updated Product',
        },
      })
    ).rejects.toThrow('Product not found');
  });

  it('should validate category if provided', async () => {
    const existingProduct = {
      id: 'prod-123',
      name: 'Product',
      slug: 'product',
      description: 'Description',
      price: 5000,
      stockQuantity: 10,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findById.mockResolvedValue(existingProduct);
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'prod-123',
        data: {
          categoryId: '223e4567-e89b-12d3-a456-426614174001',
        },
      })
    ).rejects.toThrow('Category not found');
  });

  it('should update price and stock correctly', async () => {
    const existingProduct = {
      id: 'prod-123',
      name: 'Product',
      slug: 'product',
      description: 'Description',
      price: 5000,
      stockQuantity: 10,
      categoryId: 'cat-123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findById.mockResolvedValue(existingProduct);
    mockProductRepo.update.mockResolvedValue({
      ...existingProduct,
      price: 15000,
      stockQuantity: 50,
    });

    const result = await useCase.execute({
      id: 'prod-123',
      data: {
        price: 15000,
        stockQuantity: 50,
      },
    });

    expect(result.product.price).toBe(15000);
    expect(result.product.stockQuantity).toBe(50);
  });
});