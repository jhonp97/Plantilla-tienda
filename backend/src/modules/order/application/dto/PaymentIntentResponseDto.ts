import { z } from 'zod';

// Payment intent response from Stripe
export const paymentIntentResponseSchema = z.object({
  // Stripe payment intent ID
  id: z.string(),
  
  // Client secret to confirm payment on frontend
  clientSecret: z.string(),
  
  // Amount in cents
  amount: z.number().int(),
  
  // Currency
  currency: z.string(),
  
  // Payment status
  status: z.enum({ 
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method', 
    REQUIRES_CONFIRMATION: 'requires_confirmation', 
    REQUIRES_ACTION: 'requires_action', 
    PROCESSING: 'processing', 
    SUCCEEDED: 'succeeded', 
    CANCELED: 'canceled' 
  }),
  
  // Optional error message if failed
  lastPaymentError: z.string().optional(),
  
  // Metadata
  metadata: z.record(z.string(), z.string()).optional(),
});

export type PaymentIntentResponseDto = z.infer<typeof paymentIntentResponseSchema>;

// Simplified response for order
export const paymentIntentSimpleResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
  amount: z.number().int(),
  currency: z.string(),
});

export type PaymentIntentSimpleResponse = z.infer<typeof paymentIntentSimpleResponseSchema>;