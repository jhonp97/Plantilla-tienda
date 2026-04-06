import { z } from 'zod';

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must be at most 5000 characters')
      .optional(),
    price: z
      .number()
      .int('Price must be a positive integer (cents)')
      .positive('Price must be positive (in cents)')
      .optional(),
    stockQuantity: z
      .number()
      .int('Stock quantity must be an integer')
      .min(0, 'Stock quantity cannot be negative')
      .optional(),
    categoryId: z.string().uuid('Invalid category ID format').optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field is required for update'
  );

export type UpdateProductDto = z.infer<typeof updateProductSchema>;