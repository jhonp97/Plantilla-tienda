// ==========================================
// Generate Invoice From Order Use Case
// Transform Order to VerifactuInvoice
// ==========================================

import { VerifactuInvoice } from '../../domain/entities/VerifactuInvoice';
import type { OrderProps } from '@modules/order/domain/entities/Order';

export interface OrderData {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  guestNifCif?: string | null;
  guestFullName?: string | null;
  user?: {
    nifCif?: string | null;
    fullName?: string | null;
  } | null;
  items: Array<{
    productPrice: number;
    quantity: number;
  }>;
  createdAt: Date;
}

export class GenerateInvoiceFromOrder {
  execute(order: OrderData): VerifactuInvoice {
    // Generate serie and numero from order
    const serie = 'A';
    const numero = order.orderNumber.replace('ORD-', '').replace(/-/g, '');
    const fechaExpedicion = this.formatDate(order.createdAt);

    // Transform order items to Verifactu invoice lines
    const lineas = order.items.map(item => {
      // Calculate base_imponible (net amount without tax)
      const grossAmount = item.productPrice * item.quantity;
      const baseImponible = (grossAmount / 1.21).toFixed(2);
      const cuotaRepercutida = (grossAmount - parseFloat(baseImponible)).toFixed(2);

      return {
        baseImponible,
        tipoImpositivo: '21', // 21% VAT
        cuotaRepercutida,
      };
    });

    // Calculate total (in euros, not cents)
    const importeTotal = (order.totalAmount / 100).toFixed(2);

    // Get customer info (either guest or registered user)
    const nif = order.guestNifCif || order.user?.nifCif;
    const nombre = order.guestFullName || order.user?.fullName || 'Cliente';

    const invoice = VerifactuInvoice.create({
      orderId: order.id,
      serie,
      numero,
      fechaExpedicion,
      tipoFactura: 'F1', // Factura inmediata
      descripcion: `Venta según orden ${order.orderNumber}`,
      nif: nif || undefined,
      nombre,
      lineas,
      importeTotal,
    });

    return invoice;
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}