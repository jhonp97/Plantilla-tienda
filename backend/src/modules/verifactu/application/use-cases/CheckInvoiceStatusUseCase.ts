// ==========================================
// Check Invoice Status Use Case
// Poll AEAT for invoice status updates
// ==========================================

import type { IVerifactuApiService } from '../../domain/services/IVerifactuApiService';
import type { IVerifactuRepository } from '../../domain/repositories/IVerifactuRepository';
import type { VerifactuInvoice, VerifactuInvoiceStatus } from '../../domain/entities/VerifactuInvoice';

export class CheckInvoiceStatusUseCase {
  constructor(
    private verifactuApi: IVerifactuApiService,
    private verifactuRepo: IVerifactuRepository,
  ) {}

  async execute(): Promise<void> {
    console.log('[Verifactu] Checking pending invoice statuses...');

    // Find all PENDING invoices
    const pendingInvoices = await this.verifactuRepo.findByStatus('PENDIENTE');
    
    console.log(`[Verifactu] Found ${pendingInvoices.length} pending invoices`);

    for (const invoice of pendingInvoices) {
      if (!invoice.uuid) {
        console.warn(`[Verifactu] Invoice ${invoice.id} has no UUID, skipping`);
        continue;
      }

      try {
        const status = await this.verifactuApi.checkStatus(invoice.uuid);
        
        console.log(`[Verifactu] Invoice ${invoice.uuid} status: ${status.estado}`);

        // Map API status to local status
        const localStatus = this.mapEstado(status.estado);
        invoice.setEstado(localStatus);

        // If correct, update with QR and URL
        if (status.estado === 'Correcto') {
          if (status.qr) invoice.setQrCode(status.qr);
          if (status.url) invoice.setUrlVerificacion(status.url);
          
          // Update order with CORRECTO status
          await this.verifactuRepo.updateOrderVerifactuData(invoice.orderId, {
            verifactuStatus: 'CORRECTO',
            verifactuQrCode: status.qr,
            verifactuUrl: status.url,
          });
          
        } else if (status.estado === 'Incorrecto') {
          // Update order with INCORRECTO status
          await this.verifactuRepo.updateOrderVerifactuData(invoice.orderId, {
            verifactuStatus: 'INCORRECTO',
          });
          
        } else if (status.estado === 'Aceptado con errores') {
          // Update order with ACEPTADO_CON_ERRORES status
          await this.verifactuRepo.updateOrderVerifactuData(invoice.orderId, {
            verifactuStatus: 'ACEPTADO_CON_ERRORES',
          });
        }

        // Save updated invoice
        await this.verifactuRepo.save(invoice);

      } catch (error) {
        console.error(`[Verifactu] Error checking status for ${invoice.uuid}:`, error);
      }
    }

    console.log('[Verifactu] Status check completed');
  }

  private mapEstado(apiEstado: string): VerifactuInvoiceStatus {
    const mapping: Record<string, VerifactuInvoiceStatus> = {
      'Pendiente': 'PENDIENTE',
      'Correcto': 'CORRECTO',
      'Incorrecto': 'INCORRECTO',
      'Aceptado con errores': 'ACEPTADO_CON_ERRORES',
    };
    return mapping[apiEstado] || 'DESCONOCIDO';
  }
}