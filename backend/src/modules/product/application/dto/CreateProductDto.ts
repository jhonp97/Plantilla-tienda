import { z } from 'zod';

const taxRateValues = [0, 4, 10, 21] as const;

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  price: z
    .number()
    .int('Price must be a positive integer (cents)')
    .positive('Price must be positive (in cents)'),
  stockQuantity: z
    .number()
    .int('Stock quantity must be an integer')
    .min(0, 'Stock quantity cannot be negative'),
  taxRate: z
    .number()
    .int('Tax rate must be an integer')
    .refine((val) => taxRateValues.includes(val as typeof taxRateValues[number]), {
      message: 'Tax rate must be one of: 0, 4, 10, or 21',
    })
    .optional(),
  categoryId: z.string().uuid('Invalid category ID format'),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        publicId: z.string(),
        order: z.number().int().optional(),
      })
    )
    .optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;