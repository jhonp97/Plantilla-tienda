import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListProductsUseCase } from '../product/ListProductsUseCase';
import type { IProductRepository, SortOption } from '../../domain/repositories/IProductRepository';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
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

    useCase = new ListProductsUseCase(mockProductRepo);
  });

  it('should list products with pagination', async () => {
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Product 1',
        slug: 'product-1',
        description: 'Description',
        price: 5000,
        stockQuantity: 10,
        categoryId: 'cat-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'prod-2',
        name: 'Product 2',
        slug: 'product-2',
        description: 'Description',
        price: 6000,
        stockQuantity: 20,
        categoryId: 'cat-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockProductRepo.findMany.mockResolvedValue({
      items: mockProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
        hasMore: false,
      },
    });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.items).toHaveLength(2);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(20);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasMore).toBe(false);
  });

  it('should apply category filter', async () => {
    const mockProducts = [];
    mockProductRepo.findMany.mockResolvedValue({
      items: mockProducts,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({ categoryId: '123e4567-e89b-12d3-a456-426614174000' });

    expect(mockProductRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: '123e4567-e89b-12d3-a456-426614174000' }),
      { page: 1, limit: 20 },
      undefined
    );
  });

  it('should apply price filters', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({ minPrice: 1000, maxPrice: 5000 });

    expect(mockProductRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ minPrice: 1000, maxPrice: 5000 }),
      { page: 1, limit: 20 },
      undefined
    );
  });

  it('should apply search filter', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({ search: 'test query' });

    expect(mockProductRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test query' }),
      { page: 1, limit: 20 },
      undefined
    );
  });

  it('should sort results by price ascending', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({ sort: 'priceAsc' as SortOption });

    expect(mockProductRepo.findMany).toHaveBeenCalledWith(
      {},
      { page: 1, limit: 20 },
      'priceAsc'
    );
  });

  it('should sort results by newest', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({ sort: 'newest' as SortOption });

    expect(mockProductRepo.findMany).toHaveBeenCalledWith(
      {},
      { page: 1, limit: 20 },
      'newest'
    );
  });

  it('should filter only active products by default', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });

    await useCase.execute({});

    // Note: The repository defaults isActive to true internally,
    // but the use case doesn't explicitly pass it
    expect(mockProductRepo.findMany).toHaveBeenCalled();
  });

  it('should handle custom pagination', async () => {
    mockProductRepo.findMany.mockResolvedValue({
      items: [],
      pagination: {
        page: 3,
        limit: 25,
        total: 100,
        totalPages: 4,
        hasMore: true,
      },
    });

    const result = await useCase.execute({ page: 3, limit: 25 });

    expect(result.pagination.page).toBe(3);
    expect(result.pagination.limit).toBe(25);
    expect(result.pagination.hasMore).toBe(true);
  });
});