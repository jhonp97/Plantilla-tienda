import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../CreateOrderUseCase';
import type { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';
import type { IProductRepository } from '../../../../domain/repositories/IProductRepository';
import type { IStoreSettingsRepository } from '../../../../domain/repositories/IStoreSettingsRepository';
import type { ITransactionManager } from '@shared/ITransactionManager';
import type { CreateOrderDto } from '../../../../dto/CreateOrderDto';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockOrderRepo: any;
  let mockProductRepo: any;
  let mockSettingsRepo: any;
  let mockTransactionManager: any;

  const mockSettings = {
    toJSON: () => ({
      defaultShippingCost: 500,
      freeShippingThreshold: 5000,
      currencySymbol: '€',
    }),
  };

  beforeEach(() => {
    mockOrderRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      addItem: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
    };

    mockProductRepo = {
      findById: vi.fn(),
    };

    mockSettingsRepo = {
      get: vi.fn().mockResolvedValue(mockSettings),
    };

    mockTransactionManager = {
      execute: vi.fn((callback) => callback({
        product: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findUnique: vi.fn().mockResolvedValue({ 
            id: 'product-123', 
            name: 'Test Product', 
            slug: 'test-product', 
            price: 1000 
          }),
        },
      })),
    };

    useCase = new CreateOrderUseCase(
      mockOrderRepo,
      mockProductRepo,
      mockSettingsRepo,
      mockTransactionManager
    );
  });

  it('should create order with valid data', async () => {
    const dto: CreateOrderDto = {
      items: [
        { productId: 'product-123', quantity: 2 },
      ],
      shippingAddress: {
        street: 'Calle Principal 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
      billingAddressSame: true,
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
      subtotal: 2000,
      taxAmount: 420,
      shippingCost: 500,
      discountAmount: 0,
      totalAmount: 2920,
      paymentMethod: 'CARD',
      shippingAddress: dto.shippingAddress,
      items: [
        {
          id: 'item-1',
          orderId: 'order-123',
          productId: 'product-123',
          productName: 'Test Product',
          productSku: 'test-product',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderRepo.create.mockResolvedValue({
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
    });

    mockOrderRepo.findById.mockResolvedValue(mockOrder);

    const result = await useCase.execute(dto, 'user-123');

    expect(result).toBeDefined();
    expect(mockTransactionManager.execute).toHaveBeenCalled();
    expect(mockOrderRepo.create).toHaveBeenCalled();
  });

  it('should fail when stock is insufficient', async () => {
    const dto: CreateOrderDto = {
      items: [
        { productId: 'product-123', quantity: 1000 },
      ],
      shippingAddress: {
        street: 'Calle Principal 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
      billingAddressSame: true,
    };

    // Mock transaction manager to simulate insufficient stock
    mockTransactionManager.execute.mockImplementation(async (callback: any) => {
      return callback({
        product: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          findUnique: vi.fn().mockResolvedValue({ 
            id: 'product-123', 
            name: 'Test Product', 
            stockQuantity: 10 
          }),
        },
      });
    });

    await expect(useCase.execute(dto, 'user-123')).rejects.toThrow('Insufficient stock');
  });

  it('should use transaction manager', async () => {
    const dto: CreateOrderDto = {
      items: [
        { productId: 'product-123', quantity: 2 },
      ],
      shippingAddress: {
        street: 'Calle Principal 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
      billingAddressSame: true,
    };

    mockOrderRepo.create.mockResolvedValue({
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
    });

    mockOrderRepo.findById.mockResolvedValue({
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
      subtotal: 2000,
      taxAmount: 420,
      shippingCost: 500,
      discountAmount: 0,
      totalAmount: 2920,
      paymentMethod: 'CARD',
      shippingAddress: dto.shippingAddress,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await useCase.execute(dto, 'user-123');

    expect(mockTransactionManager.execute).toHaveBeenCalled();
  });

  it('should calculate totals correctly with taxRate', async () => {
    const dto: CreateOrderDto = {
      items: [
        { productId: 'product-123', quantity: 1 },
      ],
      shippingAddress: {
        street: 'Calle Principal 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
      billingAddressSame: true,
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
      subtotal: 1000, // €10.00
      taxAmount: 210, // 21% VAT = €2.10
      shippingCost: 500, // €5.00
      discountAmount: 0,
      totalAmount: 1710, // €17.10
      paymentMethod: 'CARD',
      shippingAddress: dto.shippingAddress,
      items: [
        {
          id: 'item-1',
          orderId: 'order-123',
          productId: 'product-123',
          productName: 'Test Product',
          productSku: 'test-product',
          quantity: 1,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOrderRepo.create.mockResolvedValue({
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PENDING',
    });

    mockOrderRepo.findById.mockResolvedValue(mockOrder);

    const result = await useCase.execute(dto, 'user-123');

    // Verify totals are calculated
    expect(result.subtotal).toBe(1000);
    expect(result.taxAmount).toBe(210);
  });
});
