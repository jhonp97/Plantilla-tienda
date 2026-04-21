import type { PrismaClient } from '@shared/infra/prisma/client';
import type { IInvoiceRepository } from '@modules/order/domain/repositories/IInvoiceRepository';
import type { Invoice, CreateInvoiceInput, CustomerSnapshot, InvoiceItemSnapshot } from '@modules/order/domain/entities/Invoice';
import { Invoice as InvoiceEntity } from '@modules/order/domain/entities/Invoice';
import { Prisma } from '@prisma/client';

type InvoicePrismaRecord = Prisma.InvoiceGetPayload<{
  include: {
    order: {
      include: {
        user: true;
        shippingAddress: true;
        items: true;
      };
    };
  };
}>;

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const record = await this.prisma.invoice.create({
      data: {
        orderId: input.orderId,
        invoiceNumber: InvoiceEntity.generateInvoiceNumber(new Date()),
        customerSnapshot: input.customerSnapshot as Prisma.InputJsonValue,
        itemsSnapshot: input.itemsSnapshot as Prisma.InputJsonValue,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        total: input.total,
        taxRate: input.taxRate,
      },
    });

    return this.toDomain(record);
  }

  async findById(id: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
            items: true,
          },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
            items: true,
          },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
            items: true,
          },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async updateVerifactuData(
    id: string,
    data: { uuid: string; qrCode: string; url: string; status: string }
  ): Promise<Invoice> {
    const record = await this.prisma.invoice.update({
      where: { id },
      data: {
        verifactuUuid: data.uuid,
        verifactuQrCode: data.qrCode,
        verifactuUrl: data.url,
        verifactuStatus: data.status,
        verifactuRegisteredAt: data.status === 'REGISTERED' ? new Date() : undefined,
      },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
            items: true,
          },
        },
      },
    });

    return this.toDomain(record);
  }

  async existsByOrderId(orderId: string): Promise<boolean> {
    const count = await this.prisma.invoice.count({
      where: { orderId },
    });
    return count > 0;
  }

  private toDomain(record: InvoicePrismaRecord): Invoice {
    const customerSnapshot = record.customerSnapshot as CustomerSnapshot;
    const itemsSnapshot = record.itemsSnapshot as InvoiceItemSnapshot[];

    return InvoiceEntity.fromPrisma({
      id: record.id,
      orderId: record.orderId,
      invoiceNumber: record.invoiceNumber,
      customerSnapshot,
      itemsSnapshot,
      subtotal: record.subtotal,
      taxAmount: record.taxAmount,
      total: record.total,
      taxRate: Number(record.taxRate),
      verifactuUuid: record.verifactuUuid ?? undefined,
      verifactuQrCode: record.verifactuQrCode ?? undefined,
      verifactuUrl: record.verifactuUrl ?? undefined,
      verifactuStatus: record.verifactuStatus ?? undefined,
      verifactuRegisteredAt: record.verifactuRegisteredAt ?? undefined,
      createdAt: record.createdAt,
    });
  }
}