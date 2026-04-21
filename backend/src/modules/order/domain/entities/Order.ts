import type { OrderItemProps } from './OrderItem';
import type { AddressProps } from './Address';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';

export type OrderProps = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number; // in cents
  taxAmount: number; // in cents
  shippingCost: number; // in cents
  discountAmount: number; // in cents
  totalAmount: number; // in cents
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  shippingAddress: AddressProps;
  billingAddress?: AddressProps;
  notes?: string;
  customerNif?: string;
  guestFullName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestNifCif?: string;
  items: OrderItemProps[];
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateOrderInput {
  userId: string;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country?: string;
  };
  billingAddress?: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
  customerNif?: string;
}

// ==========================================
// Order State Machine (Legal Compliance)
// ==========================================
// Valid transitions:
//   PENDING → PAID | CANCELLED
//   PAID → PROCESSING | CANCELLED (if cancelled, creates credit note)
//   PROCESSING → SHIPPED | CANCELLED (if cancelled, creates credit note)
//   SHIPPED → DELIVERED
//   DELIVERED → REFUNDED (post-delivery refund)
//
// Cancellation Rules:
// - PENDING: Direct cancellation, no credit note needed
// - PAID/PROCESSING: Cancellation creates credit note for tax purposes
// - SHIPPED/DELIVERED: Cannot cancel, must refund
//
// Immutability:
// - Once PAID, PROCESSING, SHIPPED, or DELIVERED: core order data is immutable
// - Only tracking number can be updated after SHIPPING
// ==========================================
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [], // Only refund after delivery
  CANCELLED: [],
};

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(input: CreateOrderInput): Order {
    if (!input.userId) {
      throw new Error('User ID is required');
    }
    if (!input.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    if (!input.paymentMethod) {
      throw new Error('Payment method is required');
    }

    const now = new Date();
    const orderNumber = Order.generateOrderNumber(now);

    // Normalize addresses with default country
    const normalizeAddress = (addr: CreateOrderInput['shippingAddress']) => ({
      street: addr.street,
      postalCode: addr.postalCode,
      city: addr.city,
      province: addr.province,
      country: addr.country ?? 'España',
    });

    const shippingAddress = normalizeAddress(input.shippingAddress);
    const billingAddress = input.billingAddress 
      ? normalizeAddress(input.billingAddress)
      : shippingAddress;

    return new Order({
      id: crypto.randomUUID(),
      orderNumber,
      userId: input.userId,
      status: 'PENDING',
      subtotal: 0,
      taxAmount: 0,
      shippingCost: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentMethod: input.paymentMethod,
      shippingAddress,
      billingAddress,
      notes: input.notes,
      customerNif: input.customerNif,
      items: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrisma(props: OrderProps): Order {
    return new Order(props);
  }

  static generateOrderNumber(date: Date): string {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${year}${month}${day}-${random}`;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get orderNumber(): string {
    return this.props.orderNumber;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get subtotal(): number {
    return this.props.subtotal;
  }

  get taxAmount(): number {
    return this.props.taxAmount;
  }

  get shippingCost(): number {
    return this.props.shippingCost;
  }

  get discountAmount(): number {
    return this.props.discountAmount;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get paymentIntentId(): string | undefined {
    return this.props.paymentIntentId;
  }

  get shippingAddress(): AddressProps {
    return this.props.shippingAddress;
  }

  get billingAddress(): AddressProps | undefined {
    return this.props.billingAddress;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get customerNif(): string | undefined {
    return this.props.customerNif;
  }

  get guestFullName(): string | undefined {
    return this.props.guestFullName;
  }

  get guestEmail(): string | undefined {
    return this.props.guestEmail;
  }

  get guestPhone(): string | undefined {
    return this.props.guestPhone;
  }

  get guestNifCif(): string | undefined {
    return this.props.guestNifCif;
  }

  get items(): OrderItemProps[] {
    return this.props.items;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get shippedAt(): Date | undefined {
    return this.props.shippedAt;
  }

  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // State machine methods
  canTransitionTo(newStatus: OrderStatus): boolean {
    const validTransitions = VALID_TRANSITIONS[this.props.status];
    return validTransitions.includes(newStatus);
  }

  validateStateTransition(newStatus: OrderStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid state transition from ${this.props.status} to ${newStatus}. ` +
        `Valid transitions: ${VALID_TRANSITIONS[this.props.status].join(', ')}`
      );
    }
  }

  // Domain methods
  markAsPaid(paymentIntentId: string): void {
    this.validateStateTransition('PAID');
    this.props.status = 'PAID';
    this.props.paymentIntentId = paymentIntentId;
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsProcessing(): void {
    this.validateStateTransition('PROCESSING');
    this.props.status = 'PROCESSING';
    this.props.updatedAt = new Date();
  }

  markAsShipped(): void {
    this.validateStateTransition('SHIPPED');
    this.props.status = 'SHIPPED';
    this.props.shippedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsDelivered(): void {
    this.validateStateTransition('DELIVERED');
    this.props.status = 'DELIVERED';
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsCancelled(reason?: string): void {
    this.validateStateTransition('CANCELLED');
    this.props.status = 'CANCELLED';
    this.props.cancelledAt = new Date();
    this.props.cancellationReason = reason;
    this.props.updatedAt = new Date();
  }

  markAsRefunded(): void {
    // REFUNDED is not a separate status in the simplified enum
    // Treat as cancellation after delivery
    this.markAsCancelled('Refunded after delivery');
  }

  setShippingCost(cost: number): void {
    if (cost < 0) {
      throw new Error('Shipping cost cannot be negative');
    }
    this.props.shippingCost = cost;
    this.calculateTotals();
    this.props.updatedAt = new Date();
  }

  applyDiscount(discountAmount: number): void {
    if (discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    if (discountAmount > this.props.subtotal) {
      throw new Error('Discount cannot exceed subtotal');
    }
    this.props.discountAmount = discountAmount;
    this.calculateTotals();
    this.props.updatedAt = new Date();
  }

  calculateTotals(): void {
    const itemsSubtotal = this.props.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountAmount || 0;
      return sum + itemSubtotal - itemDiscount;
    }, 0);

    const itemsTax = this.props.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountAmount || 0;
      const net = itemSubtotal - itemDiscount;
      const itemTax = Math.round(net * (item.taxRate / 100));
      return sum + itemTax;
    }, 0);

    this.props.subtotal = itemsSubtotal;
    this.props.taxAmount = itemsTax;
    this.props.totalAmount = itemsSubtotal + this.props.taxAmount + this.props.shippingCost - this.props.discountAmount;
    this.props.updatedAt = new Date();
  }

  addItem(item: OrderItemProps): void {
    this.props.items.push(item);
    this.calculateTotals();
    this.props.updatedAt = new Date();
  }

  removeItem(itemId: string): void {
    const index = this.props.items.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Item not found in order');
    }
    this.props.items.splice(index, 1);
    this.calculateTotals();
    this.props.updatedAt = new Date();
  }

  getTotalItems(): number {
    return this.props.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  isPaid(): boolean {
    return this.props.status === 'PAID';
  }

  isCancelled(): boolean {
    return this.props.status === 'CANCELLED';
  }

  isRefunded(): boolean {
    // REFUNDED is treated as CANCELLED in the simplified model
    // Check if cancelled with refund reason
    return this.props.status === 'CANCELLED' && 
           this.props.cancellationReason?.toLowerCase().includes('refund') === true;
  }

  toJSON(): OrderProps {
    return { ...this.props };
  }
}