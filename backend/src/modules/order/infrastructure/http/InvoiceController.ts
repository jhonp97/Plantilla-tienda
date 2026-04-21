import type { Request, Response, NextFunction } from 'express';
import type { GetInvoiceByIdUseCase } from '@modules/order/application/use-cases/order/GetInvoiceByIdUseCase';
import type { GetInvoiceByOrderIdUseCase } from '@modules/order/application/use-cases/order/GetInvoiceByOrderIdUseCase';
import type { ListInvoicesUseCase } from '@modules/order/application/use-cases/order/ListInvoicesUseCase';
import { z } from 'zod';

// Pagination query schema
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Invoice response DTO
export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerSnapshot: {
    name: string;
    email: string;
    nifCif: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
      province: string;
      country: string;
    };
  };
  itemsSnapshot: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    taxRate: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
  verifactuUuid?: string;
  verifactuQrCode?: string;
  verifactuUrl?: string;
  verifactuStatus?: string;
  verifactuRegisteredAt?: string;
  createdAt: string;
}

export class InvoiceController {
  constructor(
    private readonly getInvoiceByIdUseCase: GetInvoiceByIdUseCase,
    private readonly getInvoiceByOrderIdUseCase: GetInvoiceByOrderIdUseCase,
    private readonly listInvoicesUseCase: ListInvoicesUseCase,
  ) {}

  /**
   * GET /api/invoices/:id
   * Get invoice by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      const invoice = await this.getInvoiceByIdUseCase.execute({ id });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
        });
        return;
      }

      const response: InvoiceResponseDto = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerSnapshot: invoice.customerSnapshot,
        itemsSnapshot: invoice.itemsSnapshot,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        taxRate: invoice.taxRate,
        verifactuUuid: invoice.verifactuUuid,
        verifactuQrCode: invoice.verifactuQrCode,
        verifactuUrl: invoice.verifactuUrl,
        verifactuStatus: invoice.verifactuStatus,
        verifactuRegisteredAt: invoice.verifactuRegisteredAt?.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/orders/:orderId/invoice
   * Get invoice by Order ID
   */
  getByOrderId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.orderId as string;

      const invoice = await this.getInvoiceByOrderIdUseCase.execute({ orderId });

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found for this order' },
        });
        return;
      }

      const response: InvoiceResponseDto = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerSnapshot: invoice.customerSnapshot,
        itemsSnapshot: invoice.itemsSnapshot,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        taxRate: invoice.taxRate,
        verifactuUuid: invoice.verifactuUuid,
        verifactuQrCode: invoice.verifactuQrCode,
        verifactuUrl: invoice.verifactuUrl,
        verifactuStatus: invoice.verifactuStatus,
        verifactuRegisteredAt: invoice.verifactuRegisteredAt?.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/invoices
   * List all invoices (admin only, with pagination)
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryResult = paginationSchema.safeParse(req.query);

      if (!queryResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid pagination parameters',
            details: queryResult.error.flatten(),
          },
        });
        return;
      }

      const { page, limit } = queryResult.data;

      const result = await this.listInvoicesUseCase.execute({ page, limit });

      const invoices: InvoiceResponseDto[] = result.invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerSnapshot: invoice.customerSnapshot,
        itemsSnapshot: invoice.itemsSnapshot,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        taxRate: invoice.taxRate,
        verifactuUuid: invoice.verifactuUuid,
        verifactuQrCode: invoice.verifactuQrCode,
        verifactuUrl: invoice.verifactuUrl,
        verifactuStatus: invoice.verifactuStatus,
        verifactuRegisteredAt: invoice.verifactuRegisteredAt?.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      }));

      res.json({
        success: true,
        data: {
          invoices,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
