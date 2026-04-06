import type { IProductImageRepository } from '../../../domain/repositories/IProductImageRepository';
import type { ICloudinaryService } from '../../../domain/services/ICloudinaryService';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

export interface DeleteImagesInput {
  imageIds: string[];
}

export class DeleteImagesUseCase {
  constructor(
    private readonly imageRepository: IProductImageRepository,
    private readonly cloudinaryService: ICloudinaryService
  ) {}

  async execute(input: DeleteImagesInput): Promise<void> {
    if (!input.imageIds || input.imageIds.length === 0) {
      throw new ValidationError('At least one image ID is required');
    }

    // Get images to delete
    const imagesToDelete = [];
    for (const imageId of input.imageIds) {
      const image = await this.imageRepository.findById(imageId);
      if (!image) {
        throw new NotFoundError(`Image with ID ${imageId} not found`, 'Image');
      }
      imagesToDelete.push(image);
    }

    // Delete from Cloudinary
    const publicIds = imagesToDelete.map((img) => img.publicId);
    await this.cloudinaryService.deleteImages(publicIds);

    // Delete from database
    await this.imageRepository.deleteMany(input.imageIds);
  }
}