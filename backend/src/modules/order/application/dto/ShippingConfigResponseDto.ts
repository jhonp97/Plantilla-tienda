import { z } from 'zod';

// Shipping zone response schema
const shippingZoneResponseSchema = z.object({
  name: z.string(),
  provinces: z.array(z.string()),
  cost: z.number().int(),
  freeShippingThreshold: z.number().int().optional(),
});

// Shipping configuration response
export const shippingConfigResponseSchema = z.object({
  // Configuration type
  shippingType: z.enum({ FREE: 'FREE', FIXED: 'FIXED', THRESHOLD: 'THRESHOLD' }),
  
  // Current shipping price (for FIXED)
  shippingPrice: z.number().int().optional(),
  
  // Free shipping threshold (for THRESHOLD)
  freeShippingThreshold: z.number().int().optional(),
  
  // Shipping zones for provincial pricing
  shippingZones: z.array(shippingZoneResponseSchema),
  
  // Default shipping cost (fallback)
  defaultShippingCost: z.number().int(),
  
  // Currency information
  currency: z.string(),
  currencySymbol: z.string(),
});

export type ShippingConfigResponseDto = z.infer<typeof shippingConfigResponseSchema>;
export type ShippingZoneResponse = z.infer<typeof shippingZoneResponseSchema>;