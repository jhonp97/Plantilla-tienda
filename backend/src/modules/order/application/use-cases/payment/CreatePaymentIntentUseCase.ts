import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { CreatePaymentIntentDto } from '../../dto/CreatePaymentIntentDto';
import type { PaymentIntentSimpleResponse } from '../../dto/PaymentIntentResponseDto';

// Stripe types - in production, these would come from stripe package
interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

interface StripeService {
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, string>): Promise<StripePaymentIntent>;
}

export class CreatePaymentIntentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private stripeService: StripeService
  ) {}

  async execute(dto: CreatePaymentIntentDto): Promise<PaymentIntentSimpleResponse> {
    // 1. Find the order
    const order = await this.orderRepo.findById(dto.orderId);
    
    if (!order) {
      throw new NotFoundError(`Order with ID ${dto.orderId} not found`, 'Order');
    }

    const orderData = order.toJSON();

    // 2. Validate order status
    if (orderData.status !== 'PENDING_PAYMENT' && orderData.status !== 'DRAFT') {
      throw new ValidationError(
        `Order is not in pending payment status. Current status: ${orderData.status}`
      );
    }

    // 3. Validate amount matches order total
    if (dto.amount !== orderData.totalAmount) {
      throw new ValidationError(
        `Amount mismatch. Order total: ${orderData.totalAmount}, provided: ${dto.amount}`
      );
    }

    // 4. Create Stripe PaymentIntent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      dto.amount,
      dto.currency,
      {
        orderId: dto.orderId,
        orderNumber: orderData.orderNumber,
        customerEmail: dto.customerEmail || '',
      }
    );

    // 5. Update order with payment intent ID
    await this.orderRepo.update(dto.orderId, {
      paymentIntentId: paymentIntent.id,
    });

    // 6. Return client secret for frontend
    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }
}