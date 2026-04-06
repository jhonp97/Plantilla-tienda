import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductUseCase } from '../product/CreateProductUseCase';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import type { ICloudinaryService } from '../../domain/services/ICloudinaryService';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockCategoryRepo: jest.Mocked<ICategoryRepository>;
  let mockCloudinaryService: ICloudinaryService;

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

    mockCloudinaryService = {
      uploadImages: vi.fn(),
      deleteImages: vi.fn(),
    } as unknown as ICloudinaryService;

    useCase = new CreateProductUseCase(mockProductRepo, mockCategoryRepo, mockCloudinaryService);
  });

  it('should create product with valid data', async () => {
    const dto = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 9999,
      stockQuantity: 10,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
    };

    mockCategoryRepo.findById.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Category', slug: 'category', createdAt: new Date(), updatedAt: new Date() });
    mockProductRepo.existsBySlug.mockResolvedValue(false);
    mockProductRepo.create.mockResolvedValue({
      id: 'prod-123',
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stockQuantity: dto.stockQuantity,
      categoryId: dto.categoryId,
      slug: 'test-product',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.product).toBeDefined();
    expect(result.product.slug).toBe('test-product');
    expect(mockProductRepo.create).toHaveBeenCalled();
  });

  it('should generate unique slug automatically', async () => {
    const dto = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 9999,
      stockQuantity: 10,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
    };

    mockCategoryRepo.findById.mockResolvedValue({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Category', slug: 'category', createdAt: new Date(), updatedAt: new Date() });
    mockProductRepo.existsBySlug.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mockProductRepo.create.mockResolvedValue({
      id: 'prod-123',
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stockQuantity: dto.stockQuantity,
      categoryId: dto.categoryId,
      slug: 'test-product-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.product.slug).toBe('test-product-1');
    expect(mockProductRepo.existsBySlug).toHaveBeenCalledWith('test-product');
    expect(mockProductRepo.existsBySlug).toHaveBeenCalledWith('test-product-1');
  });

  it('should validate that category exists', async () => {
    const dto = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 9999,
      stockQuantity: 10,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
    };

    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow('Category not found');
  });

  it('should throw error if category does not exist', async () => {
    const dto = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 9999,
      stockQuantity: 10,
      categoryId: '223e4567-e89b-12d3-a456-426614174000',
    };

    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow('Category not found');
  });

  it('should handle duplicate slugs by adding suffix', async () => {
    const dto = {
      name: 'Test Product',
      description: 'This is a test product description',
      price: 9999,
      stockQuantity: 10,
      categoryId: '323e4567-e89b-12d3-a456-426614174000',
    };

    mockCategoryRepo.findById.mockResolvedValue({ id: '323e4567-e89b-12d3-a456-426614174000', name: 'Category', slug: 'category', createdAt: new Date(), updatedAt: new Date() });
    mockProductRepo.existsBySlug
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    mockProductRepo.create.mockResolvedValue({
      id: 'prod-123',
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stockQuantity: dto.stockQuantity,
      categoryId: dto.categoryId,
      slug: 'test-product-2',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(dto);

    expect(result.product.slug).toBe('test-product-2');
  });
});