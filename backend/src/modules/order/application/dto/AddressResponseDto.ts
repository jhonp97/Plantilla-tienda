import { z } from 'zod';

export const addressResponseDtoSchema = z.object({
  id: z.string().uuid(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  isDefault: z.boolean().optional(),
  userId: z.string().uuid().optional(), // May not be included for guest orders
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AddressResponseDto = z.infer<typeof addressResponseDtoSchema>;