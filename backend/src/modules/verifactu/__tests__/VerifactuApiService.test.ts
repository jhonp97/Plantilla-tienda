import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifactuApiService } from '../infrastructure/services/VerifactuApiService';
import { VerifactuInvoice } from '../domain/entities/VerifactuInvoice';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VerifactuApiService', () => {
  let service: VerifactuApiService;

  const createMockInvoice = () => VerifactuInvoice.create({
    orderId: 'order-123',
    serie: 'F',
    numero: '123',
    fechaExpedicion: new Date().toISOString(),
    tipoFactura: 'F1',
    descripcion: 'Test invoice',
    nombre: 'Test Customer',
    nif: '12345678A',
    lineas: [{
      baseImponible: '1000',
      tipoImpositivo: '21',
      cuotaRepercutida: '210',
    }],
    importeTotal: '1210',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    service = new VerifactuApiService();
  });

  it('should register invoice successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        uuid: 'test-uuid-123',
        qr: 'test-qr-code',
        url: 'https://verifactu.test/verify/test-uuid-123',
      }),
    });

    const invoice = createMockInvoice();
    const result = await service.createInvoice(invoice);

    expect(result.uuid).toBe('test-uuid-123');
    expect(result.qr).toBe('test-qr-code');
    expect(result.url).toBe('https://verifactu.test/verify/test-uuid-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/verifactu/create'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle AEAT API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ message: 'Invalid invoice data' })),
    });

    const invoice = createMockInvoice();
    await expect(service.createInvoice(invoice)).rejects.toThrow('Verifactu API error');
  });

  it('should throw on 5xx errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const invoice = createMockInvoice();
    await expect(service.createInvoice(invoice)).rejects.toThrow();
  });

  it('should check invoice status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        estado: 'VERIFICADO',
        url: 'https://verifactu.test/verify/test-uuid',
        qr: 'verified-qr',
        codigoError: null,
        mensajeError: null,
      }),
    });

    const result = await service.checkStatus('test-uuid-123');

    expect(result.estado).toBe('VERIFICADO');
    expect(result.url).toBe('https://verifactu.test/verify/test-uuid');
  });

  it('should perform health check', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    const result = await service.healthCheck();

    expect(result).toBe(true);
  });

  it('should return false on health check failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await service.healthCheck();

    expect(result).toBe(false);
  });
});
