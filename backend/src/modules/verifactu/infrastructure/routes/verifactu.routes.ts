// ==========================================
// Verifactu Router
// ==========================================

import { Router } from 'express';
import type { VerifactuController } from '../http/VerifactuController';

export function createVerifactuRouter(controller: VerifactuController): Router {
  const router = Router();

  // Health check
  router.get('/health', controller.healthCheck.bind(controller));

  // Check status by UUID
  router.get('/status', controller.checkStatus.bind(controller));

  // Get invoice by order ID
  router.get('/invoice/:orderId', controller.getInvoiceByOrderId.bind(controller));

  // Manually create invoice (not recommended - use events)
  router.post('/create', controller.createInvoice.bind(controller));

  // Manually trigger status check for all pending invoices
  router.post('/check-all', controller.checkAllStatuses.bind(controller));

  return router;
}