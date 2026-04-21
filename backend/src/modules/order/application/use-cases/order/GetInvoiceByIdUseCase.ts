import type { IInvoiceRepository } from '@modules/order/domain/repositories/IInvoiceRepository';
import { NotFoundError } from '@shared/errors/DomainError';

export interface GetInvoiceByIdInput {
  id: string;
}

export interface GetInvoiceByIdResult {
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
  verifactuRegisteredAt?: Date;
  createdAt: Date;
}

export class GetInvoiceByIdUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: GetInvoiceByIdInput): Promise<GetInvoiceByIdResult | null> {
    const invoice = await this.invoiceRepository.findById(input.id);

    if (!invoice) {
      return null;
    }

    return {
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
      verifactuRegisteredAt: invoice.verifactuRegisteredAt,
      createdAt: invoice.createdAt,
    };
  }
}
