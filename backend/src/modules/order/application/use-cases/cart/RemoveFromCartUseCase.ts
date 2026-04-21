import { NotFoundError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class RemoveFromCartUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(userId: string, productId: string): Promise<Order> {
    const cart = await this.findUserCart(userId);
    
    if (!cart) {
      throw new NotFoundError('Cart not found', 'Cart');
    }

    const itemIndex = cart.items.findIndex((item: any) => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new NotFoundError(`Product ${productId} not found in cart`, 'CartItem');
    }

    const updatedCart = cart;

    return updatedCart;
  }

  private async findUserCart(userId: string): Promise<Order | null> {
    const result = await this.orderRepo.findByUserId(userId, { page: 1, limit: 10 });
    
    const draftOrder = result.items.find((order: Order) => order.status === 'PENDING');
    
    return draftOrder || null;
  }
}