import { z } from 'zod';

// Address response schema
const addressResponseSchema = z.object({
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  isDefault: z.boolean().optional(),
});

// Order item response schema
const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int(), // in cents
  taxRate: z.number(),
  discountAmount: z.number().int(),
  createdAt: z.string().datetime(),
});

// Main order response schema
export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  userId: z.string().uuid(),
  status: z.string(),
  subtotal: z.number().int(), // in cents
  taxAmount: z.number().int(), // in cents
  shippingCost: z.number().int(), // in cents
  discountAmount: z.number().int(), // in cents
  totalAmount: z.number().int(), // in cents
  paymentMethod: z.string(),
  paymentIntentId: z.string().uuid().optional(),
  shippingAddress: addressResponseSchema,
  billingAddress: addressResponseSchema.optional(),
  notes: z.string().optional(),
  customerNif: z.string().optional(),
  items: z.array(orderItemResponseSchema),
  paidAt: z.string().datetime().optional(),
  shippedAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OrderResponseDto = z.infer<typeof orderResponseSchema>;
export type OrderItemResponseDto = z.infer<typeof orderItemResponseSchema>;