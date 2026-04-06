import { NotFoundError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class GetOrderByIdUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(orderId: string, _userId?: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new NotFoundError(`Order with ID ${orderId} not found`, 'Order');
    }

    return order;
  }
}