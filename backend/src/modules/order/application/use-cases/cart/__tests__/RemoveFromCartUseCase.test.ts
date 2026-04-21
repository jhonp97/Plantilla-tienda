import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RemoveFromCartUseCase } from '../RemoveFromCartUseCase';
import type { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';

describe('RemoveFromCartUseCase', () => {
  let useCase: RemoveFromCartUseCase;
  let mockOrderRepo: any;

  beforeEach(() => {
    mockOrderRepo = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
    };

    useCase = new RemoveFromCartUseCase(mockOrderRepo);
  });

  it('should remove item from cart', async () => {
    const mockCart = {
      id: 'cart-123',
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
      shippingAddress: {
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
      },
      paymentMethod: 'CARD',
      toJSON: function() { return this; },
    };

    mockOrderRepo.findByUserId.mockResolvedValue({ items: [mockCart] });

    const result = await useCase.execute('user-123', 'product-123');

    expect(result).toBeDefined();
  });

  it('should throw NotFoundError if cart not found', async () => {
    mockOrderRepo.findByUserId.mockResolvedValue({ items: [] });

    await expect(
      useCase.execute('user-123', 'product-123')
    ).rejects.toThrow('Cart not found');
  });

  it('should throw NotFoundError if product not in cart', async () => {
    const mockCart = {
      id: 'cart-123',
      userId: 'user-123',
      status: 'PENDING',
      items: [], // Empty cart
      shippingAddress: {
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
      },
      paymentMethod: 'CARD',
      toJSON: function() { return this; },
    };

    mockOrderRepo.findByUserId.mockResolvedValue({ items: [mockCart] });

    await expect(
      useCase.execute('user-123', 'non-existent-product')
    ).rejects.toThrow('CartItem not found');
  });
});
