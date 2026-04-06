export type EmailTemplate = 
  | 'ORDER_CONFIRMED'
  | 'ORDER_PAID'
  | 'ORDER_PROCESSING'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currencySymbol: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  paymentMethod: string;
  paymentUrl?: string;
}

export interface IEmailService {
  // Send email
  send(input: SendEmailInput): Promise<void>;

  // Order emails
  sendOrderConfirmation(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderPaid(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderProcessing(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderShipped(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderDelivered(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderCancelled(orderId: string, data: OrderEmailData): Promise<void>;
  sendOrderRefunded(orderId: string, data: OrderEmailData): Promise<void>;

  // Admin notifications
  sendAdminNewOrderNotification(orderId: string, data: OrderEmailData): Promise<void>;

  // Templates
  getTemplate(template: EmailTemplate, data: OrderEmailData): {
    subject: string;
    html: string;
    text: string;
  };
}