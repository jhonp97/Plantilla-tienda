import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order, OrderStatus } from '@modules/order/domain/entities/Order';
import type { UpdateOrderStatusDto } from '../../dto/UpdateOrderStatusDto';

// Valid state transitions map
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class UpdateOrderStatusUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(orderId: string, dto: UpdateOrderStatusDto, _userId?: string): Promise<Order> {
    // 1. Find existing order
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`, 'Order');
    }

    // 2. Validate state transition
    const currentStatus = order.status as OrderStatus;
    const newStatus = dto.status as OrderStatus;
    
    this.validateTransition(currentStatus, newStatus);

    // 3. Update the order status
    const updateData: Partial<{
      status: OrderStatus;
      paidAt: Date;
      shippedAt: Date;
      deliveredAt: Date;
      cancelledAt: Date;
      cancellationReason: string;
    }> = {
      status: newStatus,
    };

    // Set timestamp based on new status
    switch (newStatus) {
      case 'PAID':
        updateData.paidAt = new Date();
        break;
      case 'PROCESSING':
        break;
      case 'SHIPPED':
        updateData.shippedAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = dto.reason;
        break;
    }

    // 4. Update the order in repository
    const updatedOrder = await this.orderRepo.update(orderId, updateData);
    
    return updatedOrder;
  }

  private validateTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions = VALID_TRANSITIONS[currentStatus];
    
    if (!validTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Invalid state transition from ${currentStatus} to ${newStatus}. ` +
        `Valid transitions: ${validTransitions.join(', ')}`
      );
    }
  }
}