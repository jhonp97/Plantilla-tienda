export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadOptions {
  folder: string;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

export interface ICloudinaryService {
  // Upload
  uploadImage(
    file: Buffer | string,
    options: UploadOptions
  ): Promise<CloudinaryUploadResult>;

  uploadImages(
    files: (Buffer | string)[],
    options: UploadOptions
  ): Promise<CloudinaryUploadResult[]>;

  // Delete
  deleteImage(publicId: string): Promise<void>;
  deleteImages(publicIds: string[]): Promise<void>;

  // URL manipulation
  getOptimizedUrl(publicId: string, options?: TransformOptions): string;
  getThumbnailUrl(publicId: string, width: number, height: number): string;
}