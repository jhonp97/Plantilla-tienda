// ==========================================
// Verifactu Controller
// Admin endpoints for Verifactu management
// ==========================================

import type { Request, Response } from 'express';
import type { RegisterInvoiceUseCase } from '../../application/use-cases/RegisterInvoiceUseCase';
import type { CheckInvoiceStatusUseCase } from '../../application/use-cases/CheckInvoiceStatusUseCase';
import type { IVerifactuRepository } from '../../domain/repositories/IVerifactuRepository';
import { CreateVerifactuInvoiceDto, VerifactuStatusQueryDto } from '../../application/dto';

export class VerifactuController {
  constructor(
    private registerInvoiceUseCase: RegisterInvoiceUseCase,
    private checkInvoiceStatusUseCase: CheckInvoiceStatusUseCase,
    private verifactuRepo: IVerifactuRepository,
  ) {}

  // POST /verifactu/create - Manually create invoice from order
  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreateVerifactuInvoiceDto.parse(req.body);
      const orderId = parsed.orderId;

      // Find order (we need to fetch it from order repository)
      // For now, we'll rely on the OrderPaid event for automatic registration
      res.status(501).json({ 
        error: 'Use OrderPaid event to automatically register invoices',
        orderId 
      });
    } catch (error) {
      console.error('[Verifactu] Error creating invoice:', error);
      res.status(400).json({ error: 'Invalid request' });
    }
  }

  // GET /verifactu/status?uuid= - Check invoice status
  async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const parsed = VerifactuStatusQueryDto.parse(req.query);
      const uuid = parsed.uuid;

      // Find invoice by UUID
      const invoice = await this.verifactuRepo.findByUuid(uuid);
      
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.json({
        uuid: invoice.uuid,
        estado: invoice.estado,
        qrCode: invoice.qrCode,
        urlVerificacion: invoice.urlVerificacion,
        serie: invoice.serie,
        numero: invoice.numero,
        fechaExpedicion: invoice.fechaExpedicion,
      });
    } catch (error) {
      console.error('[Verifactu] Error checking status:', error);
      res.status(400).json({ error: 'Invalid request' });
    }
  }

  // GET /verifactu/health - Health check
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // POST /verifactu/check-all - Manually trigger status check for all pending invoices
  async checkAllStatuses(req: Request, res: Response): Promise<void> {
    try {
      await this.checkInvoiceStatusUseCase.execute();
      res.json({ message: 'Status check completed' });
    } catch (error) {
      console.error('[Verifactu] Error checking all statuses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /verifactu/invoice/:orderId - Get invoice by order ID
  async getInvoiceByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId;
      
      if (!orderId || typeof orderId !== 'string') {
        res.status(400).json({ error: 'Invalid order ID' });
        return;
      }
      
      const invoice = await this.verifactuRepo.findByOrderId(orderId);
      
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found for this order' });
        return;
      }

      res.json({
        id: invoice.id,
        orderId: invoice.orderId,
        serie: invoice.serie,
        numero: invoice.numero,
        fechaExpedicion: invoice.fechaExpedicion,
        tipoFactura: invoice.tipoFactura,
        descripcion: invoice.descripcion,
        importeTotal: invoice.importeTotal,
        uuid: invoice.uuid,
        qrCode: invoice.qrCode,
        urlVerificacion: invoice.urlVerificacion,
        estado: invoice.estado,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      });
    } catch (error) {
      console.error('[Verifactu] Error getting invoice:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}