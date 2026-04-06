import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';
import type { UploadImagesUseCase } from '../../application/use-cases/image';
import type { DeleteImagesUseCase } from '../../application/use-cases/image';
import type { ReorderImagesUseCase } from '../../application/use-cases/image';
import { DomainError } from '@shared/errors/DomainError';

/**
 * Image Controller
 * Handles HTTP requests for product image endpoints
 * Admin only: POST /products/:productId/images, DELETE /images/:id, PATCH /products/:productId/images/reorder
 */
export class ImageController {
  constructor(
    private readonly uploadImagesUseCase: UploadImagesUseCase,
    private readonly deleteImagesUseCase: DeleteImagesUseCase,
    private readonly reorderImagesUseCase: ReorderImagesUseCase,
  ) {}

  /**
   * POST /api/products/:productId/images
   * Upload images to a product (ADMIN only)
   * Accepts multipart/form-data with multiple files
   */
  upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const files = (req as any).files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No images provided',
        });
        return;
      }

      if (files.length > 10) {
        res.status(400).json({
          success: false,
          error: 'Maximum 10 images allowed per product',
        });
        return;
      }

      const result = await this.uploadImagesUseCase.execute({
        productId,
        files: files.map((f) => ({
          buffer: f.buffer,
          originalName: f.originalname,
        })),
      });

      res.status(201).json({
        success: true,
        data: result.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          publicId: img.publicId,
          order: img.order,
        })),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * DELETE /api/images/:id
   * Delete a specific image (ADMIN only)
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.deleteImagesUseCase.execute({ imageIds: [id] });

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PATCH /api/products/:productId/images/reorder
   * Reorder images for a product (ADMIN only)
   */
  reorder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = req.params.productId as string;
      const { imageOrders } = req.body;

      if (!Array.isArray(imageOrders) || imageOrders.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Image orders array is required',
        });
        return;
      }

      // Validate structure
      for (const item of imageOrders) {
        if (!item.imageId || typeof item.order !== 'number') {
          res.status(400).json({
            success: false,
            error: 'Each image order must have imageId and order',
          });
          return;
        }
      }

      await this.reorderImagesUseCase.execute({ productId, imageOrders });

      res.status(200).json({
        success: true,
        message: 'Images reordered successfully',
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Handle errors with proper status codes
   */
  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof DomainError) {
      if (error.statusCode === 404) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.statusCode === 409) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Pass to global error handler
    next(error);
  }
}