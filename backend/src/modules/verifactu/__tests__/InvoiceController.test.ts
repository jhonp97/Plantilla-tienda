import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceController } from '../../order/infrastructure/http/InvoiceController';
import type { GetInvoiceByIdUseCase } from '../../order/application/use-cases/order/GetInvoiceByIdUseCase';
import type { GetInvoiceByOrderIdUseCase } from '../../order/application/use-cases/order/GetInvoiceByOrderIdUseCase';
import type { ListInvoicesUseCase } from '../../order/application/use-cases/order/ListInvoicesUseCase';

// Mock Express Request and Response
const mockRequest = (params = {}, query = {}) => ({
  params,
  query,
}) as any;

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let mockGetInvoiceByIdUseCase: any;
  let mockGetInvoiceByOrderIdUseCase: any;
  let mockListInvoicesUseCase: any;

  const mockInvoice = {
    id: 'invoice-123',
    invoiceNumber: 'F-2026-ABC123',
    orderId: 'order-123',
    customerSnapshot: {
      name: 'Test Customer',
      email: 'customer@example.com',
      nifCif: '12345678A',
      address: {
        street: 'Calle Test 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
    },
    itemsSnapshot: [
      {
        productId: 'product-123',
        productName: 'Test Product',
        productPrice: 1000,
        quantity: 2,
        taxRate: 21,
      },
    ],
    subtotal: 2000,
    taxAmount: 420,
    total: 2920,
    taxRate: 21,
    verifactuUuid: 'verifactu-uuid-123',
    verifactuQrCode: 'qr-code',
    verifactuUrl: 'https://verifactu.test/verify/123',
    verifactuStatus: 'REGISTERED',
    verifactuRegisteredAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetInvoiceByIdUseCase = {
      execute: vi.fn(),
    };

    mockGetInvoiceByOrderIdUseCase = {
      execute: vi.fn(),
    };

    mockListInvoicesUseCase = {
      execute: vi.fn(),
    };

    controller = new InvoiceController(
      mockGetInvoiceByIdUseCase,
      mockGetInvoiceByOrderIdUseCase,
      mockListInvoicesUseCase,
    );
  });

  describe('getById', () => {
    it('should return invoice by ID', async () => {
      const req = mockRequest({ id: 'invoice-123' });
      const res = mockResponse();

      mockGetInvoiceByIdUseCase.execute.mockResolvedValue(mockInvoice);

      await controller.getById(req, res, mockNext);

      expect(mockGetInvoiceByIdUseCase.execute).toHaveBeenCalledWith({ id: 'invoice-123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'invoice-123',
          invoiceNumber: 'F-2026-ABC123',
        }),
      });
    });

    it('should return 404 for non-existent invoice', async () => {
      const req = mockRequest({ id: 'non-existent' });
      const res = mockResponse();

      mockGetInvoiceByIdUseCase.execute.mockResolvedValue(null);

      await controller.getById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      });
    });
  });

  describe('getByOrderId', () => {
    it('should return invoice by order ID', async () => {
      const req = mockRequest({ orderId: 'order-123' });
      const res = mockResponse();

      mockGetInvoiceByOrderIdUseCase.execute.mockResolvedValue(mockInvoice);

      await controller.getByOrderId(req, res, mockNext);

      expect(mockGetInvoiceByOrderIdUseCase.execute).toHaveBeenCalledWith({ orderId: 'order-123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'invoice-123',
          orderId: 'order-123',
        }),
      });
    });

    it('should return 404 for non-existent order invoice', async () => {
      const req = mockRequest({ orderId: 'non-existent-order' });
      const res = mockResponse();

      mockGetInvoiceByOrderIdUseCase.execute.mockResolvedValue(null);

      await controller.getByOrderId(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invoice not found for this order' },
      });
    });
  });

  describe('list', () => {
    it('should list all invoices (admin only)', async () => {
      const req = mockRequest({}, { page: '1', limit: '20' });
      const res = mockResponse();

      mockListInvoicesUseCase.execute.mockResolvedValue({
        invoices: [mockInvoice],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      await controller.list(req, res, mockNext);

      expect(mockListInvoicesUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          invoices: expect.arrayContaining([
            expect.objectContaining({ id: 'invoice-123' }),
          ]),
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 1,
          }),
        },
      });
    });

    it('should use default pagination values', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      mockListInvoicesUseCase.execute.mockResolvedValue({
        invoices: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.list(req, res, mockNext);

      expect(mockListInvoicesUseCase.execute).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should return 400 for invalid pagination', async () => {
      const req = mockRequest({}, { page: '-1', limit: '999' });
      const res = mockResponse();

      await controller.list(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });
  });
});
