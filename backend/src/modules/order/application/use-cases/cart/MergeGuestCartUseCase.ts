import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order } from '@modules/order/domain/entities/Order';

export class MergeGuestCartUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(guestUserId: string, loggedInUserId: string): Promise<Order> {
    const guestCart = await this.findCartByUserId(guestUserId);
    
    let userCart = await this.findCartByUserId(loggedInUserId);
    
    if (!guestCart) {
      if (!userCart) {
        userCart = await this.orderRepo.create({
          userId: loggedInUserId,
          shippingAddress: {
            street: '',
            postalCode: '',
            city: '',
            province: '',
            country: 'España',
          },
          paymentMethod: 'CARD',
        });
      }
      return userCart;
    }

    if (!userCart) {
      const reassignedCart = await this.orderRepo.create({
        userId: loggedInUserId,
        shippingAddress: guestCart.shippingAddress,
        paymentMethod: guestCart.paymentMethod,
      });
      
      for (const item of guestCart.items) {
        await this.orderRepo.addItem(reassignedCart.id, {
          ...item,
          id: crypto.randomUUID(),
          orderId: reassignedCart.id,
          createdAt: new Date(),
        });
      }
      
      await this.orderRepo.cancel(guestCart.id, 'Merged with user cart on login');
      
      const finalCart = await this.orderRepo.findById(reassignedCart.id);
      if (!finalCart) {
        throw new Error('Failed to retrieve merged cart');
      }
      return finalCart;
    }

    for (const guestItem of guestCart.items) {
      await this.orderRepo.addItem(userCart.id, {
        ...guestItem,
        id: crypto.randomUUID(),
        orderId: userCart.id,
        createdAt: new Date(),
      });
    }

    await this.orderRepo.cancel(guestCart.id, 'Merged with user cart on login');

    const finalCart = await this.orderRepo.findById(userCart.id);
    if (!finalCart) {
      throw new Error('Failed to retrieve merged cart');
    }
    return finalCart;
  }

  private async findCartByUserId(userId: string): Promise<Order | null> {
    const result = await this.orderRepo.findByUserId(userId, { page: 1, limit: 10 });
    
    const draftOrder = result.items.find((order: Order) => order.status === 'DRAFT');
    
    return draftOrder || null;
  }
}