import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadImagesUseCase } from '../image/UploadImagesUseCase';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { IProductImageRepository } from '../../domain/repositories/IProductImageRepository';
import type { ICloudinaryService } from '../../domain/services/ICloudinaryService';

describe('UploadImagesUseCase', () => {
  let useCase: UploadImagesUseCase;
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockImageRepo: jest.Mocked<IProductImageRepository>;
  let mockCloudinaryService: jest.Mocked<ICloudinaryService>;

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

    mockImageRepo = {
      create: vi.fn(),
      createMany: vi.fn(),
      findById: vi.fn(),
      findByProductId: vi.fn(),
      findPrimaryByProductId: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      deleteByProductId: vi.fn(),
      countByProductId: vi.fn(),
    } as unknown as jest.Mocked<IProductImageRepository>;

    mockCloudinaryService = {
      uploadImages: vi.fn(),
      deleteImages: vi.fn(),
    } as unknown as jest.Mocked<ICloudinaryService>;

    useCase = new UploadImagesUseCase(mockProductRepo, mockImageRepo, mockCloudinaryService);
  });

  it('should upload images to Cloudinary', async () => {
    const mockProduct = {
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

    const mockFiles = [
      { buffer: Buffer.from('image1'), originalName: 'image1.jpg' },
      { buffer: Buffer.from('image2'), originalName: 'image2.jpg' },
    ];

    const mockUploadResults = [
      { url: 'https://example.com/image1.jpg', publicId: 'products/prod-123/image1' },
      { url: 'https://example.com/image2.jpg', publicId: 'products/prod-123/image2' },
    ];

    const mockImages = [
      {
        id: 'img-1',
        productId: 'prod-123',
        url: 'https://example.com/image1.jpg',
        publicId: 'products/prod-123/image1',
        order: 0,
        createdAt: new Date(),
      },
      {
        id: 'img-2',
        productId: 'prod-123',
        url: 'https://example.com/image2.jpg',
        publicId: 'products/prod-123/image2',
        order: 1,
        createdAt: new Date(),
      },
    ];

    mockProductRepo.findById.mockResolvedValue(mockProduct);
    mockImageRepo.findByProductId.mockResolvedValue([]);
    mockCloudinaryService.uploadImages.mockResolvedValue(mockUploadResults);
    mockImageRepo.createMany.mockResolvedValue(mockImages);

    const result = await useCase.execute({
      productId: 'prod-123',
      files: mockFiles,
    });

    expect(result.images).toHaveLength(2);
    expect(mockCloudinaryService.uploadImages).toHaveBeenCalled();
    expect(mockImageRepo.createMany).toHaveBeenCalled();
  });

  it('should save URLs in DB', async () => {
    const mockProduct = {
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

    const mockFiles = [
      { buffer: Buffer.from('image'), originalName: 'image.jpg' },
    ];

    const mockUploadResults = [
      { url: 'https://example.com/image.jpg', publicId: 'products/prod-123/image' },
    ];

    const mockImages = [
      {
        id: 'img-1',
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
        order: 0,
        createdAt: new Date(),
      },
    ];

    mockProductRepo.findById.mockResolvedValue(mockProduct);
    mockImageRepo.findByProductId.mockResolvedValue([]);
    mockCloudinaryService.uploadImages.mockResolvedValue(mockUploadResults);
    mockImageRepo.createMany.mockResolvedValue(mockImages);

    const result = await useCase.execute({
      productId: 'prod-123',
      files: mockFiles,
    });

    expect(result.images[0].url).toBe('https://example.com/image.jpg');
    expect(result.images[0].publicId).toBe('products/prod-123/image');
  });

  it('should throw error if product not found', async () => {
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        productId: 'non-existent-id',
        files: [{ buffer: Buffer.from('image'), originalName: 'image.jpg' }],
      })
    ).rejects.toThrow('Product not found');
  });

  it('should throw error if no files provided', async () => {
    const mockProduct = {
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

    mockProductRepo.findById.mockResolvedValue(mockProduct);

    await expect(
      useCase.execute({
        productId: 'prod-123',
        files: [],
      })
    ).rejects.toThrow('At least one image file is required');
  });

  it('should handle errors from upload', async () => {
    const mockProduct = {
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

    mockProductRepo.findById.mockResolvedValue(mockProduct);
    mockImageRepo.findByProductId.mockResolvedValue([]);
    mockCloudinaryService.uploadImages.mockRejectedValue(new Error('Upload failed'));

    await expect(
      useCase.execute({
        productId: 'prod-123',
        files: [{ buffer: Buffer.from('image'), originalName: 'image.jpg' }],
      })
    ).rejects.toThrow('Upload failed');
  });
});