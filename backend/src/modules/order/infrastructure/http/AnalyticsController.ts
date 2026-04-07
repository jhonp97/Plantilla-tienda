import type { Request, Response, NextFunction } from 'express';
import type { GetDashboardStatsUseCase } from '@modules/order/application/use-cases/analytics/GetDashboardStatsUseCase';
import type { GetSalesAnalyticsUseCase } from '@modules/order/application/use-cases/analytics/GetSalesAnalyticsUseCase';
import type { GetProductPerformanceUseCase } from '@modules/order/application/use-cases/analytics/GetProductPerformanceUseCase';
import type { GetTopCustomersUseCase } from '@modules/order/application/use-cases/analytics/GetTopCustomersUseCase';
import type { GetLowStockProductsUseCase } from '@modules/order/application/use-cases/analytics/GetLowStockProductsUseCase';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AnalyticsController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getSalesAnalyticsUseCase: GetSalesAnalyticsUseCase,
    private readonly getProductPerformanceUseCase: GetProductPerformanceUseCase,
    private readonly getTopCustomersUseCase: GetTopCustomersUseCase,
    private readonly getLowStockProductsUseCase: GetLowStockProductsUseCase,
  ) {}

  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          todaySales: 0,
          weekSales: 0,
          monthSales: 0,
          yearSales: 0,
          salesChangePercent: 0,
          todayOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          lowStockProducts: [],
          topProducts: [],
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getSales = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.json({
        success: true,
        data: { period: { start: '', end: '' }, data: [], totals: { revenue: 0, orders: 0, productsSold: 0 } },
      });
    } catch (error) {
      next(error);
    }
  };

  getProductPerformance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.json({
        success: true,
        data: { products: [] },
      });
    } catch (error) {
      next(error);
    }
  };

  getTopCustomers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStock = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}