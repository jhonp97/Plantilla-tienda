import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';

interface CustomerStats {
  userId: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  customerName: string;
}

export class GetTopCustomersUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(
    startDate?: Date,
    endDate?: Date,
    limit: number = 10
  ): Promise<{
    topCustomers: CustomerStats[];
    totalCustomers: number;
  }> {
    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
      // Only get paid orders
    };

    // Get all paid orders
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items
      .map(o => o.toJSON())
      .filter(o => o.status === 'PAID');

    // Aggregate by user ID
    const customerMap = new Map<string, {
      userId: string;
      email: string; // Would come from User module in real implementation
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: Date;
      orders: any[];
    }>();

    for (const order of orders) {
      // Skip guest orders
      if (order.userId === 'guest' || !order.userId) continue;

      const existing = customerMap.get(order.userId) || {
        userId: order.userId,
        email: `${order.userId}@example.com`, // Placeholder - would query user
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: new Date(0),
        orders: [],
      };

      existing.totalOrders += 1;
      existing.totalSpent += order.totalAmount;
      existing.orders.push(order);

      if (new Date(order.createdAt) > existing.lastOrderDate) {
        existing.lastOrderDate = new Date(order.createdAt);
      }

      customerMap.set(order.userId, existing);
    }

    // Transform to customer stats
    const customerStats: CustomerStats[] = Array.from(customerMap.values()).map(customer => ({
      userId: customer.userId,
      email: customer.email,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      averageOrderValue: Math.round(customer.totalSpent / customer.totalOrders),
      lastOrderDate: customer.lastOrderDate,
      customerName: customer.email.split('@')[0] || 'Cliente', // Placeholder with fallback
    }));

    // Sort by total spent and take top N
    const topCustomers = customerStats
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);

    return {
      topCustomers,
      totalCustomers: customerStats.length,
    };
  }
}