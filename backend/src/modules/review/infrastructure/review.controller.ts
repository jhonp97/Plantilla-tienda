import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';
import { CreateReviewUseCase } from '@modules/review/application/create-review.use-case';
import { GetProductReviewsUseCase } from '@modules/review/application/get-product-reviews.use-case';
import { DeleteReviewUseCase } from '@modules/review/application/delete-review.use-case';

export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getProductReviewsUseCase: GetProductReviewsUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
  ) {}

  // GET /api/products/:productId/reviews
  getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = (req.params.productId as string) ?? '';
      if (!productId) {
        res.status(400).json({ success: false, error: 'Product ID is required' });
        return;
      }
      const page = Math.max(1, typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1);
      const limit = Math.min(50, Math.max(1, typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10));

      const result = await this.getProductReviewsUseCase.execute({ productId, page, limit });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/products/:productId/reviews
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = (req.params.productId as string) ?? '';
      if (!productId) {
        res.status(400).json({ success: false, error: 'Product ID is required' });
        return;
      }
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const review = await this.createReviewUseCase.execute(
        { ...req.body, productId },
        req.user.id,
      );
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/reviews/:id
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = (req.params.id as string) ?? '';
      if (!id) {
        res.status(400).json({ success: false, error: 'Review ID is required' });
        return;
      }
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      await this.deleteReviewUseCase.execute(id, req.user.id, req.user.role);
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
