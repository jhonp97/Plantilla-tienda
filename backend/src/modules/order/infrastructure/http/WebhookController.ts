import type { Request, Response, NextFunction } from 'express';
import type { HandleWebhookUseCase } from '@modules/order/application/use-cases/payment/HandleWebhookUseCase';
import type { HandleFailedPaymentUseCase } from '@modules/order/application/use-cases/payment/HandleFailedPaymentUseCase';

export class WebhookController {
  constructor(
    private readonly handleWebhookUseCase: HandleWebhookUseCase,
    private readonly handleFailedPaymentUseCase: HandleFailedPaymentUseCase,
  ) {}

  handleStripe = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // Always return 200 to Stripe to prevent retries
    res.status(200).json({
      success: true,
      received: true,
    });
  };

  handleStripeLegacy = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    res.status(200).json({
      success: true,
      received: true,
    });
  };
}