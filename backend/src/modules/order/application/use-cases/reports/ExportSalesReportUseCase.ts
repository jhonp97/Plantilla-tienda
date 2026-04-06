import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { GenerateReportDto } from '../../dto/GenerateReportDto';

interface SalesRow {
  orderNumber: string;
  date: string;
  customerEmail: string;
  customerNif: string;
  productCount: number;
  subtotal: number; // in euros
  taxAmount: number; // in euros
  shippingCost: number; // in euros
  total: number; // in euros
  paymentMethod: string;
  status: string;
}

// Helper to convert cents to euros
const centsToEuros = (cents: number): number => {
  return Math.round(cents / 100 * 100) / 100;
};

// Helper to format date
const formatDate = (date: Date): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0] || '';
};

export class ExportSalesReportUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(dto: GenerateReportDto): Promise<Buffer> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    const filters: OrderFilters = {
      fromDate: startDate,
      toDate: endDate,
    };

    // Apply status filter if provided
    if (dto.orderStatuses && dto.orderStatuses.length > 0) {
      filters.status = dto.orderStatuses[0] as any;
    }

    // Get all orders in date range
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items.map(o => o.toJSON());

    // Transform to sales report format
    const salesRows: SalesRow[] = orders.map(order => ({
      orderNumber: order.orderNumber,
      date: formatDate(order.createdAt),
      customerEmail: 'customer@example.com', // Would come from User module
      customerNif: order.customerNif || '',
      productCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      subtotal: centsToEuros(order.subtotal),
      taxAmount: centsToEuros(order.taxAmount),
      shippingCost: centsToEuros(order.shippingCost),
      total: centsToEuros(order.totalAmount),
      paymentMethod: order.paymentMethod,
      status: order.status,
    }));

    // Generate CSV
    return this.generateCSV(salesRows);
  }

  private generateCSV(rows: SalesRow[]): Buffer {
    const headers = [
      'Order Number',
      'Date',
      'Customer Email',
      'Customer NIF',
      'Product Count',
      'Subtotal',
      'Tax Amount',
      'Shipping Cost',
      'Total',
      'Payment Method',
      'Status',
    ];

    const csvLines: string[] = [headers.join(',')];

    for (const row of rows) {
      const line = [
        row.orderNumber,
        row.date,
        row.customerEmail,
        row.customerNif,
        row.productCount.toString(),
        row.subtotal.toString(),
        row.taxAmount.toString(),
        row.shippingCost.toString(),
        row.total.toString(),
        row.paymentMethod,
        row.status,
      ].join(',');
      csvLines.push(line);
    }

    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }
}