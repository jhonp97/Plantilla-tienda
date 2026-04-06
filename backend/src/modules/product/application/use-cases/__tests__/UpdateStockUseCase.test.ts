import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateStockUseCase } from '../product/UpdateStockUseCase';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';

describe('UpdateStockUseCase', () => {
  let useCase: UpdateStockUseCase;
  let mockProductRepo: jest.Mocked<IProductRepository>;

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

    useCase = new UpdateStockUseCase(mockProductRepo);
  });

  it('should update stock correctly', async () => {
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
      stockQuantity: 50,
    });

    const result = await useCase.execute({
      productId: 'prod-123',
      quantity: 50,
    });

    expect(result.product.stockQuantity).toBe(50);
    expect(mockProductRepo.update).toHaveBeenCalledWith('prod-123', {
      stockQuantity: 50,
    });
  });

  it('should throw error if quantity is negative', async () => {
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

    await expect(
      useCase.execute({
        productId: 'prod-123',
        quantity: -5,
      })
    ).rejects.toThrow('Stock quantity cannot be negative');
  });

  it('should throw error if product does not exist', async () => {
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        productId: 'non-existent-id',
        quantity: 50,
      })
    ).rejects.toThrow('Product not found');
  });

  it('should allow setting stock to zero', async () => {
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
      stockQuantity: 0,
    });

    const result = await useCase.execute({
      productId: 'prod-123',
      quantity: 0,
    });

    expect(result.product.stockQuantity).toBe(0);
  });
});