import { z } from 'zod';

// Define enum values as a Record for Zod v4
const orderStatuses = {
  DRAFT: 'DRAFT',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const updateOrderStatusSchema = z.object({
  // New status - must be valid order status
  status: z.enum(orderStatuses, { error: 'Invalid order status' }),

  // Optional tracking number for SHIPPED status
  trackingNumber: z.string().max(100, { error: 'Tracking number must be at most 100 characters' }).optional(),

  // Optional reason for CANCELLED or REFUNDED status
  reason: z.string().max(500, { error: 'Reason must be at most 500 characters' }).optional(),
}).refine((data) => {
  // If status is SHIPPED, trackingNumber is recommended
  if (data.status === 'SHIPPED' && !data.trackingNumber) {
    return false;
  }
  return true;
}, {
  error: 'Tracking number is required when status is SHIPPED',
}).refine((data) => {
  // If status is CANCELLED or REFUNDED, reason is recommended
  if ((data.status === 'CANCELLED' || data.status === 'REFUNDED') && !data.reason) {
    return false;
  }
  return true;
}, {
  error: 'Reason is required when status is CANCELLED or REFUNDED',
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type OrderStatus = z.infer<typeof updateOrderStatusSchema>['status'];