/**
 * Analytics Service - API calls for analytics (admin only)
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, ApiError } from './api';
import type {
  AnalyticsOverview,
  SalesDataPoint,
  TopProduct,
  TopCategory,
  CustomerMetrics,
  AnalyticsFilters,
} from '../types/analytics.types';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export const analyticsService = {
  /**
   * Get analytics overview
   */
  async getOverview(): Promise<AnalyticsOverview> {
    return apiGet<AnalyticsOverview>('/api/analytics/overview', {}, deps);
  },

  /**
   * Get sales data over time
   */
  async getSalesData(filters: AnalyticsFilters): Promise<SalesDataPoint[]> {
    const params = new URLSearchParams();
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);
    
    return apiGet<SalesDataPoint[]>(`/api/analytics/sales?${params}`, {}, deps);
  },

  /**
   * Get top selling products
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    return apiGet<TopProduct[]>(`/api/analytics/top-products?limit=${limit}`, {}, deps);
  },

  /**
   * Get top categories
   */
  async getTopCategories(limit: number = 10): Promise<TopCategory[]> {
    return apiGet<TopCategory[]>(`/api/analytics/top-categories?limit=${limit}`, {}, deps);
  },

  /**
   * Get top customers
   */
  async getTopCustomers(limit: number = 10): Promise<CustomerMetrics[]> {
    return apiGet<CustomerMetrics[]>(`/api/analytics/top-customers?limit=${limit}`, {}, deps);
  },

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<{ period: string; revenue: number }[]> {
    return apiGet<{ period: string; revenue: number }[]>(
      `/api/analytics/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`,
      {},
      deps
    );
  },

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(): Promise<{ stage: string; count: number }[]> {
    return apiGet<{ stage: string; count: number }[]>('/api/analytics/conversion-funnel', {}, deps);
  },
};