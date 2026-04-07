/**
 * Reports Service - API calls for admin reports
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, ApiError } from './api';
import type {
  Report,
  CreateReportInput,
  SalesReport,
  InventoryReport,
  CustomerReport,
} from '../types/reports.types';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export const reportsService = {
  /**
   * Get all reports
   */
  async getReports(): Promise<Report[]> {
    return apiGet<Report[]>('/api/reports', {}, deps);
  },

  /**
   * Get single report by ID
   */
  async getReport(reportId: string): Promise<Report> {
    return apiGet<Report>(`/api/reports/${reportId}`, {}, deps);
  },

  /**
   * Create a new report
   */
  async createReport(data: CreateReportInput): Promise<Report> {
    return apiPost<Report>('/api/reports', data, {}, deps);
  },

  /**
   * Download report file
   */
  async downloadReport(reportId: string): Promise<{ url: string }> {
    return apiGet<{ url: string }>(`/api/reports/${reportId}/download`, {}, deps);
  },

  /**
   * Get sales report
   */
  async getSalesReport(startDate: string, endDate: string): Promise<SalesReport> {
    return apiGet<SalesReport>(
      `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`,
      {},
      deps
    );
  },

  /**
   * Get inventory report
   */
  async getInventoryReport(): Promise<InventoryReport> {
    return apiGet<InventoryReport>('/api/reports/inventory', {}, deps);
  },

  /**
   * Get customer report
   */
  async getCustomerReport(startDate?: string, endDate?: string): Promise<CustomerReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const query = params.toString();
    return apiGet<CustomerReport>(`/api/reports/customers${query ? `?${query}` : ''}`, {}, deps);
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    return apiGet<void>(`/api/reports/${reportId}`, {}, deps);
  },
};