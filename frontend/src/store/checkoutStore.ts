/**
 * Checkout Store - State management for checkout flow
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '../types/address.types';
import type { ShippingOption, ShippingQuote } from '../types/shipping.types';
import type { Order } from '../types/order.types';

export type CheckoutStep = 'cart' | 'information' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutState {
  // Current step
  currentStep: CheckoutStep;
  
  // Addresses
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddressForBilling: boolean;
  
  // Shipping
  selectedShippingOption: ShippingOption | null;
  shippingQuote: ShippingQuote | null;
  
  // Payment
  paymentMethod: 'stripe' | 'transfer' | null;
  paymentIntentId: string | null;
  
  // Order
  order: Order | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setUseSameAddressForBilling: (value: boolean) => void;
  
  setShippingOption: (option: ShippingOption) => void;
  setShippingQuote: (quote: ShippingQuote) => void;
  
  setPaymentMethod: (method: 'stripe' | 'transfer') => void;
  setPaymentIntentId: (id: string) => void;
  
  setOrder: (order: Order) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  reset: () => void;
}

const initialState = {
  currentStep: 'cart' as CheckoutStep,
  shippingAddress: null,
  billingAddress: null,
  useSameAddressForBilling: true,
  selectedShippingOption: null,
  shippingQuote: null,
  paymentMethod: null,
  paymentIntentId: null,
  order: null,
  isLoading: false,
  error: null,
};

const stepOrder: CheckoutStep[] = ['cart', 'information', 'shipping', 'payment', 'confirmation'];

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },

      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBillingAddress: (address) => set({ billingAddress: address }),
      setUseSameAddressForBilling: (value) => set({ useSameAddressForBilling: value }),

      setShippingOption: (option) => set({ selectedShippingOption: option }),
      setShippingQuote: (quote) => set({ shippingQuote: quote }),

      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setPaymentIntentId: (id) => set({ paymentIntentId: id }),

      setOrder: (order) => set({ order }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        // Only persist essential data, not sensitive info
        currentStep: state.currentStep,
        useSameAddressForBilling: state.useSameAddressForBilling,
      }),
    }
  )
);