import { Resend } from 'resend';
import { env } from '@config/env';
import type { 
  IEmailService, 
  SendEmailInput, 
  OrderEmailData,
  EmailTemplate 
} from '@modules/order/domain/services/IEmailService';

export class EmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.resend.emails.send({
      from: env.EMAIL_FROM ?? 'Tienda <onboarding@resend.dev>',
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }

  async sendOrderConfirmation(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_CONFIRMED', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderPaid(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_PAID', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderProcessing(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_PROCESSING', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderShipped(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_SHIPPED', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderDelivered(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_DELIVERED', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderCancelled(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_CANCELLED', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendOrderRefunded(orderId: string, data: OrderEmailData): Promise<void> {
    const { subject, html, text } = this.getTemplate('ORDER_REFUNDED', data);
    await this.send({
      to: data.customerEmail,
      subject,
      html,
      text,
    });
  }

  async sendAdminNewOrderNotification(orderId: string, data: OrderEmailData): Promise<void> {
    const subject = `🔔 Nueva orden ${data.orderNumber}`;
    const html = `
      <h1>Nueva orden recibida</h1>
      <p><strong>Número:</strong> ${data.orderNumber}</p>
      <p><strong>Cliente:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail}</p>
      <p><strong>Total:</strong> ${data.currencySymbol}${(data.totalAmount / 100).toFixed(2)}</p>
      <p><strong>Método de pago:</strong> ${data.paymentMethod}</p>
    `;
    
    await this.send({
      to: env.ADMIN_EMAIL ?? 'admin@tienda.com',
      subject,
      html,
      text: `Nueva orden ${data.orderNumber} de ${data.customerName}`,
    });
  }

  getTemplate(template: EmailTemplate, data: OrderEmailData): {
    subject: string;
    html: string;
    text: string;
  } {
    const itemsList = data.items
      .map(item => `${item.productName} x${item.quantity} - ${data.currencySymbol}${(item.totalPrice / 100).toFixed(2)}`)
      .join('\n');

    const templates: Record<EmailTemplate, { subject: string; html: string; text: string }> = {
      ORDER_CONFIRMED: {
        subject: `📦 Orden ${data.orderNumber} confirmada`,
        html: `
          <h1>Orden Confirmada</h1>
          <p>Gracias por tu compra, ${data.customerName}!</p>
          <p>Tu orden <strong>${data.orderNumber}</strong> ha sido confirmada.</p>
          <h2>Resumen:</h2>
          <ul>${data.items.map(item => `<li>${item.productName} x${item.quantity} - ${data.currencySymbol}${(item.totalPrice / 100).toFixed(2)}</li>`).join('')}</ul>
          <p><strong>Total:</strong> ${data.currencySymbol}${(data.totalAmount / 100).toFixed(2)}</p>
          <p>Dirección de envío: ${data.shippingAddress.street}, ${data.shippingAddress.postalCode} ${data.shippingAddress.city}</p>
        `,
        text: `Orden ${data.orderNumber} confirmada. Total: ${data.currencySymbol}${(data.totalAmount / 100).toFixed(2)}`,
      },
      ORDER_PAID: {
        subject: `✅ Pago recibido - Orden ${data.orderNumber}`,
        html: `
          <h1>Pago Recibido</h1>
          <p>¡Gracias por tu compra, ${data.customerName}!</p>
          <p>Hemos recibido el pago de tu orden <strong>${data.orderNumber}</strong>.</p>
          <p><strong>Total:</strong> ${data.currencySymbol}${(data.totalAmount / 100).toFixed(2)}</p>
          <p>Tu orden está siendo procesada.</p>
        `,
        text: `Pago recibido para orden ${data.orderNumber}. Total: ${data.currencySymbol}${(data.totalAmount / 100).toFixed(2)}`,
      },
      ORDER_PROCESSING: {
        subject: `⚙️ Orden ${data.orderNumber} en procesamiento`,
        html: `
          <h1>Orden en Procesamiento</h1>
          <p>Tu orden <strong>${data.orderNumber}</strong> está siendo preparada.</p>
          <p>Te notificaremos cuando haya sido enviada.</p>
        `,
        text: `Orden ${data.orderNumber} en procesamiento`,
      },
      ORDER_SHIPPED: {
        subject: `🚚 Orden ${data.orderNumber} enviada`,
        html: `
          <h1>Orden Enviada</h1>
          <p>Tu orden <strong>${data.orderNumber}</strong> ha sido enviada.</p>
          <p>Dirección de envío: ${data.shippingAddress.street}, ${data.shippingAddress.postalCode} ${data.shippingAddress.city}</p>
        `,
        text: `Orden ${data.orderNumber} enviada`,
      },
      ORDER_DELIVERED: {
        subject: `📬 Orden ${data.orderNumber} entregada`,
        html: `
          <h1>Orden Entregada</h1>
          <p>Tu orden <strong>${data.orderNumber}</strong> ha sido entregada.</p>
          <p>¡Gracias por comprar con nosotros!</p>
        `,
        text: `Orden ${data.orderNumber} entregada`,
      },
      ORDER_CANCELLED: {
        subject: `❌ Orden ${data.orderNumber} cancelada`,
        html: `
          <h1>Orden Cancelada</h1>
          <p>Tu orden <strong>${data.orderNumber}</strong> ha sido cancelada.</p>
          <p>Si tienes alguna pregunta, contáctanos.</p>
        `,
        text: `Orden ${data.orderNumber} cancelada`,
      },
      ORDER_REFUNDED: {
        subject: `💰 Orden ${data.orderNumber} reembolsada`,
        html: `
          <h1>Orden Reembolsada</h1>
          <p>Tu orden <strong>${data.orderNumber}</strong> ha sido reembolsada.</p>
          <p>El reembolso se procesará en los próximos días.</p>
        `,
        text: `Orden ${data.orderNumber} reembolsada`,
      },
    };

    return templates[template];
  }
}