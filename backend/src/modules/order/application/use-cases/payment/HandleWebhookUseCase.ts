import { ValidationError } from '@shared/errors/DomainError';
import type { WebhookPayload } from '../../dto/WebhookPayloadDto';

interface WebhookHandler {
  handlePaymentSuccess(paymentIntentId: string): Promise<void>;
  handlePaymentFailed(paymentIntentId: string, errorMessage?: string): Promise<void>;
  handleRefund(chargeId: string, amount: number): Promise<void>;
}

export class HandleWebhookUseCase {
  constructor(
    private webhookHandler: WebhookHandler
  ) {}

  async execute(payload: WebhookPayload): Promise<{ processed: boolean; eventType: string }> {
    const { type, data } = payload;

    // Extract payment intent ID from the nested object structure
    const paymentIntentId = this.extractPaymentIntentId(type, data);
    
    if (!paymentIntentId) {
      throw new ValidationError('Invalid webhook payload: no payment intent ID found');
    }

    // Route to appropriate handler based on event type
    switch (type) {
      case 'payment_intent.succeeded':
        await this.webhookHandler.handlePaymentSuccess(paymentIntentId);
        return { processed: true, eventType: type };

      case 'payment_intent.payment_failed':
        const errorMessage = this.extractErrorMessage(data);
        await this.webhookHandler.handlePaymentFailed(paymentIntentId, errorMessage);
        return { processed: true, eventType: type };

      case 'charge.refunded':
        // Handle refund event - extract charge info
        const chargeData = data?.object as any;
        if (chargeData) {
          await this.webhookHandler.handleRefund(
            chargeData.id,
            chargeData.amount
          );
        }
        return { processed: true, eventType: type };

      case 'charge.created':
        // Log new charge but don't process
        return { processed: true, eventType: type };

      default:
        // Unknown event type - log but don't throw
        return { processed: false, eventType: type };
    }
  }

  private extractPaymentIntentId(type: string, data: any): string | null {
    const objectData = data?.object;
    if (!objectData) return null;
    
    switch (type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
        return objectData.payment_intent || objectData.id || null;
      case 'charge.refunded':
      case 'charge.created':
        return objectData.payment_intent || null;
      default:
        return null;
    }
  }

  private extractErrorMessage(data: any): string | undefined {
    const objectData = data?.object;
    return objectData?.lastPaymentError?.message || 
           objectData?.lastPaymentError?.code;
  }
}