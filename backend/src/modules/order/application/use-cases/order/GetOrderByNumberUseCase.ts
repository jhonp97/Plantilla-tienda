import { NotFoundError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class GetOrderByNumberUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(orderNumber: string, _userId?: string): Promise<Order> {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    
    if (!order) {
      throw new NotFoundError(`Order with number ${orderNumber} not found`, 'Order');
    }

    return order;
  }
}