import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@shared/infra/prisma/client';
import { ValidateCouponUseCase } from '@modules/coupon/application/validate-coupon.use-case';
import { createCouponSchema, updateCouponSchema } from '@shared/infra/validation/schemas';

export class CouponController {
  constructor(
    private readonly validateCouponUseCase: ValidateCouponUseCase,
  ) {}

  // Admin: List all coupons
  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: coupons });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Create coupon
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCouponSchema.parse(req.body);
      const coupon = await prisma.coupon.create({
        data: {
          code: validated.code,
          discountType: validated.discountType,
          discountValue: validated.discountValue,
          minOrderAmount: validated.minOrderAmount ?? null,
          usageLimit: validated.usageLimit ?? null,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          isActive: validated.isActive ?? true,
        },
      });
      res.status(201).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Update coupon
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = (req.params.id as string) ?? '';
      if (!id) {
        res.status(400).json({ success: false, error: 'Coupon ID is required' });
        return;
      }
      const validated = updateCouponSchema.parse(req.body);

      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          ...(validated.code !== undefined && { code: validated.code }),
          ...(validated.discountType !== undefined && { discountType: validated.discountType }),
          ...(validated.discountValue !== undefined && { discountValue: validated.discountValue }),
          ...(validated.minOrderAmount !== undefined && { minOrderAmount: validated.minOrderAmount }),
          ...(validated.usageLimit !== undefined && { usageLimit: validated.usageLimit }),
          ...(validated.expiresAt !== undefined && { expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null }),
          ...(validated.isActive !== undefined && { isActive: validated.isActive }),
        },
      });
      res.json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  // Admin: Soft delete coupon
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = (req.params.id as string) ?? '';
      if (!id) {
        res.status(400).json({ success: false, error: 'Coupon ID is required' });
        return;
      }
      const coupon = await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  };

  // Public: Validate coupon
  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const orderAmount = typeof req.query.orderAmount === 'string' ? parseInt(req.query.orderAmount, 10) : 0;

      const result = await this.validateCouponUseCase.execute({ code, orderAmount });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
