// ==========================================
// Register Invoice Use Case
// Send invoice to AEAT via Verifactu API
// ==========================================

import { VerifactuInvoice } from '../../domain/entities/VerifactuInvoice';
import type { IVerifactuApiService } from '../../domain/services/IVerifactuApiService';
import type { IVerifactuRepository } from '../../domain/repositories/IVerifactuRepository';
import type { GenerateInvoiceFromOrder } from './GenerateInvoiceFromOrder';
import type { OrderData } from './GenerateInvoiceFromOrder';

export class RegisterInvoiceUseCase {
  constructor(
    private verifactuApi: IVerifactuApiService,
    private verifactuRepo: IVerifactuRepository,
    private generateInvoice: GenerateInvoiceFromOrder,
  ) {}

  async execute(order: OrderData): Promise<void> {
    console.log(`[Verifactu] Registering invoice for order ${order.orderNumber}`);

    // 1. Generate Verifactu invoice from Order
    const invoice = this.generateInvoice.execute(order);

    try {
      // 2. Send to AEAT
      const response = await this.verifactuApi.createInvoice(invoice);
      
      console.log(`[Verifactu] Invoice created with UUID: ${response.uuid}`);

      // 3. Save response with UUID
      invoice.setUuid(response.uuid);
      invoice.setQrCode(response.qr);
      invoice.setUrlVerificacion(response.url);
      invoice.setEstado('PENDIENTE');
      
      await this.verifactuRepo.save(invoice);

      // 4. Update Order with Verifactu reference
      await this.verifactuRepo.updateOrderVerifactuData(order.id, {
        verifactuUuid: response.uuid,
        verifactuQrCode: response.qr,
        verifactuUrl: response.url,
        verifactuStatus: 'PENDIENTE',
        verifactuRegisteredAt: new Date(),
      });

      console.log(`[Verifactu] Invoice registered successfully for order ${order.orderNumber}`);
      
    } catch (error) {
      // Log error but don't throw to not interrupt checkout
      console.error(`[Verifactu] Error registering invoice for order ${order.orderNumber}:`, error);
      
      // Save as error for retry later
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      invoice.setError('API_ERROR', errorMessage);
      
      try {
        await this.verifactuRepo.save(invoice);
      } catch (saveError) {
        console.error(`[Verifactu] Failed to save error invoice:`, saveError);
      }
    }
  }
}