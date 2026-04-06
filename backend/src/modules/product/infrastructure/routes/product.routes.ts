import { Router } from 'express';
import { ProductController } from '../http/product.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';
import { uploadMiddleware } from '@config/multer';

export function createProductRouter(controller: ProductController): Router {
  const router = Router();

  // Public routes
  router.get('/', controller.list);
  router.get('/:slug', controller.getBySlug);

  // Admin routes (protected)
  router.post(
    '/',
    authMiddleware,
    requireRole('ADMIN'),
    uploadMiddleware.array('images', 10),
    controller.create,
  );
  router.put(
    '/:id',
    authMiddleware,
    requireRole('ADMIN'),
    controller.update,
  );
  router.patch(
    '/:id/deactivate',
    authMiddleware,
    requireRole('ADMIN'),
    controller.deactivate,
  );
  router.patch(
    '/:id/stock',
    authMiddleware,
    requireRole('ADMIN'),
    controller.updateStock,
  );

  return router;
}