import { Router } from 'express';
import { InvoiceController } from '@modules/order/infrastructure/http/InvoiceController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createInvoiceRouter(controller: InvoiceController): Router {
  const router = Router();

  // Admin only routes - list all invoices
  router.get(
    '/',
    authMiddleware,
    requireRole('ADMIN'),
    controller.list,
  );

  // Get invoice by ID
  router.get(
    '/:id',
    authMiddleware,
    controller.getById,
  );

  return router;
}
