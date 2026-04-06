import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategoryUseCase } from '../category/CreateCategoryUseCase';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
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

    useCase = new CreateCategoryUseCase(mockCategoryRepo);
  });

  it('should create category with unique slug', async () => {
    const dto = {
      name: 'Electronics',
      description: 'Electronic products',
    };

    mockCategoryRepo.existsByName.mockResolvedValue(false);
    mockCategoryRepo.existsBySlug.mockResolvedValue(false);
    mockCategoryRepo.create.mockResolvedValue({
      id: 'cat-123',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.category).toBeDefined();
    expect(result.category.slug).toBe('electronics');
    expect(result.category.name).toBe('Electronics');
    expect(mockCategoryRepo.create).toHaveBeenCalled();
  });

  it('should validate unique name', async () => {
    const dto = {
      name: 'Electronics',
      description: 'Electronic products',
    };

    mockCategoryRepo.existsByName.mockResolvedValue(true);

    await expect(useCase.execute(dto)).rejects.toThrow('Category with this name already exists');
  });

  it('should generate unique slug with suffix if duplicate', async () => {
    const dto = {
      name: 'Electronics',
      description: 'Electronic products',
    };

    mockCategoryRepo.existsByName.mockResolvedValue(false);
    mockCategoryRepo.existsBySlug
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mockCategoryRepo.create.mockResolvedValue({
      id: 'cat-123',
      name: 'Electronics',
      slug: 'electronics-1',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.category.slug).toBe('electronics-1');
  });

  it('should handle multiple slug collisions', async () => {
    const dto = {
      name: 'Electronics',
      description: 'Electronic products',
    };

    mockCategoryRepo.existsByName.mockResolvedValue(false);
    mockCategoryRepo.existsBySlug
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mockCategoryRepo.create.mockResolvedValue({
      id: 'cat-123',
      name: 'Electronics',
      slug: 'electronics-2',
      description: 'Electronic products',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.category.slug).toBe('electronics-2');
  });
});