import type { Request, Response, NextFunction } from 'express';
import type { CalculateShippingUseCase } from '@modules/order/application/use-cases/shipping/CalculateShippingUseCase';
import type { UpdateShippingConfigUseCase } from '@modules/order/application/use-cases/shipping/UpdateShippingConfigUseCase';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ShippingController {
  constructor(
    private readonly calculateShippingUseCase: CalculateShippingUseCase,
    private readonly updateShippingConfigUseCase: UpdateShippingConfigUseCase,
  ) {}

  calculate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { province, subtotal } = req.body;
      const result = await this.calculateShippingUseCase.execute({ province, subtotal });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateConfig = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check admin role
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      const settings = await this.updateShippingConfigUseCase.execute(req.body);
      res.json({
        success: true,
        data: settings.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  };

  getConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get default settings - simplified
      res.json({
        success: true,
        data: {
          shippingType: 'FREE',
          shippingPrice: 0,
          freeShippingThreshold: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}