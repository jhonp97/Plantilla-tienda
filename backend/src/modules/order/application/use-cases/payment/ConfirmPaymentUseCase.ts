import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { IProductRepository } from '@modules/product/domain/repositories/IProductRepository';
import type { IEmailService, OrderEmailData } from '@modules/order/domain/services/IEmailService';
import type { StoreSettings } from '@modules/order/domain/entities/StoreSettings';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';

// Event bus interface for Phase 5 (Verifactu)
interface EventBus {
  emit(event: string, data: any): Promise<void>;
}

export class ConfirmPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private settingsRepo: IStoreSettingsRepository,
    private emailService: IEmailService,
    private eventBus: EventBus
  ) {}

  async execute(paymentIntentId: string): Promise<void> {
    // 1. Find order by payment intent ID
    const order = await this.orderRepo.findByPaymentIntentId(paymentIntentId);
    
    if (!order) {
      throw new NotFoundError(`Order with payment intent ${paymentIntentId} not found`, 'Order');
    }

    const orderData = order.toJSON();

    // 2. Idempotency check - already processed
    if (orderData.status !== 'DRAFT' && orderData.status !== 'PENDING_PAYMENT') {
      throw new ValidationError(
        `Order already processed. Current status: ${orderData.status}`
      );
    }

    // 3. Get settings for email currency symbol
    const settings = await this.settingsRepo.get();
    const settingsData = settings.toJSON();

    // 4. Get product details for stock validation
    const productIds = orderData.items.map(item => item.productId);
    
    // Note: In a real implementation, we'd use Prisma transaction here
    // For this example, we'll do a two-step process (lock then update)
    
    // 5. Verify and decrement stock (simplified - would be transaction in real impl)
    for (const item of orderData.items) {
      const product = await this.productRepo.findById(item.productId);
      
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found`, 'Product');
      }

      const productData = product.toJSON();

      if (productData.stockQuantity < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for "${productData.name}". Available: ${productData.stockQuantity}, requested: ${item.quantity}`
        );
      }

      // Decrement stock
      await this.productRepo.update(item.productId, {
        stockQuantity: productData.stockQuantity - item.quantity,
      });
    }

    // 6. Update order status to PAID
    const updatedOrder = await this.orderRepo.update(orderData.id, {
      status: 'PAID',
      paidAt: new Date(),
    });

    // 7. Prepare and send confirmation email (outside of stock transaction)
    const orderEmailData: OrderEmailData = {
      orderNumber: orderData.orderNumber,
      customerName: orderData.shippingAddress.street.split(' ')[0] || 'Cliente', // Use street as proxy for name
      customerEmail: 'customer@example.com', // Would be fetched from order user
      totalAmount: orderData.totalAmount,
      currencySymbol: settingsData.currencySymbol,
      items: orderData.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      })),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
    };

    await this.emailService.sendOrderPaid(orderData.id, orderEmailData);

    // 8. Emit event for Phase 5 (Verifactu/Hacienda)
    await this.eventBus.emit('OrderPaid', {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      totalAmount: orderData.totalAmount,
      taxAmount: orderData.taxAmount,
      subtotal: orderData.subtotal,
      customerEmail: orderEmailData.customerEmail,
      customerNif: orderData.customerNif,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      paidAt: new Date(),
    });
  }
}