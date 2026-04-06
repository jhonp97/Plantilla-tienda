import { z } from 'zod';

export const calculateShippingSchema = z.object({
  // Province is required to determine shipping zone
  province: z
    .string()
    .min(2, { error: 'Province must be at least 2 characters' })
    .max(100, { error: 'Province must be at most 100 characters' }),
  
  // Subtotal to check against free shipping threshold (in cents)
  subtotal: z
    .number()
    .int({ error: 'Subtotal must be an integer' })
    .min(0, { error: 'Subtotal cannot be negative' }),
  
  // Optional - specific shipping zone to use
  shippingZone: z.string().max(50, { error: 'Shipping zone must be at most 50 characters' }).optional(),
});

export type CalculateShippingDto = z.infer<typeof calculateShippingSchema>;

// Response after calculating shipping
export const shippingCalculationResponseSchema = z.object({
  province: z.string(),
  subtotal: z.number().int(),
  shippingCost: z.number().int(),
  freeShippingEligible: z.boolean(),
  freeShippingThreshold: z.number().int().optional(),
  amountToFreeShipping: z.number().int().optional(), // Amount needed to qualify for free shipping
  shippingZone: z.string().optional(),
});

export type ShippingCalculationResponse = z.infer<typeof shippingCalculationResponseSchema>;