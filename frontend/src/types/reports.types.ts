/**
 * Reports Types - Interfaces for admin reports
 */

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  status: ReportStatus;
  fileUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export type ReportType = 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'TAX' | 'SHIPPING';

export type ReportFormat = 'PDF' | 'CSV' | 'EXCEL';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SalesReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalTax: number;
    totalShipping: number;
    totalRefunds: number;
  };
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    orders: number;
    refunds: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  summary: {
    totalProducts: number;
    totalStock: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  products: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  }>;
}

export interface CustomerReport {
  summary: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageLTV: number;
  };
  customers: Array<{
    customerId: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  }>;
}

export interface CreateReportInput {
  name: string;
  type: ReportType;
  format: ReportFormat;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}