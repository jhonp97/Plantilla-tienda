/**
 * Analytics Types - Interfaces for analytics and reporting (admin)
 */

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  revenue: number;
  imageUrl?: string;
}

export interface TopCategory {
  categoryId: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface CustomerMetrics {
  customerId: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageOrderValue: number;
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters extends AnalyticsDateRange {
  groupBy?: 'day' | 'week' | 'month';
}