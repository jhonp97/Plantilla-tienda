import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type {
  ICloudinaryService,
  CloudinaryUploadResult,
  TransformOptions,
  UploadOptions
} from '@modules/product/domain/services/ICloudinaryService';
import { WriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export class CloudinaryService implements ICloudinaryService {
  async uploadImage(
    file: Buffer | string,
    options: UploadOptions
  ): Promise<CloudinaryUploadResult> {
    try {
      const uploadOptions: Record<string, unknown> = {
        folder: options.folder,
        resource_type: 'image',
      };

      if (options.allowedFormats) {
        uploadOptions.allowed_formats = options.allowedFormats;
      }
      if (options.maxFileSize) {
        uploadOptions.max_file_size = options.maxFileSize;
      }

      // Handle Buffer or base64 string
      let fileData: Buffer | string = file;
      if (typeof file === 'string') {
        // If it looks like base64, use it directly
        fileData = Buffer.from(file, 'base64');
      }

      const result = await cloudinary.uploader.upload(fileData as string, uploadOptions);

      return this.mapUploadResult(result);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadImages(
    files: (Buffer | string)[],
    options: UploadOptions
  ): Promise<CloudinaryUploadResult[]> {
    const results: CloudinaryUploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadImage(file, options);
      results.push(result);
    }

    return results;
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImages(publicIds: string[]): Promise<void> {
    for (const publicId of publicIds) {
      await this.deleteImage(publicId);
    }
  }

  getOptimizedUrl(publicId: string, options?: TransformOptions): string {
    const transforms: string[] = [];

    if (options?.width) {
      transforms.push(`w_${options.width}`);
    }
    if (options?.height) {
      transforms.push(`h_${options.height}`);
    }
    if (options?.crop) {
      transforms.push(`c_${options.crop}`);
    }
    if (options?.quality) {
      transforms.push(`q_${options.quality}`);
    }
    if (options?.format) {
      transforms.push(`f_${options.format}`);
    }

    const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';

    const cloudName = cloudinary.config().cloud_name || 'demo';
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
  }

  getThumbnailUrl(publicId: string, width: number, height: number): string {
    return this.getOptimizedUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
  }

  private mapUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }
}

// Singleton instance
let cloudinaryServiceInstance: CloudinaryService | null = null;

export function getCloudinaryService(): ICloudinaryService {
  if (!cloudinaryServiceInstance) {
    cloudinaryServiceInstance = new CloudinaryService();
  }
  return cloudinaryServiceInstance;
}