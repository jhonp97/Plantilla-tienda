import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { ProductPerformanceResponse, ProductPerformanceData } from '../../dto/ProductPerformanceDto';

export class GetProductPerformanceUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductPerformanceResponse> {
    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
    };

    // Get all paid orders in date range
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items
      .map(o => o.toJSON())
      .filter(o => o.status === 'PAID');

    // Calculate product performance metrics
    const productPerformance = this.calculateProductMetrics(orders);

    // Sort by revenue
    const sortedProducts = productPerformance.sort((a, b) => b.revenue - a.revenue);

    // Calculate totals for percentages
    const totalUnitsSold = sortedProducts.reduce((sum, p) => sum + p.unitsSold, 0);
    const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);

    // Calculate pagination
    const totalProducts = sortedProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Transform to response format
    const products: ProductPerformanceData[] = paginatedProducts.map(product => ({
      productId: product.productId,
      productName: product.productName,
      productSku: product.productSku,
      categoryName: undefined, // Would require category join
      unitsSold: product.unitsSold,
      revenue: product.revenue,
      orders: product.orderCount,
      averageOrderQuantity: product.orderCount > 0 
        ? Math.round(product.unitsSold / product.orderCount * 100) / 100 
        : 0,
      currentStock: 0, // Would require product stock lookup
      stockSold: product.unitsSold,
      revenuePercentage: totalRevenue > 0 
        ? Math.round((product.revenue / totalRevenue) * 100 * 100) / 100 
        : 0,
    }));

    return {
      products,
      totalProducts,
      totalUnitsSold,
      totalRevenue,
      page,
      limit,
      totalPages,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  private calculateProductMetrics(orders: any[]): Array<{
    productId: string;
    productName: string;
    productSku?: string;
    unitsSold: number;
    revenue: number;
    orderCount: number;
  }> {
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      productSku?: string;
      unitsSold: number;
      revenue: number;
      orderCount: number;
    }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          unitsSold: 0,
          revenue: 0,
          orderCount: 0,
        };

        existing.unitsSold += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        existing.orderCount += 1;
        productMap.set(item.productId, existing);
      }
    }

    return Array.from(productMap.values());
  }
}