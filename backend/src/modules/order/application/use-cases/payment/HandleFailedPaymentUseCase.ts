import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';

export class HandleFailedPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(paymentIntentId: string, errorMessage?: string): Promise<void> {
    // 1. Find order by payment intent ID
    const order = await this.orderRepo.findByPaymentIntentId(paymentIntentId);
    
    if (!order) {
      // If order doesn't exist, nothing to do - idempotent
      return;
    }

    const orderData = order.toJSON();

    // 2. Idempotency check - only process if in pending status
    if (orderData.status !== 'DRAFT' && orderData.status !== 'PENDING_PAYMENT') {
      // Order already processed or cancelled - idempotent return
      return;
    }

    // 3. Cancel the order with reason
    await this.orderRepo.cancel(
      orderData.id,
      `Payment failed: ${errorMessage || 'Unknown error'}`
    );

    // Note: Could also send email notification to customer about payment failure
    // This would be added when EmailService is fully implemented
  }
}