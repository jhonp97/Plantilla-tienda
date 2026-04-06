import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { IProductRepository } from '@modules/product/domain/repositories/IProductRepository';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { DashboardStatsDto } from '../../dto/DashboardStatsDto';

type PeriodType = 'today' | 'week' | 'month' | 'year';

export class GetDashboardStatsUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private settingsRepo: IStoreSettingsRepository
  ) {}

  async execute(period: PeriodType = 'today'): Promise<DashboardStatsDto> {
    const now = new Date();
    const { startDate, endDate } = this.getDateRange(period, now);

    // Get all orders in date range
    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
    };

    const allTimeFilters: OrderFilters = {};

    // Get orders for the period
    const periodOrders = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const periodOrdersData = periodOrders.items.map(o => o.toJSON());

    // Get all orders for totals
    const allOrders = await this.orderRepo.findMany(allTimeFilters, { page: 1, limit: 10000 });
    const allOrdersData = allOrders.items.map(o => o.toJSON());

    // Calculate revenue
    const totalRevenue = this.calculateTotalRevenue(allOrdersData);
    const periodRevenue = this.calculateTotalRevenue(periodOrdersData);
    const revenueToday = this.calculateRevenueForToday(allOrdersData);
    const revenueThisWeek = this.calculateRevenueForThisWeek(allOrdersData);
    const revenueThisMonth = this.calculateRevenueForThisMonth(allOrdersData);
    const revenueThisYear = this.calculateRevenueForThisYear(allOrdersData);

    // Calculate orders count
    const totalOrders = allOrdersData.length;
    const ordersToday = this.countOrdersForToday(allOrdersData);
    const ordersThisWeek = this.countOrdersForThisWeek(allOrdersData);
    const ordersThisMonth = this.countOrdersForThisMonth(allOrdersData);
    const ordersThisYear = this.countOrdersForThisYear(allOrdersData);

    // Orders by status
    const ordersByStatus = this.groupOrdersByStatus(periodOrdersData);

    // Average order value
    const averageOrderValue = totalOrders > 0 
      ? Math.round(totalRevenue / totalOrders) 
      : 0;

    // Get settings for low stock threshold
    const settings = await this.settingsRepo.get();
    const settingsData = settings.toJSON();
    const lowStockThreshold = settingsData.lowStockThreshold;

    // Count low stock and out of stock products
    const lowStockProducts = await this.countLowStockProducts(lowStockThreshold);
    const outOfStockProducts = await this.countOutOfStockProducts();

    return {
      totalRevenue,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      revenueThisYear,
      totalOrders,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      ordersThisYear,
      ordersByStatus,
      averageOrderValue,
      totalCustomers: totalOrders, // Simplified - would need User module for real count
      newCustomersThisMonth: ordersThisMonth, // Simplified
      repeatCustomers: 0, // Would need User module
      totalProductsSold: this.calculateTotalProductsSold(periodOrdersData),
      lowStockProducts,
      outOfStockProducts,
      period,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
    };
  }

  private getDateRange(period: PeriodType, now: Date): { startDate: Date; endDate: Date } {
    const endDate = now;
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return { startDate, endDate };
  }

  private calculateTotalRevenue(orders: any[]): number {
    return orders
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private calculateRevenueForToday(orders: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders
      .filter(o => o.status === 'PAID' && new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private calculateRevenueForThisWeek(orders: any[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return orders
      .filter(o => o.status === 'PAID' && new Date(o.createdAt) >= weekAgo)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private calculateRevenueForThisMonth(orders: any[]): number {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    return orders
      .filter(o => o.status === 'PAID' && new Date(o.createdAt) >= monthStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private calculateRevenueForThisYear(orders: any[]): number {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    
    return orders
      .filter(o => o.status === 'PAID' && new Date(o.createdAt) >= yearStart)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private countOrdersForToday(orders: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders
      .filter(o => new Date(o.createdAt) >= today)
      .length;
  }

  private countOrdersForThisWeek(orders: any[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return orders
      .filter(o => new Date(o.createdAt) >= weekAgo)
      .length;
  }

  private countOrdersForThisMonth(orders: any[]): number {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    return orders
      .filter(o => new Date(o.createdAt) >= monthStart)
      .length;
  }

  private countOrdersForThisYear(orders: any[]): number {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    
    return orders
      .filter(o => new Date(o.createdAt) >= yearStart)
      .length;
  }

  private groupOrdersByStatus(orders: any[]): Record<string, number> {
    const statusCounts: Record<string, number> = {};
    
    for (const order of orders) {
      const status = order.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
    
    return statusCounts;
  }

  private calculateTotalProductsSold(orders: any[]): number {
    return orders
      .filter(o => o.status === 'PAID')
      .reduce((sum, o) => {
        return sum + o.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
      }, 0);
  }

  private async countLowStockProducts(threshold: number): Promise<number> {
    // Simplified - would use repository method in real implementation
    return 0;
  }

  private async countOutOfStockProducts(): Promise<number> {
    // Simplified - would use repository method in real implementation
    return 0;
  }
}