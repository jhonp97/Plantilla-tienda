import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  // Order ID to associate with payment
  orderId: z.uuid({ error: 'Invalid order ID format' }),
  
  // Amount in cents (must match order total)
  amount: z
    .number()
    .int({ error: 'Amount must be an integer (in cents)' })
    .positive({ error: 'Amount must be positive' }),
  
  // Currency - defaults to EUR
  currency: z
    .string()
    .length(3, { error: 'Currency must be 3 characters (ISO 4217)' })
    .default('EUR'),
  
  // Optional payment method specific options
  paymentMethodId: z.string().optional(),
  
  // Optional customer email for payment receipt
  customerEmail: z.email({ error: 'Invalid email format' }).optional(),
  
  // Optional description for the payment
  description: z.string().max(500, { error: 'Description must be at most 500 characters' }).optional(),
  
  // Optional metadata
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CreatePaymentIntentDto = z.infer<typeof createPaymentIntentSchema>;