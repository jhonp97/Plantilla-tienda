/**
 * Payment Service - API calls for payment processing (Stripe)
 */
import { useAuthStore } from '@store/authStore';
import { apiPost, ApiError } from './api';
import type {
  PaymentIntent,
  CreatePaymentIntentInput,
  PaymentResult,
  StripeCheckoutSession,
} from '../types/payment.types';

const deps = {
  getCartId: () => null,
  logout: () => useAuthStore.getState().logout(),
};

export const paymentService = {
  /**
   * Create a payment intent for Stripe
   */
  async createPaymentIntent(data: CreatePaymentIntentInput): Promise<PaymentIntent> {
    return apiPost<PaymentIntent>('/api/payments/create-intent', data, {}, deps);
  },

  /**
   * Confirm payment intent
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    return apiPost<PaymentResult>(`/api/payments/${paymentIntentId}/confirm`, {}, {}, deps);
  },

  /**
   * Get payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    return apiPost<PaymentIntent>(`/api/payments/${paymentIntentId}/status`, {}, {}, deps);
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string): Promise<StripeCheckoutSession> {
    return apiPost<StripeCheckoutSession>(
      '/api/payments/checkout-session',
      { orderId, successUrl, cancelUrl },
      {},
      deps
    );
  },

  /**
   * Verify Stripe webhook signature
   */
  async verifyWebhook(payload: string, signature: string): Promise<{ valid: boolean }> {
    return apiPost<{ valid: boolean }>(
      '/api/payments/webhook/verify',
      { payload, signature },
      { skipAuth: true },
      deps
    );
  },

  /**
   * Process refund
   */
  async processRefund(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    return apiPost<PaymentResult>(`/api/payments/${paymentIntentId}/refund`, { amount }, {}, deps);
  },
};