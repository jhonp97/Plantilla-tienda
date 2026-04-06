import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProductBySlugUseCase } from '../product/GetProductBySlugUseCase';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';

describe('GetProductBySlugUseCase', () => {
  let useCase: GetProductBySlugUseCase;
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

    useCase = new GetProductBySlugUseCase(mockProductRepo);
  });

  it('should find product by slug', async () => {
    const mockProduct = {
      id: 'prod-123',
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 9999,
      stockQuantity: 10,
      categoryId: 'cat-123',
      category: {
        id: 'cat-123',
        name: 'Category',
        slug: 'category',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      images: [
        {
          id: 'img-123',
          productId: 'prod-123',
          url: 'https://example.com/image.jpg',
          publicId: 'products/prod-123/image',
          order: 0,
          createdAt: new Date(),
        },
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findBySlug.mockResolvedValue(mockProduct);

    const result = await useCase.execute('test-product');

    expect(result.product).toBeDefined();
    expect(result.product.slug).toBe('test-product');
    expect(result.product.name).toBe('Test Product');
    expect(mockProductRepo.findBySlug).toHaveBeenCalledWith('test-product');
  });

  it('should throw error if product does not exist', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-slug')).rejects.toThrow('Product not found');
  });

  it('should include images and category in result', async () => {
    const mockProduct = {
      id: 'prod-123',
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 9999,
      stockQuantity: 10,
      categoryId: 'cat-123',
      category: {
        id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      images: [
        {
          id: 'img-123',
          productId: 'prod-123',
          url: 'https://example.com/image1.jpg',
          publicId: 'products/prod-123/image1',
          order: 0,
          createdAt: new Date(),
        },
        {
          id: 'img-456',
          productId: 'prod-123',
          url: 'https://example.com/image2.jpg',
          publicId: 'products/prod-123/image2',
          order: 1,
          createdAt: new Date(),
        },
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockProductRepo.findBySlug.mockResolvedValue(mockProduct);

    const result = await useCase.execute('test-product');

    expect(result.product.category).toBeDefined();
    expect(result.product.category?.name).toBe('Electronics');
    expect(result.product.images).toHaveLength(2);
    expect(result.product.images?.[0].order).toBe(0);
  });
});