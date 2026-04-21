export type InvoiceStatus = 'PENDING' | 'REGISTERED' | 'VERIFIED' | 'CANCELLED';

export interface CustomerSnapshot {
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
}

export interface InvoiceItemSnapshot {
  productId: string;
  productName: string;
  productPrice: number; // cents
  quantity: number;
  taxRate: number;
}

export interface InvoiceProps {
  id: string;
  orderId: string;
  invoiceNumber: string;
  customerSnapshot: CustomerSnapshot;
  itemsSnapshot: InvoiceItemSnapshot[];
  subtotal: number; // cents
  taxAmount: number; // cents
  total: number; // cents
  taxRate: number; // percentage
  verifactuUuid?: string;
  verifactuQrCode?: string;
  verifactuUrl?: string;
  verifactuStatus?: string;
  verifactuRegisteredAt?: Date;
  createdAt: Date;
}

export interface CreateInvoiceInput {
  orderId: string;
  customerSnapshot: CustomerSnapshot;
  itemsSnapshot: InvoiceItemSnapshot[];
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
}

export class Invoice {
  private constructor(private readonly props: InvoiceProps) {}

  static create(input: CreateInvoiceInput): Invoice {
    const now = new Date();
    const invoiceNumber = Invoice.generateInvoiceNumber(now);

    return new Invoice({
      id: crypto.randomUUID(),
      orderId: input.orderId,
      invoiceNumber,
      customerSnapshot: input.customerSnapshot,
      itemsSnapshot: input.itemsSnapshot,
      subtotal: input.subtotal,
      taxAmount: input.taxAmount,
      total: input.total,
      taxRate: input.taxRate,
      verifactuUuid: undefined,
      verifactuQrCode: undefined,
      verifactuUrl: undefined,
      verifactuStatus: undefined,
      verifactuRegisteredAt: undefined,
      createdAt: now,
    });
  }

  static fromPrisma(props: InvoiceProps): Invoice {
    return new Invoice(props);
  }

  static generateInvoiceNumber(date: Date): string {
    const year = date.getFullYear();
    // In a real system, this would query DB for last invoice number in year
    // For now, use timestamp-based counter
    const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
    return `F-${year}-${timestamp}`;
  }

  // Getters only - immutable entity
  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get invoiceNumber(): string {
    return this.props.invoiceNumber;
  }

  get customerSnapshot(): CustomerSnapshot {
    return this.props.customerSnapshot;
  }

  get itemsSnapshot(): InvoiceItemSnapshot[] {
    return this.props.itemsSnapshot;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get taxAmount(): number {
    return this.props.taxAmount;
  }

  get total(): number {
    return this.props.total;
  }

  get taxRate(): number {
    return this.props.taxRate;
  }

  get verifactuUuid(): string | undefined {
    return this.props.verifactuUuid;
  }

  get verifactuQrCode(): string | undefined {
    return this.props.verifactuQrCode;
  }

  get verifactuUrl(): string | undefined {
    return this.props.verifactuUrl;
  }

  get verifactuStatus(): string | undefined {
    return this.props.verifactuStatus;
  }

  get verifactuRegisteredAt(): Date | undefined {
    return this.props.verifactuRegisteredAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain methods for Verifactu data (only setters allowed for updating)
  setVerifactuData(uuid: string, qrCode: string, url: string): void {
    this.props.verifactuUuid = uuid;
    this.props.verifactuQrCode = qrCode;
    this.props.verifactuUrl = url;
  }

  markAsRegistered(): void {
    this.props.verifactuStatus = 'REGISTERED';
    this.props.verifactuRegisteredAt = new Date();
  }

  markAsVerified(): void {
    this.props.verifactuStatus = 'VERIFIED';
  }

  markAsCancelled(): void {
    this.props.verifactuStatus = 'CANCELLED';
  }

  toJSON(): InvoiceProps {
    return { ...this.props };
  }
}