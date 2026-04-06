import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteCategoryUseCase } from '../category/DeleteCategoryUseCase';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockCategoryRepo: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
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

    useCase = new DeleteCategoryUseCase(mockCategoryRepo);
  });

  it('should delete category without products', async () => {
    const existingCategory = {
      id: 'cat-123',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic products',
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCategoryRepo.findById.mockResolvedValue(existingCategory);
    mockCategoryRepo.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'cat-123' });

    expect(mockCategoryRepo.delete).toHaveBeenCalledWith('cat-123');
  });

  it('should throw error if category has products', async () => {
    const existingCategory = {
      id: 'cat-123',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic products',
      products: [
        {
          id: 'prod-1',
          name: 'Product',
          slug: 'product',
          description: 'Description',
          price: 5000,
          stockQuantity: 10,
          categoryId: 'cat-123',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCategoryRepo.findById.mockResolvedValue(existingCategory);

    await expect(useCase.execute({ id: 'cat-123' })).rejects.toThrow('Cannot delete category with associated products');
  });

  it('should throw error if category not found', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('Category not found');
  });
});