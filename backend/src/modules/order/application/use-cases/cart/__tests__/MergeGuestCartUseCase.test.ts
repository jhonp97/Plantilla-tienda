import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MergeGuestCartUseCase } from '../MergeGuestCartUseCase';
import type { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';
import type { ITransactionManager } from '@shared/ITransactionManager';

describe('MergeGuestCartUseCase', () => {
  let useCase: MergeGuestCartUseCase;
  let mockOrderRepo: any;
  let mockTransactionManager: any;

  beforeEach(() => {
    mockOrderRepo = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      addItem: vi.fn(),
      cancel: vi.fn(),
      findById: vi.fn(),
    };

    mockTransactionManager = {
      execute: vi.fn((callback) => callback({})),
    };

    useCase = new MergeGuestCartUseCase(mockOrderRepo, mockTransactionManager);
  });

  it('should merge guest cart items into user cart', async () => {
    const guestCart = {
      id: 'guest-cart-123',
      userId: 'guest-user-123',
      status: 'PENDING',
      items: [
        {
          id: 'item-1',
          productId: 'product-123',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      shippingAddress: {
        street: 'Calle Guest 123',
        postalCode: '28002',
        city: 'Barcelona',
        province: 'Barcelona',
        country: 'España',
      },
      paymentMethod: 'CARD',
    };

    const userCart = {
      id: 'user-cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [],
      shippingAddress: {
        street: 'Calle User 456',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
    };

    const mergedCart = {
      id: 'user-cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [
        {
          id: 'item-1',
          productId: 'product-123',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      shippingAddress: userCart.shippingAddress,
      paymentMethod: 'CARD',
    };

    mockOrderRepo.findByUserId
      .mockResolvedValueOnce({ items: [guestCart] }) // Guest cart query
      .mockResolvedValueOnce({ items: [userCart] }); // User cart query
    mockOrderRepo.addItem.mockResolvedValue(undefined);
    mockOrderRepo.cancel.mockResolvedValue(undefined);
    mockOrderRepo.findById.mockResolvedValue(mergedCart);

    const result = await useCase.execute('guest-user-123', 'user-123');

    expect(mockOrderRepo.addItem).toHaveBeenCalled();
    expect(mockOrderRepo.cancel).toHaveBeenCalledWith('guest-cart-123', 'Merged with user cart on login');
    expect(result.items).toHaveLength(1);
  });

  it('should handle empty guest cart', async () => {
    const userCart = {
      id: 'user-cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [],
      shippingAddress: {
        street: 'Calle User 456',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'CARD',
    };

    mockOrderRepo.findByUserId
      .mockResolvedValueOnce({ items: [] }) // No guest cart
      .mockResolvedValueOnce({ items: [userCart] }); // User cart exists

    const result = await useCase.execute('guest-user-123', 'user-123');

    expect(mockOrderRepo.addItem).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should handle empty user cart', async () => {
    const guestCart = {
      id: 'guest-cart-123',
      userId: 'guest-user-123',
      status: 'PENDING',
      items: [
        {
          id: 'item-1',
          productId: 'product-123',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      shippingAddress: {
        street: 'Calle Guest 123',
        postalCode: '28002',
        city: 'Barcelona',
        province: 'Barcelona',
        country: 'España',
      },
      paymentMethod: 'CARD',
    };

    const newUserCart = {
      id: 'new-cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [
        {
          id: 'item-1',
          productId: 'product-123',
          productName: 'Test Product',
          quantity: 2,
          unitPrice: 1000,
          taxRate: 21,
          discountAmount: 0,
          createdAt: new Date(),
        },
      ],
      shippingAddress: guestCart.shippingAddress,
      paymentMethod: 'CARD',
    };

    mockOrderRepo.findByUserId
      .mockResolvedValueOnce({ items: [guestCart] }) // Guest cart exists
      .mockResolvedValueOnce({ items: [] }); // No user cart
    mockOrderRepo.create.mockResolvedValue({
      id: 'new-cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [],
      shippingAddress: guestCart.shippingAddress,
      paymentMethod: 'CARD',
    });
    mockOrderRepo.addItem.mockResolvedValue(undefined);
    mockOrderRepo.cancel.mockResolvedValue(undefined);
    mockOrderRepo.findById.mockResolvedValue(newUserCart);

    const result = await useCase.execute('guest-user-123', 'user-123');

    expect(mockOrderRepo.create).toHaveBeenCalled();
    expect(mockOrderRepo.addItem).toHaveBeenCalled();
    expect(mockOrderRepo.cancel).toHaveBeenCalled();
  });
});
