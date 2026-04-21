import type { IInvoiceRepository } from '@modules/order/domain/repositories/IInvoiceRepository';

export interface ListInvoicesInput {
  page: number;
  limit: number;
}

export interface InvoiceListItem {
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ListInvoicesResult {
  invoices: InvoiceListItem[];
  pagination: PaginationMeta;
}

export class ListInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: ListInvoicesInput): Promise<ListInvoicesResult> {
    const { page, limit } = input;
    const skip = (page - 1) * limit;

    // Get total count for proper pagination
    const total = await this.invoiceRepository.count();
    const totalPages = Math.ceil(total / limit);

    const invoices = await this.invoiceRepository.findAll({ skip, take: limit });

    return {
      invoices: invoices.map(invoice => ({
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
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }
}
