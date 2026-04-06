import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { IProductImageRepository } from '../../../domain/repositories/IProductImageRepository';
import type { ICloudinaryService } from '../../../domain/services/ICloudinaryService';
import type { CloudinaryUploadResult } from '../../../domain/services/ICloudinaryService';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { ProductImage } from '../../../domain/entities/ProductImage';

export interface UploadImageInput {
  productId: string;
  files: Array<{
    buffer: Buffer;
    originalName: string;
  }>;
}

export interface UploadImageResult {
  images: ProductImage[];
}

export class UploadImagesUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly imageRepository: IProductImageRepository,
    private readonly cloudinaryService: ICloudinaryService
  ) {}

  async execute(input: UploadImageInput): Promise<UploadImageResult> {
    // Validate product exists
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new NotFoundError('Product not found', 'Product');
    }

    if (!input.files || input.files.length === 0) {
      throw new ValidationError('At least one image file is required');
    }

    // Get existing images to determine order
    const existingImages = await this.imageRepository.findByProductId(input.productId);
    const startOrder = existingImages.length;

    // Upload images to Cloudinary
    const uploadResults = await this.cloudinaryService.uploadImages(
      input.files.map((f) => f.buffer),
      {
        folder: `products/${input.productId}`,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
      }
    );

    // Save images to database
    const createInputs = uploadResults.map((result: CloudinaryUploadResult, index: number) => ({
      productId: input.productId,
      url: result.url,
      publicId: result.publicId,
      order: startOrder + index,
    }));

    const images = await this.imageRepository.createMany(createInputs);

    return { images };
  }
}