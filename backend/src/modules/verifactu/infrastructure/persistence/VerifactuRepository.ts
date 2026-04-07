// ==========================================
// Verifactu Repository Implementation
// Persist Verifactu invoices to PostgreSQL
// ==========================================

import { PrismaClient, type Prisma } from '@prisma/client';
import { VerifactuInvoice, type VerifactuInvoiceProps, type VerifactuInvoiceStatus } from '../../domain/entities/VerifactuInvoice';
import type { IVerifactuRepository, VerifactuOrderUpdate } from '../../domain/repositories/IVerifactuRepository';

export class VerifactuRepository implements IVerifactuRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(invoice: VerifactuInvoice): Promise<void> {
    const data = invoice.toJSON();
    
    await this.prisma.verifactuInvoice.upsert({
      where: { id: data.id },
      update: {
        uuid: data.uuid,
        qrCode: data.qrCode,
        urlVerificacion: data.urlVerificacion,
        estado: data.estado,
        codigoError: data.codigoError,
        mensajeError: data.mensajeError,
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        orderId: data.orderId,
        serie: data.serie,
        numero: data.numero,
        fechaExpedicion: data.fechaExpedicion,
        tipoFactura: data.tipoFactura,
        descripcion: data.descripcion,
        nif: data.nif,
        nombre: data.nombre,
        lineas: data.lineas as unknown as Prisma.InputJsonValue,
        importeTotal: data.importeTotal,
        uuid: data.uuid,
        qrCode: data.qrCode,
        urlVerificacion: data.urlVerificacion,
        estado: data.estado,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<VerifactuInvoice | null> {
    const record = await this.prisma.verifactuInvoice.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findByOrderId(orderId: string): Promise<VerifactuInvoice | null> {
    const record = await this.prisma.verifactuInvoice.findFirst({
      where: { orderId },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findByUuid(uuid: string): Promise<VerifactuInvoice | null> {
    const record = await this.prisma.verifactuInvoice.findFirst({
      where: { uuid },
    });

    if (!record) return null;

    return this.mapToEntity(record);
  }

  async findByStatus(status: VerifactuInvoiceStatus): Promise<VerifactuInvoice[]> {
    const records = await this.prisma.verifactuInvoice.findMany({
      where: { estado: status },
    });

    return records.map(record => this.mapToEntity(record));
  }

  async updateOrderVerifactuData(orderId: string, data: VerifactuOrderUpdate): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        verifactuUuid: data.verifactuUuid,
        verifactuQrCode: data.verifactuQrCode,
        verifactuUrl: data.verifactuUrl,
        verifactuStatus: data.verifactuStatus,
        verifactuRegisteredAt: data.verifactuRegisteredAt,
      },
    });
  }

  private mapToEntity(record: any): VerifactuInvoice {
    const props: VerifactuInvoiceProps = {
      id: record.id,
      orderId: record.orderId,
      serie: record.serie,
      numero: record.numero,
      fechaExpedicion: record.fechaExpedicion,
      tipoFactura: record.tipoFactura,
      descripcion: record.descripcion,
      nif: record.nif,
      nombre: record.nombre,
      lineas: record.lineas as unknown as VerifactuInvoiceProps['lineas'],
      importeTotal: record.importeTotal,
      uuid: record.uuid,
      qrCode: record.qrCode,
      urlVerificacion: record.urlVerificacion,
      estado: record.estado,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return VerifactuInvoice.fromPrisma(props);
  }
}