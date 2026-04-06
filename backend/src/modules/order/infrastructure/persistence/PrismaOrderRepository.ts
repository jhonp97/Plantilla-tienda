import type { PrismaClient } from '@shared/infra/prisma/client';
import type { 
  IOrderRepository, 
  OrderFilters, 
  PaginationParams, 
  PaginatedResult 
} from '@modules/order/domain/repositories/IOrderRepository';
import type { Order, CreateOrderInput, OrderStatus } from '@modules/order/domain/entities/Order';
import type { OrderItemProps } from '@modules/order/domain/entities/OrderItem';
import { Order as OrderEntity } from '@modules/order/domain/entities/Order';

interface PrismaOrderRecord {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  guestFullName: string | null;
  guestPhone: string | null;
  guestNifCif: string | null;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  stripePaymentIntentId: string | null;
  shippingAddressId: string;
  billingAddressId: string | null;
  notes: string | null;
  customerNif: string | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
  shippingAddress: {
    id: string;
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
    isDefault: boolean;
  };
  billingAddress: {
    id: string;
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
    isDefault: boolean;
  } | null;
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateOrderInput): Promise<Order> {
    // Create addresses first if needed
    const shippingAddress = await this.prisma.address.create({
      data: {
        street: input.shippingAddress.street,
        postalCode: input.shippingAddress.postalCode,
        city: input.shippingAddress.city,
        province: input.shippingAddress.province,
        country: input.shippingAddress.country ?? 'España',
        isDefault: false,
      },
    });

    let billingAddressId: string | undefined;
    if (input.billingAddress) {
      const billingAddress = await this.prisma.address.create({
        data: {
          street: input.billingAddress.street,
          postalCode: input.billingAddress.postalCode,
          city: input.billingAddress.city,
          province: input.billingAddress.province,
          country: input.billingAddress.country ?? 'España',
          isDefault: false,
        },
      });
      billingAddressId = billingAddress.id;
    }

    const record = await this.prisma.order.create({
      data: {
        orderNumber: OrderEntity.generateOrderNumber(new Date()),
        userId: input.userId === 'guest' ? null : input.userId,
        status: 'PENDING',
        subtotal: 0,
        shippingCost: 0,
        taxAmount: 0,
        totalAmount: 0,
        paymentMethod: input.paymentMethod,
        shippingAddressId: shippingAddress.id,
        billingAddressId,
        notes: input.notes,
        customerNif: input.customerNif,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!record) return null;

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!record) return null;

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!record) return null;

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async findByUserId(userId: string, pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    const orders = items.map(item => this.mapToEntity(item as unknown as PrismaOrderRecord));

    return {
      items: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async findMany(filters?: OrderFilters, pagination?: PaginationParams): Promise<PaginatedResult<Order>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.paymentIntentId) {
      where.stripePaymentIntentId = filters.paymentIntentId;
    }
    if (filters?.orderNumber) {
      where.orderNumber = filters.orderNumber;
    }
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters?.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      if (filters?.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const orders = items.map(item => this.mapToEntity(item as unknown as PrismaOrderRecord));

    return {
      items: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async update(
    id: string, 
    data: Partial<{
      status: OrderStatus;
      paymentIntentId: string;
      notes: string;
      customerNif: string;
      paidAt: Date;
      shippedAt: Date;
      deliveredAt: Date;
      cancelledAt: Date;
      cancellationReason: string;
    }>
  ): Promise<Order> {
    const updateData: any = {};
    
    if (data.status) updateData.status = data.status;
    if (data.paymentIntentId) updateData.stripePaymentIntentId = data.paymentIntentId;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.customerNif) updateData.customerNif = data.customerNif;
    if (data.paidAt) updateData.paidAt = data.paidAt;
    if (data.shippedAt) updateData.shippedAt = data.shippedAt;
    if (data.deliveredAt) updateData.deliveredAt = data.deliveredAt;
    if (data.cancelledAt) updateData.cancelledAt = data.cancelledAt;
    if (data.cancellationReason !== undefined) updateData.cancellationReason = data.cancellationReason;

    const record = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async addItem(orderId: string, item: any): Promise<Order> {
    await this.prisma.orderItem.create({
      data: {
        orderId,
        productId: item.productId,
        productName: item.productName,
        productPrice: item.unitPrice,
        quantity: item.quantity,
      },
    });

    const order = await this.findById(orderId);
    if (!order) {
      throw new Error('Order not found after adding item');
    }

    return order;
  }

  async cancel(id: string, reason?: string): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    return this.mapToEntity(record as unknown as PrismaOrderRecord);
  }

  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: { orderNumber },
    });
    return count > 0;
  }

  async count(filters?: OrderFilters): Promise<number> {
    const where: any = {};
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.paymentIntentId) {
      where.stripePaymentIntentId = filters.paymentIntentId;
    }
    if (filters?.orderNumber) {
      where.orderNumber = filters.orderNumber;
    }
    if (filters?.fromDate || filters?.toDate) {
      where.createdAt = {};
      if (filters?.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      if (filters?.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    return this.prisma.order.count({ where });
  }

  private mapToEntity(record: PrismaOrderRecord): Order {
    const items: OrderItemProps[] = record.items.map(item => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      productSku: undefined,
      quantity: item.quantity,
      unitPrice: item.productPrice,
      taxRate: 21,
      discountAmount: 0,
      createdAt: record.createdAt,
    }));

    const orderProps = {
      id: record.id,
      orderNumber: record.orderNumber,
      userId: record.userId ?? 'guest',
      status: record.status as OrderStatus,
      subtotal: record.subtotal,
      taxAmount: record.taxAmount,
      shippingCost: record.shippingCost,
      discountAmount: 0,
      totalAmount: record.totalAmount,
      paymentMethod: record.paymentMethod as any,
      paymentIntentId: record.stripePaymentIntentId ?? undefined,
      shippingAddress: {
        street: record.shippingAddress.street,
        postalCode: record.shippingAddress.postalCode,
        city: record.shippingAddress.city,
        province: record.shippingAddress.province,
        country: record.shippingAddress.country,
        isDefault: record.shippingAddress.isDefault,
      },
      billingAddress: record.billingAddress ? {
        street: record.billingAddress.street,
        postalCode: record.billingAddress.postalCode,
        city: record.billingAddress.city,
        province: record.billingAddress.province,
        country: record.billingAddress.country,
        isDefault: record.billingAddress.isDefault,
      } : undefined,
      notes: record.notes ?? undefined,
      customerNif: record.customerNif ?? undefined,
      items,
      paidAt: record.paidAt ?? undefined,
      shippedAt: record.shippedAt ?? undefined,
      deliveredAt: record.deliveredAt ?? undefined,
      cancelledAt: record.cancelledAt ?? undefined,
      cancellationReason: record.cancellationReason ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return OrderEntity.fromPrisma(orderProps as any);
  }
}