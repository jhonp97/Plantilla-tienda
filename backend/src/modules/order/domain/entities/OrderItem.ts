export type OrderItemProps = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number; // in cents
  taxRate: number; // percentage (e.g., 21 for 21%)
  discountAmount: number; // in cents
  createdAt: Date;
};

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount?: number;
}

export class OrderItem {
  private constructor(private readonly props: OrderItemProps) {}

  static create(input: CreateOrderItemInput, orderId: string): OrderItem {
    if (!input.productId) {
      throw new Error('Product ID is required');
    }
    if (!input.productName) {
      throw new Error('Product name is required');
    }
    if (input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (input.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    if (input.taxRate < 0) {
      throw new Error('Tax rate cannot be negative');
    }

    return new OrderItem({
      id: crypto.randomUUID(),
      orderId,
      productId: input.productId,
      productName: input.productName,
      productSku: input.productSku,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      taxRate: input.taxRate,
      discountAmount: input.discountAmount ?? 0,
      createdAt: new Date(),
    });
  }

  static fromPrisma(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get productSku(): string | undefined {
    return this.props.productSku;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get taxRate(): number {
    return this.props.taxRate;
  }

  get discountAmount(): number {
    return this.props.discountAmount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // Domain methods
  get subtotal(): number {
    return this.quantity * this.unitPrice;
  }

  get taxAmount(): number {
    const subtotal = this.subtotal - this.discountAmount;
    return Math.round(subtotal * (this.taxRate / 100));
  }

  get total(): number {
    return this.subtotal - this.discountAmount + this.taxAmount;
  }

  toJSON(): OrderItemProps {
    return { ...this.props };
  }
}