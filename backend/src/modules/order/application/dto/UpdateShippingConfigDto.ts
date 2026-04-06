import { z } from 'zod';

// Define shipping type enum values as a Record for Zod v4
const shippingTypes = {
  FREE: 'FREE',
  FIXED: 'FIXED',
  THRESHOLD: 'THRESHOLD',
} as const;

// Shipping zone schema
const shippingZoneSchema = z.object({
  name: z.string().min(2, { error: 'Zone name must be at least 2 characters' }).max(50),
  provinces: z.array(z.string().min(2)).min(1, { error: 'At least one province is required' }),
  cost: z.number().int().min(0, { error: 'Shipping cost cannot be negative' }),
  freeShippingThreshold: z.number().int().min(0).optional(),
});

export const updateShippingConfigSchema = z.object({
  // Shipping type configuration
  shippingType: z.enum(shippingTypes, { error: 'Invalid shipping type' }),
  
  // Fixed shipping price (required for FIXED type)
  shippingPrice: z
    .number()
    .int({ error: 'Shipping price must be an integer (in cents)' })
    .min(0, { error: 'Shipping price cannot be negative' })
    .optional(),
  
  // Free shipping threshold (required for THRESHOLD type)
  freeShippingThreshold: z
    .number()
    .int({ error: 'Free shipping threshold must be an integer (in cents)' })
    .min(0, { error: 'Threshold cannot be negative' })
    .optional(),
  
  // Optional shipping zones for provincial pricing
  shippingZones: z.array(shippingZoneSchema).optional(),
}).refine((data) => {
  // FIXED and THRESHOLD types require shippingPrice
  if ((data.shippingType === 'FIXED' || data.shippingType === 'THRESHOLD') && 
      data.shippingPrice === undefined) {
    return false;
  }
  return true;
}, {
  error: 'shippingPrice is required when shippingType is FIXED or THRESHOLD',
}).refine((data) => {
  // THRESHOLD type requires freeShippingThreshold
  if (data.shippingType === 'THRESHOLD' && data.freeShippingThreshold === undefined) {
    return false;
  }
  return true;
}, {
  error: 'freeShippingThreshold is required when shippingType is THRESHOLD',
});

export type UpdateShippingConfigDto = z.infer<typeof updateShippingConfigSchema>;
export type ShippingType = z.infer<typeof updateShippingConfigSchema>['shippingType'];
export type ShippingZoneInput = z.infer<typeof shippingZoneSchema>;