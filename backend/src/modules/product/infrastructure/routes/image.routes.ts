import { Router } from 'express';
import { ImageController } from '../http/image.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';
import { uploadMiddleware } from '@config/multer';

export function createImageRouter(controller: ImageController): Router {
  const router = Router();

  // All image routes require ADMIN role
  router.post(
    '/products/:productId/images',
    authMiddleware,
    requireRole('ADMIN'),
    uploadMiddleware.array('images', 10),
    controller.upload,
  );

  router.delete(
    '/images/:id',
    authMiddleware,
    requireRole('ADMIN'),
    controller.delete,
  );

  router.patch(
    '/products/:productId/images/reorder',
    authMiddleware,
    requireRole('ADMIN'),
    controller.reorder,
  );

  return router;
}