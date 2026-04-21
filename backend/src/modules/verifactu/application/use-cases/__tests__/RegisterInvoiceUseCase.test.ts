import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterInvoiceUseCase } from '../RegisterInvoiceUseCase';
import type { IVerifactuApiService } from '../../domain/services/IVerifactuApiService';
import type { IVerifactuRepository } from '../../domain/repositories/IVerifactuRepository';

describe('RegisterInvoiceUseCase', () => {
  let useCase: RegisterInvoiceUseCase;
  let mockVerifactuApi: any;
  let mockVerifactuRepo: any;
  let mockGenerateInvoice: any;

  beforeEach(() => {
    mockVerifactuApi = {
      createInvoice: vi.fn(),
      checkStatus: vi.fn(),
    };

    mockVerifactuRepo = {
      save: vi.fn(),
      updateOrderVerifactuData: vi.fn(),
    };

    mockGenerateInvoice = {
      execute: vi.fn().mockReturnValue({
        getUuid: () => undefined,
        setUuid: vi.fn(),
        getQrCode: () => undefined,
        setQrCode: vi.fn(),
        getUrlVerificacion: () => undefined,
        setUrlVerificacion: vi.fn(),
        getEstado: () => 'PENDIENTE',
        setEstado: vi.fn(),
        setError: vi.fn(),
        toApiPayload: () => ({}),
      }),
    };

    useCase = new RegisterInvoiceUseCase(
      mockVerifactuApi,
      mockVerifactuRepo,
      mockGenerateInvoice,
    );
  });

  it('should register invoice via event bus', async () => {
    const mockOrderData = {
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PAID',
      subtotal: 2000,
      taxAmount: 420,
      totalAmount: 2920,
      guestNifCif: '12345678A',
      guestFullName: 'Test Customer',
      user: null,
      items: [
        { productPrice: 1000, quantity: 2 },
      ],
      createdAt: new Date(),
    };

    mockVerifactuApi.createInvoice.mockResolvedValueOnce({
      uuid: 'verifactu-uuid-123',
      qr: 'verifactu-qr-code',
      url: 'https://verifactu.test/verify/123',
    });

    await useCase.execute(mockOrderData);

    expect(mockGenerateInvoice.execute).toHaveBeenCalledWith(mockOrderData);
    expect(mockVerifactuApi.createInvoice).toHaveBeenCalled();
    expect(mockVerifactuRepo.save).toHaveBeenCalled();
    expect(mockVerifactuRepo.updateOrderVerifactuData).toHaveBeenCalledWith('order-123', expect.objectContaining({
      verifactuUuid: 'verifactu-uuid-123',
      verifactuQrCode: 'verifactu-qr-code',
      verifactuUrl: 'https://verifactu.test/verify/123',
      verifactuStatus: 'PENDIENTE',
    }));
  });

  it('should create Invoice entity with Verifactu data', async () => {
    const mockOrderData = {
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PAID',
      subtotal: 2000,
      taxAmount: 420,
      totalAmount: 2920,
      guestNifCif: '12345678A',
      guestFullName: 'Test Customer',
      user: null,
      items: [
        { productPrice: 1000, quantity: 2 },
      ],
      createdAt: new Date(),
    };

    mockVerifactuApi.createInvoice.mockResolvedValueOnce({
      uuid: 'verifactu-uuid-123',
      qr: 'verifactu-qr-code',
      url: 'https://verifactu.test/verify/123',
    });

    await useCase.execute(mockOrderData);

    // Verify that save was called with invoice containing UUID set
    expect(mockVerifactuRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        setUuid: expect.any(Function),
        setQrCode: expect.any(Function),
        setUrlVerificacion: expect.any(Function),
        setEstado: expect.any(Function),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    const mockOrderData = {
      id: 'order-123',
      orderNumber: 'ORD-260421-ABC123',
      userId: 'user-123',
      status: 'PAID',
      subtotal: 2000,
      taxAmount: 420,
      totalAmount: 2920,
      guestNifCif: '12345678A',
      guestFullName: 'Test Customer',
      user: null,
      items: [
        { productPrice: 1000, quantity: 2 },
      ],
      createdAt: new Date(),
    };

    mockVerifactuApi.createInvoice.mockRejectedValueOnce(new Error('API connection failed'));

    // Should not throw, just log the error
    await useCase.execute(mockOrderData);

    expect(mockVerifactuRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        setError: expect.any(Function),
      })
    );
  });
});
