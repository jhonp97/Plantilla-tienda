/**
 * Order Store - State management for order history and management
 */
import { create } from 'zustand';
import { orderService } from '../services/order.service';
import type { Order, OrderFilters } from '../types/order.types';

interface OrderState {
  // Orders list
  orders: Order[];
  selectedOrder: Order | null;
  
  // Filters
  filters: OrderFilters;
  
  // Pagination
  page: number;
  totalPages: number;
  total: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Getters
  getPendingOrders: () => Order[];
  getCompletedOrders: () => Order[];
  
  // Actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  
  setFilters: (filters: OrderFilters) => void;
  clearFilters: () => void;
  
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  filters: {},
  page: 1,
  totalPages: 1,
  total: 0,
  isLoading: false,
  error: null,

  getPendingOrders: () => {
    const { orders } = get();
    return orders.filter(
      (order) => order.status === 'PENDING' || order.status === 'CONFIRMED'
    );
  },

  getCompletedOrders: () => {
    const { orders } = get();
    return orders.filter(
      (order) => order.status === 'DELIVERED' || order.status === 'REFUNDED'
    );
  },

  fetchOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters || get().filters;
      const result = await orderService.getOrders({
        ...activeFilters,
        page: get().page,
      });
      set({
        orders: result.data,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  fetchOrder: async (orderId) => {
    set({ isLoading: true, error: null, selectedOrder: null });
    try {
      const order = await orderService.getOrder(orderId);
      set({ selectedOrder: order, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch order',
        isLoading: false,
      });
    }
  },

  cancelOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.cancelOrder(orderId);
      // Refresh orders after cancellation
      await get().fetchOrders();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel order',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters, page: 1 });
    get().fetchOrders(filters);
  },

  clearFilters: () => {
    set({ filters: {}, page: 1 });
    get().fetchOrders();
  },

  setPage: (page) => {
    set({ page });
    get().fetchOrders();
  },

  nextPage: () => {
    const { page, totalPages } = get();
    if (page < totalPages) {
      set({ page: page + 1 });
      get().fetchOrders();
    }
  },

  previousPage: () => {
    const { page } = get();
    if (page > 1) {
      set({ page: page - 1 });
      get().fetchOrders();
    }
  },

  clearError: () => set({ error: null }),
}));