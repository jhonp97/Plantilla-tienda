import type { Order, CreateOrderInput, OrderStatus } from '../entities/Order';

export type OrderFilters = {
  userId?: string;
  status?: OrderStatus;
  paymentIntentId?: string;
  orderNumber?: string;
  fromDate?: Date;
  toDate?: Date;
};

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface IOrderRepository {
  // Create
  create(input: CreateOrderInput): Promise<Order>;

  // Read
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<Order | null>;
  findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Order>>;
  findMany(
    filters?: OrderFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Order>>;

  // Update
  update(id: string, data: Partial<{
    status: OrderStatus;
    paymentIntentId: string;
    notes: string;
    customerNif: string;
    paidAt: Date;
    shippedAt: Date;
    deliveredAt: Date;
    cancelledAt: Date;
    cancellationReason: string;
  }>): Promise<Order>;

  // Add item to order
  addItem(orderId: string, item: any): Promise<Order>;

  // Delete (soft delete / cancel)
  cancel(id: string, reason?: string): Promise<Order>;

  // Utility
  existsByOrderNumber(orderNumber: string): Promise<boolean>;
  count(filters?: OrderFilters): Promise<number>;
}