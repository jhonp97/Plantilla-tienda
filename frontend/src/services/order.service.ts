/**
 * Order Service - API calls for order management
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiError } from './api';
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  PaginatedOrders,
} from '../types/order.types';

const deps = {
  getCartId: () => null, // Orders don't need cart ID
  logout: () => useAuthStore.getState().logout(),
};

export const orderService = {
  /**
   * Get current user's orders
   */
  async getOrders(filters?: OrderFilters): Promise<PaginatedOrders> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters?.shippingStatus) params.append('shippingStatus', filters.shippingStatus);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const query = params.toString();
    const url = `/api/orders${query ? `?${query}` : ''}`;
    return apiGet<PaginatedOrders>(url, {}, deps);
  },

  /**
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    return apiGet<Order>(`/api/orders/${orderId}`, {}, deps);
  },

  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderInput): Promise<Order> {
    return apiPost<Order>('/api/orders', data, {}, deps);
  },

  /**
   * Update order details (admin)
   */
  async updateOrder(orderId: string, data: UpdateOrderInput): Promise<Order> {
    return apiPatch<Order>(`/api/orders/${orderId}`, data, {}, deps);
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    return apiPatch<Order>(`/api/orders/${orderId}/cancel`, {}, {}, deps);
  },

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<{ status: string; paymentStatus: string; shippingStatus: string }> {
    return apiGet<{ status: string; paymentStatus: string; shippingStatus: string }>(
      `/api/orders/${orderId}/status`,
      {},
      deps
    );
  },
};