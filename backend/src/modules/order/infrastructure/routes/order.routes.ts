import { Router } from 'express';
import { OrderController } from '@modules/order/infrastructure/http/OrderController';
import type { InvoiceController } from '@modules/order/infrastructure/http/InvoiceController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createOrderRouter(
  controller: OrderController,
  invoiceController: InvoiceController
): Router {
  const router = Router();

  // Public routes
  router.get('/:id', controller.getById);
  router.get('/number/:orderNumber', controller.getByNumber);

  // Protected routes - User
  router.post('/', authMiddleware, controller.create);
  router.get('/my-orders', authMiddleware, controller.listUser);

  // Get invoice by order ID
  router.get(
    '/:orderId/invoice',
    authMiddleware,
    invoiceController.getByOrderId,
  );

  // Protected routes - Admin
  router.get('/admin/all', authMiddleware, requireRole('ADMIN'), controller.listAdmin);
  router.patch('/:id/status', authMiddleware, requireRole('ADMIN'), controller.updateStatus);
  router.post('/:id/cancel', authMiddleware, requireRole('ADMIN'), controller.cancel);

  return router;
}