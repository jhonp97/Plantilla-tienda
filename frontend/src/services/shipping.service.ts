/**
 * Shipping Service - API calls for shipping options and tracking
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, ApiError } from './api';
import type {
  ShippingOption,
  ShippingQuoteInput,
  ShippingQuote,
  TrackingInfo,
} from '../types/shipping.types';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export const shippingService = {
  /**
   * Get all active shipping options
   */
  async getShippingOptions(): Promise<ShippingOption[]> {
    return apiGet<ShippingOption[]>('/api/shipping/options', {}, deps);
  },

  /**
   * Get single shipping option by ID
   */
  async getShippingOption(optionId: string): Promise<ShippingOption> {
    return apiGet<ShippingOption>(`/api/shipping/options/${optionId}`, {}, deps);
  },

  /**
   * Get shipping quote for cart
   */
  async getShippingQuote(data: ShippingQuoteInput): Promise<ShippingQuote> {
    return apiPost<ShippingQuote>('/api/shipping/quote', data, {}, deps);
  },

  /**
   * Calculate shipping cost for an order
   */
  async calculateShipping(orderId: string): Promise<{ cost: number; option: ShippingOption }> {
    return apiGet<{ cost: number; option: ShippingOption }>(`/api/shipping/calculate/${orderId}`, {}, deps);
  },

  /**
   * Get tracking information for an order
   */
  async getTrackingInfo(orderId: string): Promise<TrackingInfo> {
    return apiGet<TrackingInfo>(`/api/shipping/tracking/${orderId}`, {}, deps);
  },

  /**
   * Update shipping status (admin)
   */
  async updateShippingStatus(
    orderId: string,
    status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED',
    trackingNumber?: string
  ): Promise<{ success: boolean }> {
    return apiPost<{ success: boolean }>(
      `/api/shipping/update/${orderId}`,
      { status, trackingNumber },
      {},
      deps
    );
  },
};