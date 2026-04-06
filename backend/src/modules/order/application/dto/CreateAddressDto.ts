import { z } from 'zod';

export const createAddressSchema = z.object({
  // Required address fields
  street: z.string()
    .min(5, { error: 'Street must be at least 5 characters' })
    .max(200, { error: 'Street must be at most 200 characters' }),
  
  postalCode: z.string()
    .regex(/^[0-9]{5}$/, { error: 'Invalid postal code (must be 5 digits)' }),
  
  city: z.string()
    .min(2, { error: 'City must be at least 2 characters' })
    .max(100, { error: 'City must be at most 100 characters' }),
  
  province: z.string()
    .min(2, { error: 'Province must be at least 2 characters' })
    .max(100, { error: 'Province must be at most 100 characters' }),
  
  // Optional country - defaults to Spain
  country: z.string()
    .min(2, { error: 'Country must be at least 2 characters' })
    .max(100, { error: 'Country must be at most 100 characters' })
    .default('España'),
  
  // Optional - set as default address
  isDefault: z.boolean().default(false),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;