import { z } from 'zod';

// Define Stripe event types as a Record for Zod v4
const stripeEventTypes = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
  CHARGE_REFUNDED: 'charge.refunded',
  CHARGE_CREATED: 'charge.created',
} as const;

// Stripe payment intent data
const stripePaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
  clientSecret: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// Stripe charge data
const stripeChargeSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
  paymentIntent: z.string().optional(),
  refunded: z.boolean(),
});

// Base webhook payload
export const webhookPayloadSchema = z.object({
  // Event type (e.g., payment_intent.succeeded)
  type: z.enum(stripeEventTypes, { error: 'Invalid Stripe event type' }),
  
  // Event ID (Stripe's unique event ID)
  id: z.string(),
  
  // Event timestamp
  created: z.number(), // Unix timestamp
  
  // Raw event object from Stripe
  data: z.object({
    object: z.unknown(), // PaymentIntent or Charge object
  }),
});

// Specific webhook payloads for common events
export const paymentIntentSucceededSchema = webhookPayloadSchema.extend({
  type: z.literal('payment_intent.succeeded'),
  data: z.object({
    object: stripePaymentIntentSchema,
  }),
});

export const paymentIntentFailedSchema = webhookPayloadSchema.extend({
  type: z.literal('payment_intent.payment_failed'),
  data: z.object({
    object: stripePaymentIntentSchema.extend({
      lastPaymentError: z.object({
        message: z.string(),
        code: z.string().optional(),
      }).optional(),
    }),
  }),
});

export const chargeRefundedSchema = webhookPayloadSchema.extend({
  type: z.literal('charge.refunded'),
  data: z.object({
    object: stripeChargeSchema,
  }),
});

// Type exports
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type PaymentIntentSucceededPayload = z.infer<typeof paymentIntentSucceededSchema>;
export type PaymentIntentFailedPayload = z.infer<typeof paymentIntentFailedSchema>;
export type ChargeRefundedPayload = z.infer<typeof chargeRefundedSchema>;
export type StripeEventType = z.infer<typeof webhookPayloadSchema>['type'];