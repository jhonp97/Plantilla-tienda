import type { IOrderRepository, PaginatedResult, PaginationParams } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class ListUserOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(
    userId: string, 
    pagination?: PaginationParams,
    status?: string
  ): Promise<PaginatedResult<Order>> {
    const filters = status ? { userId, status: status as any } : { userId };
    
    const result = await this.orderRepo.findByUserId(userId, pagination);
    
    return result;
  }
}