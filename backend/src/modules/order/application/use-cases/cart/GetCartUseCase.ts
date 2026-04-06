import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class GetCartUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(userId: string): Promise<Order | null> {
    const cart = await this.findUserCart(userId);
    
    return cart;
  }

  private async findUserCart(userId: string): Promise<Order | null> {
    const result = await this.orderRepo.findByUserId(userId, { page: 1, limit: 10 });
    
    const draftOrder = result.items.find((order: Order) => order.status === 'DRAFT');
    
    return draftOrder || null;
  }
}