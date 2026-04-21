import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCartUseCase } from '../GetCartUseCase';
import type { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';

describe('GetCartUseCase', () => {
  let useCase: GetCartUseCase;
  let mockOrderRepo: any;

  beforeEach(() => {
    mockOrderRepo = {
      findByUserId: vi.fn(),
    };

    useCase = new GetCartUseCase(mockOrderRepo);
  });

  it('should return cart with items', async () => {
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
    };

    mockOrderRepo.findByUserId.mockResolvedValue({ items: [mockCart] });

    const result = await useCase.execute('user-123');

    expect(result).toBeDefined();
    expect(result?.items).toHaveLength(1);
    expect(result?.items[0].productName).toBe('Test Product');
  });

  it('should return empty cart for new user', async () => {
    mockOrderRepo.findByUserId.mockResolvedValue({ items: [] });

    const result = await useCase.execute('new-user-123');

    expect(result).toBeNull();
  });

  it('should return null when no pending cart exists', async () => {
    const mockOrder = {
      id: 'order-123',
      userId: 'user-123',
      status: 'PAID', // Not a cart
      items: [],
    };

    mockOrderRepo.findByUserId.mockResolvedValue({ items: [mockOrder] });

    const result = await useCase.execute('user-123');

    expect(result).toBeNull();
  });
});
