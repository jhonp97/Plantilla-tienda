import { prisma } from '@shared/infra/prisma/client';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

export interface ValidateCouponInput {
  code: string;
  orderAmount: number; // in cents
}

export interface ValidateCouponOutput {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number; // calculated in cents
}

export class ValidateCouponUseCase {
  async execute(input: ValidateCouponInput): Promise<ValidateCouponOutput> {
    const code = input.code.toUpperCase().trim();

    // Find coupon by code (case-insensitive)
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found', 'Coupon');
    }

    // Check if active
    if (!coupon.isActive) {
      throw new ValidationError('Coupon is no longer active');
    }

    // Check if expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new ValidationError('Coupon has expired');
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Coupon usage limit has been reached');
    }

    // Check minimum order amount
    if (coupon.minOrderAmount !== null && input.orderAmount < coupon.minOrderAmount) {
      throw new ValidationError(
        `Minimum order amount of €${(coupon.minOrderAmount / 100).toFixed(2)} required`
      );
    }

    // Calculate discount amount
    let discountAmount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((input.orderAmount * coupon.discountValue) / 100);
    } else {
      // FIXED discount - cannot exceed order amount
      discountAmount = Math.min(coupon.discountValue, input.orderAmount);
    }

    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: coupon.discountValue,
      discountAmount,
    };
  }
}
