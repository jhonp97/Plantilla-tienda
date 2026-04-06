import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { GenerateReportDto } from '../../dto/GenerateReportDto';

interface ProductRow {
  productId: string;
  productName: string;
  productSku: string;
  unitsSold: number;
  revenue: number; // in euros
  averagePrice: number; // in euros
  percentageOfTotal: number;
}

// Helper to convert cents to euros
const centsToEuros = (cents: number): number => {
  return Math.round(cents / 100 * 100) / 100;
};

export class ExportProductsReportUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(dto: GenerateReportDto): Promise<Buffer> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
      status: 'PAID',
    };

    // Get all paid orders in date range
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items.map(o => o.toJSON());

    // Aggregate product sales
    const productMap = new Map<string, {
      productId: string;
      productName: string;
      productSku: string;
      unitsSold: number;
      revenue: number;
    }>();

    let totalRevenue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku || '',
          unitsSold: 0,
          revenue: 0,
        };

        existing.unitsSold += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        totalRevenue += item.unitPrice * item.quantity;

        productMap.set(item.productId, existing);
      }
    }

    // Transform to product report format
    const productRows: ProductRow[] = Array.from(productMap.values()).map(product => ({
      productId: product.productId,
      productName: product.productName,
      productSku: product.productSku,
      unitsSold: product.unitsSold,
      revenue: centsToEuros(product.revenue),
      averagePrice: product.unitsSold > 0 
        ? centsToEuros(Math.round(product.revenue / product.unitsSold))
        : 0,
      percentageOfTotal: totalRevenue > 0 
        ? Math.round((product.revenue / totalRevenue) * 100 * 100) / 100 
        : 0,
    }));

    // Sort by revenue descending
    productRows.sort((a, b) => b.revenue - a.revenue);

    // Generate CSV
    return this.generateCSV(productRows);
  }

  private generateCSV(rows: ProductRow[]): Buffer {
    const headers = [
      'Product ID',
      'Product Name',
      'SKU',
      'Units Sold',
      'Revenue',
      'Average Price',
      '% of Total',
    ];

    const csvLines: string[] = [headers.join(',')];

    for (const row of rows) {
      const line = [
        row.productId,
        this.escapeCSV(row.productName),
        row.productSku,
        row.unitsSold.toString(),
        row.revenue.toString(),
        row.averagePrice.toString(),
        row.percentageOfTotal.toString(),
      ].join(',');
      csvLines.push(line);
    }

    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }

  private escapeCSV(value: string): string {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}