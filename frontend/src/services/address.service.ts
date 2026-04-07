/**
 * Address Service - API calls for address management
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, ApiError } from './api';
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from '../types/address.types';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export const addressService = {
  /**
   * Get all addresses for current user
   */
  async getAddresses(): Promise<Address[]> {
    return apiGet<Address[]>('/api/addresses', {}, deps);
  },

  /**
   * Get single address by ID
   */
  async getAddress(addressId: string): Promise<Address> {
    return apiGet<Address>(`/api/addresses/${addressId}`, {}, deps);
  },

  /**
   * Create a new address
   */
  async createAddress(data: CreateAddressInput): Promise<Address> {
    return apiPost<Address>('/api/addresses', data, {}, deps);
  },

  /**
   * Update an address
   */
  async updateAddress(addressId: string, data: UpdateAddressInput): Promise<Address> {
    return apiPut<Address>(`/api/addresses/${addressId}`, data, {}, deps);
  },

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<void> {
    return apiDelete<void>(`/api/addresses/${addressId}`, {}, deps);
  },

  /**
   * Set address as default
   */
  async setDefaultAddress(addressId: string, type: 'SHIPPING' | 'BILLING'): Promise<Address> {
    return apiPatch<Address>(`/api/addresses/${addressId}/default`, { type }, {}, deps);
  },

  /**
   * Get default addresses
   */
  async getDefaultAddresses(): Promise<{ shipping?: Address; billing?: Address }> {
    return apiGet<{ shipping?: Address; billing?: Address }>('/api/addresses/default', {}, deps);
  },
};