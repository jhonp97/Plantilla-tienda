import { z } from 'zod';

// Address schema for reuse
const addressSchema = z.object({
  street: z.string().min(5, { error: 'Street must be at least 5 characters' }),
  postalCode: z.string().regex(/^[0-9]{5}$/, { error: 'Invalid postal code (must be 5 digits)' }),
  city: z.string().min(2, { error: 'City must be at least 2 characters' }),
  province: z.string().min(2, { error: 'Province must be at least 2 characters' }),
  country: z.string().default('España'),
});

// Order item schema
const orderItemSchema = z.object({
  productId: z.uuid({ error: 'Invalid product ID format' }),
  quantity: z.number().int().positive({ error: 'Quantity must be a positive integer' }),
});

export const createOrderSchema = z.object({
  // Guest fields (optional if user logged in)
  email: z.email({ error: 'Invalid email format' }).optional(),
  fullName: z.string().min(3, { error: 'Full name must be at least 3 characters' }).optional(),
  phone: z.string().regex(/^\+34[0-9]{9}$/, { error: 'Invalid phone format (must be +34 followed by 9 digits)' }).optional(),
  nifCif: z.string().regex(/^[0-9]{8}[A-Z]$|^[A-Z][0-9]{8}[A-Z]$/i, { error: 'Invalid NIF/CIF format' }).optional(),

  // Required - shipping address
  shippingAddress: addressSchema,

  // Billing address (same as shipping by default)
  billingAddressSame: z.boolean().default(true),
  billingAddress: addressSchema.optional(),

  // Items - at least one required
  items: z.array(orderItemSchema).min(1, { error: 'At least one item is required' }),

  // Payment method
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'CASH']),

  // Optional notes
  notes: z.string().max(1000, { error: 'Notes must be at most 1000 characters' }).optional(),

  // Create account after order (for guest checkout)
  createAccount: z.boolean().default(false),
}).refine((data) => {
  // If billingAddressSame is false, billingAddress is required
  if (data.billingAddressSame === false && !data.billingAddress) {
    return false;
  }
  return true;
}, {
  error: 'Billing address is required when billingAddressSame is false',
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

// Type for order item input
export type OrderItemInput = z.infer<typeof orderItemSchema>;