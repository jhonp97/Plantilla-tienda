import type { Request, Response, NextFunction } from 'express';
import type { GenerateInvoicesReportUseCase } from '@modules/order/application/use-cases/reports/GenerateInvoicesReportUseCase';
import type { ExportSalesReportUseCase } from '@modules/order/application/use-cases/reports/ExportSalesReportUseCase';
import type { ExportProductsReportUseCase } from '@modules/order/application/use-cases/reports/ExportProductsReportUseCase';
import type { GenerateCSVReportUseCase } from '@modules/order/application/use-cases/reports/GenerateCSVReportUseCase';
import type { GeneratePDFReportUseCase } from '@modules/order/application/use-cases/reports/GeneratePDFReportUseCase';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class ReportsController {
  constructor(
    private readonly generateInvoicesReportUseCase: GenerateInvoicesReportUseCase,
    private readonly exportSalesReportUseCase: ExportSalesReportUseCase,
    private readonly exportProductsReportUseCase: ExportProductsReportUseCase,
    private readonly generateCSVReportUseCase: GenerateCSVReportUseCase,
    private readonly generatePDFReportUseCase: GeneratePDFReportUseCase,
  ) {}

  generateInvoices = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=facturas.csv');
      res.send('Número Factura,Fecha,NIF Cliente,Nombre Cliente,Base Imponible,Tipo IVA,Cuota IVA,Total,Estado');
    } catch (error) {
      next(error);
    }
  };

  generateSalesReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
      res.send('Fecha,Ingresos,Número de pedidos');
    } catch (error) {
      next(error);
    }
  };

  generateProductsReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=productos.csv');
      res.send('Producto,Unidades vendidas,Ingresos');
    } catch (error) {
      next(error);
    }
  };

  generateGenericReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Forbidden - Admin access required',
        });
        return;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte.csv');
      res.send('Data');
    } catch (error) {
      next(error);
    }
  };
}