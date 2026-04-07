import type { Request, Response, NextFunction } from 'express';
import type { CreateOrderUseCase } from '@modules/order/application/use-cases/order/CreateOrderUseCase';
import type { GetOrderByIdUseCase } from '@modules/order/application/use-cases/order/GetOrderByIdUseCase';
import type { GetOrderByNumberUseCase } from '@modules/order/application/use-cases/order/GetOrderByNumberUseCase';
import type { ListUserOrdersUseCase } from '@modules/order/application/use-cases/order/ListUserOrdersUseCase';
import type { ListAdminOrdersUseCase } from '@modules/order/application/use-cases/order/ListAdminOrdersUseCase';
import type { UpdateOrderStatusUseCase } from '@modules/order/application/use-cases/order/UpdateOrderStatusUseCase';
import type { CancelOrderUseCase } from '@modules/order/application/use-cases/order/CancelOrderUseCase';

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly getOrderByNumberUseCase: GetOrderByNumberUseCase,
    private readonly listUserOrdersUseCase: ListUserOrdersUseCase,
    private readonly listAdminOrdersUseCase: ListAdminOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        data: { id, orderNumber: '', status: 'PENDING' },
      });
    } catch (error) {
      next(error);
    }
  };

  getByNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { orderNumber: '', status: 'PENDING' },
      });
    } catch (error) {
      next(error);
    }
  };

  listUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false } },
      });
    } catch (error) {
      next(error);
    }
  };

  listAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false } },
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: req.body,
      });
    } catch (error) {
      next(error);
    }
  };
}