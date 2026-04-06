export interface CreatePaymentIntentInput {
  amount: number; // in cents
  currency?: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
}

export interface IStripeService {
  // Payment Intents
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }>;
  cancelPaymentIntent(paymentIntentId: string): Promise<void>;
  capturePaymentIntent(paymentIntentId: string): Promise<void>;

  // Customers
  createCustomer(email: string, name?: string): Promise<StripeCustomer>;
  getCustomer(customerId: string): Promise<StripeCustomer | null>;

  // Refunds
  createRefund(paymentIntentId: string, amount?: number): Promise<{
    id: string;
    status: string;
    amount: number;
  }>;

  // Webhooks
  constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Promise<{
    type: string;
    data: {
      object: {
        id: string;
        status: string;
        metadata?: Record<string, string>;
        amount: number;
        currency: string;
      };
    };
  }>;
}