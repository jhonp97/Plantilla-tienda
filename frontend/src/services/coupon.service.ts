/**
 * Coupon Service - API calls for coupon management
 */
import { useAuthStore } from '@store/authStore';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  message?: string;
}

export interface PaginatedCoupons {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCouponInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface UpdateCouponInput {
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  minOrderAmount?: number | null;
  usageLimit?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export const couponService = {
  /**
   * Validate a coupon code for the current cart
   */
  async validate(code: string, subtotal: number): Promise<CouponValidationResult> {
    return apiGet<CouponValidationResult>(
      `/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`,
      {},
      deps
    );
  },

  /**
   * Get all coupons (admin)
   */
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedCoupons> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return apiGet<PaginatedCoupons>(`/api/admin/coupons${qs ? `?${qs}` : ''}`, {}, deps);
  },

  /**
   * Get a single coupon by ID (admin)
   */
  async getById(id: string): Promise<Coupon> {
    return apiGet<Coupon>(`/api/admin/coupons/${id}`, {}, deps);
  },

  /**
   * Create a new coupon (admin)
   */
  async create(data: CreateCouponInput): Promise<Coupon> {
    return apiPost<Coupon>('/api/admin/coupons', data, {}, deps);
  },

  /**
   * Update a coupon (admin)
   */
  async update(id: string, data: UpdateCouponInput): Promise<Coupon> {
    return apiPut<Coupon>(`/api/admin/coupons/${id}`, data, {}, deps);
  },

  /**
   * Delete a coupon (admin)
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/api/admin/coupons/${id}`, {}, deps);
  },
};
