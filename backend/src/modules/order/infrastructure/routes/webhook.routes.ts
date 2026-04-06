import { Router } from 'express';
import express from 'express';
import { WebhookController } from '@modules/order/infrastructure/http/WebhookController';

export function createWebhookRouter(controller: WebhookController): Router {
  const router = Router();

  // Use raw body for Stripe signature verification
  router.use(express.raw({ type: 'application/json' }));

  // Public - Stripe webhooks (no auth required)
  router.post('/stripe', controller.handleStripe);
  
  // Legacy support
  router.post('/stripe/legacy', controller.handleStripeLegacy);

  return router;
}