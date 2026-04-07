import type { Request, Response, NextFunction } from 'express';
import type { AddToCartUseCase } from '@modules/order/application/use-cases/cart/AddToCartUseCase';
import type { UpdateCartItemUseCase } from '@modules/order/application/use-cases/cart/UpdateCartItemUseCase';
import type { RemoveFromCartUseCase } from '@modules/order/application/use-cases/cart/RemoveFromCartUseCase';
import type { GetCartUseCase } from '@modules/order/application/use-cases/cart/GetCartUseCase';
import type { MergeGuestCartUseCase } from '@modules/order/application/use-cases/cart/MergeGuestCartUseCase';

export class CartController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeFromCartUseCase: RemoveFromCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly mergeGuestCartUseCase: MergeGuestCartUseCase,
  ) {}

  addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        success: true,
        data: { items: [] },
      });
    } catch (error) {
      next(error);
    }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  };

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { items: [], subtotal: 0, shippingCost: 0, taxAmount: 0, total: 0 },
      });
    } catch (error) {
      next(error);
    }
  };

  mergeCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { items: [] },
      });
    } catch (error) {
      next(error);
    }
  };
}