import type { Request, Response, NextFunction } from 'express';
import type { CreatePaymentIntentUseCase } from '@modules/order/application/use-cases/payment/CreatePaymentIntentUseCase';
import type { ConfirmPaymentUseCase } from '@modules/order/application/use-cases/payment/ConfirmPaymentUseCase';

export class PaymentController {
  constructor(
    private readonly createPaymentIntentUseCase: CreatePaymentIntentUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
  ) {}

  createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId, amount, email } = req.body;
      const result = await this.createPaymentIntentUseCase.execute({
        orderId,
        amount,
        currency: 'eur',
        customerEmail: email,
      });
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { paymentIntentId } = req.body;
      const result = await this.confirmPaymentUseCase.execute(paymentIntentId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}