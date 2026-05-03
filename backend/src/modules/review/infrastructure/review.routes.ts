import { Router } from 'express';
import { ReviewController } from '@modules/review/infrastructure/review.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

// Router for product-scoped review routes: GET + POST /api/products/:productId/reviews
export function createProductReviewRouter(controller: ReviewController): Router {
  const router = Router({ mergeParams: true });

  router.get('/', controller.getProductReviews);
  router.post('/', authMiddleware, controller.create);

  return router;
}

// Router for review-scoped routes: DELETE /api/reviews/:id
export function createReviewRouter(controller: ReviewController): Router {
  const router = Router();

  router.delete('/:id', authMiddleware, controller.delete);

  return router;
}
