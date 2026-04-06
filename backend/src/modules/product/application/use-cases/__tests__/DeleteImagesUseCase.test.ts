import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteImagesUseCase } from '../image/DeleteImagesUseCase';
import type { IProductImageRepository } from '../../domain/repositories/IProductImageRepository';
import type { ICloudinaryService } from '../../domain/services/ICloudinaryService';

describe('DeleteImagesUseCase', () => {
  let useCase: DeleteImagesUseCase;
  let mockImageRepo: jest.Mocked<IProductImageRepository>;
  let mockCloudinaryService: jest.Mocked<ICloudinaryService>;

  beforeEach(() => {
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

    useCase = new DeleteImagesUseCase(mockImageRepo, mockCloudinaryService);
  });

  it('should delete images from Cloudinary and DB', async () => {
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

    mockImageRepo.findById
      .mockResolvedValueOnce(mockImages[0])
      .mockResolvedValueOnce(mockImages[1]);
    mockCloudinaryService.deleteImages.mockResolvedValue(undefined);
    mockImageRepo.deleteMany.mockResolvedValue(undefined);

    await useCase.execute({
      imageIds: ['img-1', 'img-2'],
    });

    expect(mockCloudinaryService.deleteImages).toHaveBeenCalledWith([
      'products/prod-123/image1',
      'products/prod-123/image2',
    ]);
    expect(mockImageRepo.deleteMany).toHaveBeenCalledWith(['img-1', 'img-2']);
  });

  it('should throw error if image not found', async () => {
    mockImageRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        imageIds: ['non-existent-id'],
      })
    ).rejects.toThrow('Image not found');
  });

  it('should throw error if no image IDs provided', async () => {
    await expect(
      useCase.execute({
        imageIds: [],
      })
    ).rejects.toThrow('At least one image ID is required');
  });

  it('should delete single image', async () => {
    const mockImage = {
      id: 'img-1',
      productId: 'prod-123',
      url: 'https://example.com/image1.jpg',
      publicId: 'products/prod-123/image1',
      order: 0,
      createdAt: new Date(),
    };

    mockImageRepo.findById.mockResolvedValue(mockImage);
    mockCloudinaryService.deleteImages.mockResolvedValue(undefined);
    mockImageRepo.deleteMany.mockResolvedValue(undefined);

    await useCase.execute({
      imageIds: ['img-1'],
    });

    expect(mockCloudinaryService.deleteImages).toHaveBeenCalledWith([
      'products/prod-123/image1',
    ]);
    expect(mockImageRepo.deleteMany).toHaveBeenCalledWith(['img-1']);
  });
});