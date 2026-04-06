import type { Request, Response, NextFunction } from 'express';

export class OrderController {
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