import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { IProductRepository } from '@modules/product/domain/repositories/IProductRepository';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { ITransactionManager } from '@shared/ITransactionManager';
import type { Order, OrderStatus, CreateOrderInput } from '@modules/order/domain/entities/Order';
import type { OrderItemProps } from '@modules/order/domain/entities/OrderItem';
import type { StoreSettings } from '@modules/order/domain/entities/StoreSettings';
import type { CreateOrderDto } from '../../dto/CreateOrderDto';

interface OrderItemInput {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private settingsRepo: IStoreSettingsRepository,
    private transactionManager: ITransactionManager
  ) {}

  async execute(dto: CreateOrderDto, userId?: string): Promise<Order> {
    // Wrap entire order creation in a transaction with retry logic
    return this.transactionManager.execute(async (tx) => {
      // 1. Validate items and check stock using atomic update with optimistic locking
      const orderItems: OrderItemInput[] = [];
      
      for (const item of dto.items) {
        // Use atomic decrement with stock check (optimistic locking)
        // This UPDATE only succeeds if there's sufficient stock
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stockQuantity: { gte: item.quantity }
          },
          data: {
            stockQuantity: { decrement: item.quantity }
          }
        });
        
        // If no rows were updated, stock was insufficient
        if (result.count === 0) {
          // Check if product exists
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, stockQuantity: true }
          });
          
          if (!product) {
            throw new NotFoundError(`Product with ID ${item.productId} not found`, 'Product');
          }
          
          throw new ValidationError(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${item.quantity}`
          );
        }
        
        // Get product details for the order
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true, price: true }
        });
        
        if (!product) {
          throw new NotFoundError(`Product with ID ${item.productId} not found`, 'Product');
        }
        
        orderItems.push({
          productId: item.productId,
          productName: product.name,
          productSku: product.slug,
          quantity: item.quantity,
          unitPrice: product.price,
          taxRate: 21, // Default 21% VAT
        });
      }

      // 2. Calculate totals
      const subtotal = orderItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0
      );
      
      const settings = await this.settingsRepo.get();
      
      // Calculate shipping based on settings
      const shippingAddress = dto.shippingAddress;
      const shippingCost = this.calculateShipping(subtotal, settings);
      
      // Calculate tax (21% VAT)
      const taxAmount = Math.round(subtotal * 0.21);
      
      // Total
      const total = subtotal + shippingCost + taxAmount;

      // 3. Generate order number
      const orderNumber = await this.generateOrderNumber();

      // 4. Prepare addresses
      const shippingAddressData = {
        street: shippingAddress.street,
        postalCode: shippingAddress.postalCode,
        city: shippingAddress.city,
        province: shippingAddress.province,
        country: shippingAddress.country ?? 'España',
      };
      
      const billingAddressData = dto.billingAddressSame || !dto.billingAddress
        ? shippingAddressData
        : {
            street: dto.billingAddress!.street,
            postalCode: dto.billingAddress!.postalCode,
            city: dto.billingAddress!.city,
            province: dto.billingAddress!.province,
            country: dto.billingAddress!.country ?? 'España',
          };

      // 5. Create order input
      const createInput: CreateOrderInput = {
        userId: userId || 'guest',
        shippingAddress: shippingAddressData,
        billingAddress: dto.billingAddressSame ? undefined : billingAddressData,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        customerNif: dto.nifCif,
      };

      // 6. Create order using repository (within transaction)
      const createdOrder = await this.orderRepo.create(createInput);

      // 7. Add items to order (within transaction)
      for (const item of orderItems) {
        const orderItemInput: OrderItemProps = {
          id: crypto.randomUUID(),
          orderId: createdOrder.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discountAmount: 0,
          createdAt: new Date(),
        };
        
        await this.orderRepo.addItem(createdOrder.id, orderItemInput);
      }

      // 8. Return the created order with items
      const finalOrder = await this.orderRepo.findById(createdOrder.id);
      
      if (!finalOrder) {
        throw new Error('Failed to retrieve created order');
      }
      
      return finalOrder;
    });
  }

  private calculateShipping(subtotal: number, settings: StoreSettings): number {
    const settingsData = settings.toJSON();
    const defaultShippingCost = settingsData.defaultShippingCost || 0;
    const freeShippingThreshold = settingsData.freeShippingThreshold;
    
    // Check if free shipping threshold is met
    if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
      return 0;
    }
    
    return defaultShippingCost;
  }

  private async generateOrderNumber(): Promise<string> {
    const count = await this.orderRepo.count();
    const year = new Date().getFullYear();
    return `ORD-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}