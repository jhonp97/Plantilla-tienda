import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { SalesAnalyticsRequest, SalesAnalyticsResponse, AnalyticsGranularity } from '../../dto/SalesAnalyticsDto';

export class GetSalesAnalyticsUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(dto: SalesAnalyticsRequest): Promise<SalesAnalyticsResponse> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
    };

    // Get all paid orders in date range
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items
      .map(o => o.toJSON())
      .filter(o => o.status === 'PAID');

    // Generate sales over time based on granularity
    const salesOverTime = this.generateSalesOverTime(orders, dto.granularity, startDate, endDate);

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate top products
    const topProducts = this.calculateTopProducts(orders);

    // Calculate sales by payment method
    const salesByPaymentMethod = this.calculateSalesByPaymentMethod(orders);

    return {
      salesOverTime,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByPaymentMethod,
      startDate: dto.startDate,
      endDate: dto.endDate,
      granularity: dto.granularity,
    };
  }

  private generateSalesOverTime(
    orders: any[],
    granularity: AnalyticsGranularity,
    startDate: Date,
    endDate: Date
  ): Array<{ period: string; revenue: number; orders: number; averageOrderValue: number }> {
    const periodMap = new Map<string, { revenue: number; orders: number }>();

    // Determine period format and bucket size
    const formatPeriod = (date: Date): string => {
      switch (granularity) {
        case 'daily': {
          const result = date.toISOString().split('T')[0];
          return result || '';
        }
        case 'weekly': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const result = weekStart.toISOString().split('T')[0];
          return result || '';
        }
        case 'monthly':
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        case 'yearly':
          return String(date.getFullYear());
        default: {
          const result = date.toISOString().split('T')[0];
          return result || '';
        }
      }
    };

    // Group orders by period
    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const period = formatPeriod(orderDate);
      
      const existing = periodMap.get(period) || { revenue: 0, orders: 0 };
      existing.revenue += order.totalAmount;
      existing.orders += 1;
      periodMap.set(period, existing);
    }

    // Convert to array and sort by period
    const result = Array.from(periodMap.entries()).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders,
      averageOrderValue: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
    }));

    return result.sort((a, b) => a.period.localeCompare(b.period));
  }

  private calculateTopProducts(orders: any[]): Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
    percentageOfTotal: number;
  }> {
    const productMap = new Map<string, { name: string; sold: number; revenue: number }>();
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productMap.get(item.productId) || { name: item.productName, sold: 0, revenue: 0 };
        existing.sold += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        productMap.set(item.productId, existing);
      }
    }

    const totalProductsSold = Array.from(productMap.values()).reduce((sum, p) => sum + p.sold, 0);

    return Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        totalSold: data.sold,
        revenue: data.revenue,
        percentageOfTotal: totalProductsSold > 0 
          ? Math.round((data.sold / totalProductsSold) * 100 * 100) / 100 
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private calculateSalesByPaymentMethod(orders: any[]): Record<string, number> {
    const result: Record<string, number> = {};

    for (const order of orders) {
      const method = order.paymentMethod;
      result[method] = (result[method] || 0) + order.totalAmount;
    }

    return result;
  }
}