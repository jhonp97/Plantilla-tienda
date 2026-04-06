import { Router } from 'express';
import { CartController } from '@modules/order/infrastructure/http/CartController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';

export function createCartRouter(controller: CartController): Router {
  const router = Router();

  // Public routes
  router.get('/', controller.getCart);
  router.post('/items', controller.addItem);
  router.patch('/items/:itemId', controller.updateItem);
  router.delete('/items/:itemId', controller.removeItem);

  // Protected routes - merge guest cart with user cart
  router.post('/merge', authMiddleware, controller.mergeCart);

  return router;
}