import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { IProductRepository } from '@modules/product/domain/repositories/IProductRepository';
import type { Order } from '@modules/order/domain/entities/Order';
import type { AddOrderItemDto } from '../../dto/AddOrderItemDto';

export class AddToCartUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository
  ) {}

  async execute(userId: string, dto: AddOrderItemDto): Promise<Order> {
    const product = await this.productRepo.findById(dto.productId);
    
    if (!product) {
      throw new NotFoundError(`Product with ID ${dto.productId} not found`, 'Product');
    }

    const productData = product.toJSON();

    if (productData.stockQuantity < dto.quantity) {
      throw new ValidationError(
        `Insufficient stock for "${productData.name}". Available: ${productData.stockQuantity}, requested: ${dto.quantity}`
      );
    }

    let cart = await this.findUserCart(userId);
    
    if (!cart) {
      cart = await this.orderRepo.create({
        userId,
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

    const orderItem = {
      id: crypto.randomUUID(),
      orderId: cart.id,
      productId: dto.productId,
      productName: productData.name,
      productSku: productData.slug,
      quantity: dto.quantity,
      unitPrice: productData.price,
      taxRate: 21,
      discountAmount: 0,
      createdAt: new Date(),
    };

    await this.orderRepo.addItem(cart.id, orderItem);

    const updatedCart = await this.orderRepo.findById(cart.id);
    
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }
    
    return updatedCart;
  }

  private async findUserCart(userId: string): Promise<Order | null> {
    const result = await this.orderRepo.findByUserId(userId, { page: 1, limit: 1 });
    
    const draftOrder = result.items.find((order: Order) => order.status === 'PENDING');
    
    return draftOrder || null;
  }
}