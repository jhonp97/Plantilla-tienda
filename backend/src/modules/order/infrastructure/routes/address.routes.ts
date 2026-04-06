import { Router } from 'express';
import { AddressController } from '@modules/order/infrastructure/http/AddressController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';

export function createAddressRouter(controller: AddressController): Router {
  const router = Router();

  // All address routes require authentication
  router.get('/', authMiddleware, controller.list);
  router.post('/', authMiddleware, controller.create);
  router.patch('/:id', authMiddleware, controller.update);
  router.delete('/:id', authMiddleware, controller.delete);

  return router;
}