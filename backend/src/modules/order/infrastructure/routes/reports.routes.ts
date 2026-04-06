import { Router } from 'express';
import { ReportsController } from '@modules/order/infrastructure/http/ReportsController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createReportsRouter(controller: ReportsController): Router {
  const router = Router();

  // All report routes require admin role
  router.get('/invoices', authMiddleware, requireRole('ADMIN'), controller.generateInvoices);
  router.get('/sales', authMiddleware, requireRole('ADMIN'), controller.generateSalesReport);
  router.get('/products', authMiddleware, requireRole('ADMIN'), controller.generateProductsReport);
  router.post('/generate', authMiddleware, requireRole('ADMIN'), controller.generateGenericReport);

  return router;
}