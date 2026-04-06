import type { IOrderRepository, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { GenerateReportDto } from '../../dto/GenerateReportDto';

interface InvoiceRow {
  numeroFactura: string;
  fechaEmision: string;
  nifCliente: string;
  nombreCliente: string;
  direccion: string;
  baseImponible: number; // in euros
  tipoIva: string;
  cuotaIva: number; // in euros
  totalFactura: number; // in euros
  estado: string;
}

// Helper to convert cents to euros
const centsToEuros = (cents: number): number => {
  return Math.round(cents / 100 * 100) / 100;
};

// Helper to format date for Spanish invoice format
const formatDate = (date: Date): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper to format address
const formatAddress = (address: any): string => {
  if (!address) return '';
  return `${address.street}, ${address.postalCode} ${address.city}, ${address.province}`;
};

export class GenerateInvoicesReportUseCase {
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

    // Get paid orders in date range
    const ordersResult = await this.orderRepo.findMany(filters, { page: 1, limit: 10000 });
    const orders = ordersResult.items.map(o => o.toJSON());

    // Transform to invoice format for Hacienda (modelo 303)
    const invoiceRows: InvoiceRow[] = orders.map(order => ({
      numeroFactura: order.orderNumber,
      fechaEmision: formatDate(order.createdAt),
      nifCliente: order.customerNif || '',
      nombreCliente: 'Cliente', // Would need User module for full name
      direccion: formatAddress(order.shippingAddress),
      baseImponible: centsToEuros(order.subtotal),
      tipoIva: '21%',
      cuotaIva: centsToEuros(order.taxAmount),
      totalFactura: centsToEuros(order.totalAmount),
      estado: 'PAGADA',
    }));

    // Generate CSV
    return this.generateCSV(invoiceRows);
  }

  private generateCSV(rows: InvoiceRow[]): Buffer {
    const headers = [
      'Número Factura',
      'Fecha Emisión',
      'NIF Cliente',
      'Nombre Cliente',
      'Dirección',
      'Base Imponible',
      'Tipo IVA',
      'Cuota IVA',
      'Total Factura',
      'Estado',
    ];

    const csvLines: string[] = [headers.join(',')];

    for (const row of rows) {
      const line = [
        row.numeroFactura,
        row.fechaEmision,
        row.nifCliente,
        this.escapeCSV(row.nombreCliente),
        this.escapeCSV(row.direccion),
        row.baseImponible.toString(),
        row.tipoIva,
        row.cuotaIva.toString(),
        row.totalFactura.toString(),
        row.estado,
      ].join(',');
      csvLines.push(line);
    }

    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }

  private escapeCSV(value: string): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains special characters
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}