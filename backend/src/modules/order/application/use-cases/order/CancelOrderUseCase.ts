import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

const CANCELLABLE_STATUSES = ['DRAFT', 'PENDING_PAYMENT'];

export class CancelOrderUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(orderId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`, 'Order');
    }

    const currentStatus = order.status;
    
    if (!CANCELLABLE_STATUSES.includes(currentStatus)) {
      throw new ValidationError(
        `Cannot cancel order in "${currentStatus}" status. Only orders in DRAFT or PENDING_PAYMENT status can be cancelled.`
      );
    }

    const cancelledOrder = await this.orderRepo.cancel(orderId, reason);
    
    return cancelledOrder;
  }
}