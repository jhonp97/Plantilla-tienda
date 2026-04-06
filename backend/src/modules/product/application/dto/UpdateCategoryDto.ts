import { z } from 'zod';

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    'At least one field is required for update'
  );

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;