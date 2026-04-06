import { z } from 'zod';

export const updateAddressSchema = z
  .object({
    street: z
      .string()
      .min(5, { error: 'Street must be at least 5 characters' })
      .max(200, { error: 'Street must be at most 200 characters' })
      .optional(),
    
    postalCode: z
      .string()
      .regex(/^[0-9]{5}$/, { error: 'Invalid postal code (must be 5 digits)' })
      .optional(),
    
    city: z
      .string()
      .min(2, { error: 'City must be at least 2 characters' })
      .max(100, { error: 'City must be at most 100 characters' })
      .optional(),
    
    province: z
      .string()
      .min(2, { error: 'Province must be at least 2 characters' })
      .max(100, { error: 'Province must be at most 100 characters' })
      .optional(),
    
    country: z
      .string()
      .min(2, { error: 'Country must be at least 2 characters' })
      .max(100, { error: 'Country must be at most 100 characters' })
      .optional(),
    
    isDefault: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { error: 'At least one field is required for update' }
  );

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;