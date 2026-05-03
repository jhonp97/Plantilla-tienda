import { z } from 'zod';

// ==========================================
// Coupon Schemas
// ==========================================

export const discountTypeEnum = z.enum(['PERCENTAGE', 'FIXED']);

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code must be at most 50 characters')
    .transform((val) => val.toUpperCase()),
  discountType: discountTypeEnum,
  discountValue: z
    .number()
    .int('Discount value must be an integer')
    .min(1, 'Discount value must be at least 1'),
  minOrderAmount: z
    .number()
    .int('Minimum order amount must be an integer')
    .positive('Minimum order amount must be positive')
    .nullable()
    .optional(),
  usageLimit: z
    .number()
    .int('Usage limit must be an integer')
    .positive('Usage limit must be positive')
    .nullable()
    .optional(),
  expiresAt: z
    .string()
    .datetime('Invalid expiration date format')
    .nullable()
    .optional(),
  isActive: z.boolean().optional().default(true),
}).refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE') {
      return data.discountValue >= 1 && data.discountValue <= 100;
    }
    return true;
  },
  {
    message: 'Percentage discount must be between 1 and 100',
    path: ['discountValue'],
  },
);

export const updateCouponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code must be at most 50 characters')
    .transform((val) => val.toUpperCase())
    .optional(),
  discountType: discountTypeEnum.optional(),
  discountValue: z
    .number()
    .int('Discount value must be an integer')
    .min(1, 'Discount value must be at least 1')
    .optional(),
  minOrderAmount: z
    .number()
    .int('Minimum order amount must be an integer')
    .positive('Minimum order amount must be positive')
    .nullable()
    .optional(),
  usageLimit: z
    .number()
    .int('Usage limit must be an integer')
    .positive('Usage limit must be positive')
    .nullable()
    .optional(),
  expiresAt: z
    .string()
    .datetime('Invalid expiration date format')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue !== undefined) {
      return data.discountValue >= 1 && data.discountValue <= 100;
    }
    return true;
  },
  {
    message: 'Percentage discount must be between 1 and 100',
    path: ['discountValue'],
  },
);

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// ==========================================
// Review Schemas
// ==========================================

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .max(500, 'Comment must be at most 500 characters')
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  comment: z
    .string()
    .max(500, 'Comment must be at most 500 characters')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// ==========================================
// Auth Schemas
// ==========================================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ==========================================
// GoogleMapReview Output Schema (no input validation needed)
// ==========================================

export const googleMapReviewSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  authorName: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string(),
  reviewDate: z.string().datetime(),
  cachedAt: z.string().datetime(),
});

export type GoogleMapReviewOutput = z.infer<typeof googleMapReviewSchema>;
