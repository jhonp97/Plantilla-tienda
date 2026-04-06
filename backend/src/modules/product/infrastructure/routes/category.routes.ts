import { Router } from 'express';
import { CategoryController } from '../http/category.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createCategoryRouter(controller: CategoryController): Router {
  const router = Router();

  // Public routes
  router.get('/', controller.list);
  router.get('/:slug', controller.getBySlug);

  // Admin routes (protected)
  router.post(
    '/',
    authMiddleware,
    requireRole('ADMIN'),
    controller.create,
  );
  router.put(
    '/:id',
    authMiddleware,
    requireRole('ADMIN'),
    controller.update,
  );
  router.delete(
    '/:id',
    authMiddleware,
    requireRole('ADMIN'),
    controller.delete,
  );

  return router;
}