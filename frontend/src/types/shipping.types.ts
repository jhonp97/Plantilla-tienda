/**
 * Shipping Types - Interfaces for shipping options and tracking
 */

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier?: string;
  isActive: boolean;
}

export interface ShippingRate {
  optionId: string;
  price: number;
  estimatedDays: number;
}

export interface ShippingQuoteInput {
  items: Array<{
    productId: string;
    quantity: number;
    weight?: number;
  }>;
  address: {
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface ShippingQuote {
  rates: ShippingRate[];
  validUntil?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
}

export interface TrackingEvent {
  date: string;
  location: string;
  description: string;
  status: string;
}