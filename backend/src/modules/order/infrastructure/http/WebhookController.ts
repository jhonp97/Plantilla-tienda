import type { Request, Response, NextFunction } from 'express';

export class WebhookController {
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