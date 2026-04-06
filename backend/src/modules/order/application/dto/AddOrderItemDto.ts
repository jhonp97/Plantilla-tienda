import { z } from 'zod';

export const addOrderItemSchema = z.object({
  // Product reference
  productId: z.string().uuid({ error: 'Invalid product ID format' }),

  // Quantity - must be positive
  quantity: z.number()
    .int({ error: 'Quantity must be an integer' })
    .positive({ error: 'Quantity must be positive' })
    .min(1, { error: 'Quantity must be at least 1' })
    .max(999, { error: 'Quantity cannot exceed 999' }),

  // Optional notes for this specific item
  notes: z.string().max(200, { error: 'Notes must be at most 200 characters' }).optional(),
});

export type AddOrderItemDto = z.infer<typeof addOrderItemSchema>;