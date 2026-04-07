import type { VerifactuInvoice, VerifactuInvoiceStatus } from '../entities/VerifactuInvoice';

export interface VerifactuOrderUpdate {
  verifactuUuid?: string;
  verifactuQrCode?: string;
  verifactuUrl?: string;
  verifactuStatus?: string;
  verifactuRegisteredAt?: Date;
}

export interface IVerifactuRepository {
  save(invoice: VerifactuInvoice): Promise<void>;
  findById(id: string): Promise<VerifactuInvoice | null>;
  findByOrderId(orderId: string): Promise<VerifactuInvoice | null>;
  findByUuid(uuid: string): Promise<VerifactuInvoice | null>;
  findByStatus(status: VerifactuInvoiceStatus): Promise<VerifactuInvoice[]>;
  updateOrderVerifactuData(orderId: string, data: VerifactuOrderUpdate): Promise<void>;
}