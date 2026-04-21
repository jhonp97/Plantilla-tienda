import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { IProductRepository } from '@modules/product/domain/repositories/IProductRepository';
import type { IEmailService, OrderEmailData } from '@modules/order/domain/services/IEmailService';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { ITransactionManager } from '@shared/ITransactionManager';

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
    private eventBus: EventBus,
    private transactionManager: ITransactionManager
  ) {}

  async execute(paymentIntentId: string): Promise<void> {
    // Wrap order status update and stock decrement in a transaction
    return this.transactionManager.execute(async (tx) => {
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

      // 4. Verify and decrement stock atomically (optimistic locking)
      for (const item of orderData.items) {
        // Use atomic update with stock check (same pattern as CreateOrderUseCase)
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: { gte: item.quantity }
          },
          data: {
            stockQuantity: { decrement: item.quantity }
          }
        });
        
        if (result.count === 0) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, stockQuantity: true }
          });
          
          if (!product) {
            throw new NotFoundError(`Product ${item.productId} not found`, 'Product');
          }
          
          throw new ValidationError(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}`
          );
        }
      }

      // 5. Update order status to PAID (within transaction)
      const updatedOrder = await this.orderRepo.update(orderData.id, {
        status: 'PAID',
        paidAt: new Date(),
      });

      // 6. Prepare and send confirmation email (outside of stock transaction but still in outer tx)
      const orderEmailData: OrderEmailData = {
        orderNumber: orderData.orderNumber,
        customerName: orderData.shippingAddress.street.split(' ')[0] || 'Cliente',
        customerEmail: 'customer@example.com',
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

      // 7. Emit event for Phase 5 (Verifactu/Hacienda)
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
    });
  }
}