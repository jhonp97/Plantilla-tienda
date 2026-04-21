import type { Invoice, CreateInvoiceInput } from '../entities/Invoice';

export interface FindAllOptions {
  skip?: number;
  take?: number;
}

export interface IInvoiceRepository {
  // Create
  create(input: CreateInvoiceInput): Promise<Invoice>;

  // Read
  findById(id: string): Promise<Invoice | null>;
  findByOrderId(orderId: string): Promise<Invoice | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findAll(options?: FindAllOptions): Promise<Invoice[]>;
  count(): Promise<number>;

  // Update (only for Verifactu data)
  updateVerifactuData(
    id: string,
    data: { uuid: string; qrCode: string; url: string; status: string }
  ): Promise<Invoice>;

  // Utility
  existsByOrderId(orderId: string): Promise<boolean>;
}