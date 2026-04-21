import type { IInvoiceRepository } from '@modules/order/domain/repositories/IInvoiceRepository';
import type { IOrderRepository } from '@modules/order/domain/repositories/IOrderRepository';
import type { CustomerSnapshot, InvoiceItemSnapshot } from '@modules/order/domain/entities/Invoice';
import { NotFoundError, AlreadyExistsError } from '@shared/errors/DomainError';

export interface CreateInvoiceFromOrderInput {
  orderId: string;
}

export interface CreateInvoiceFromOrderResult {
  invoiceId: string;
  invoiceNumber: string;
}

export class CreateInvoiceFromOrderUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: CreateInvoiceFromOrderInput): Promise<CreateInvoiceFromOrderResult> {
    // Check if invoice already exists for this order
    const existingInvoice = await this.invoiceRepository.findByOrderId(input.orderId);
    if (existingInvoice) {
      throw new AlreadyExistsError('Invoice already exists for this order', 'Invoice');
    }

    // Get the order with all related data
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'Order');
    }

    // Build customer snapshot from order data
    const customerSnapshot: CustomerSnapshot = {
      name: order.guestFullName ?? order.userId,
      email: '', // Would come from user or guest email
      nifCif: '', // Would come from order customerNif or guestNifCif
      address: {
        street: order.shippingAddress.street,
        postalCode: order.shippingAddress.postalCode,
        city: order.shippingAddress.city,
        province: order.shippingAddress.province,
        country: order.shippingAddress.country,
      },
    };

    // Build items snapshot from order items
    const itemsSnapshot: InvoiceItemSnapshot[] = order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.unitPrice,
      quantity: item.quantity,
      taxRate: item.taxRate,
    }));

    // Calculate tax rate from order (using dominant rate or default)
    const taxRate = itemsSnapshot.length > 0 ? itemsSnapshot[0].taxRate : 21;

    // Create the invoice
    const invoice = await this.invoiceRepository.create({
      orderId: input.orderId,
      customerSnapshot,
      itemsSnapshot,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      total: order.totalAmount,
      taxRate,
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    };
  }
}