import { Router } from 'express';
import { PaymentController } from '@modules/order/infrastructure/http/PaymentController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';

export function createPaymentRouter(controller: PaymentController): Router {
  const router = Router();

  // Protected - create payment intent
  router.post('/intent', authMiddleware, controller.createPaymentIntent);
  router.post('/confirm', authMiddleware, controller.confirmPayment);

  return router;
}