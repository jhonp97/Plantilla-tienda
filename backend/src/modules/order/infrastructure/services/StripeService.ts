import Stripe from 'stripe';
import { env } from '@config/env';
import type { 
  IStripeService, 
  CreatePaymentIntentInput, 
  PaymentIntentResult,
  StripeCustomer 
} from '@modules/order/domain/services/IStripeService';

export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency ?? 'eur',
      metadata: input.metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
    };
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
  }> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<void> {
    await this.stripe.paymentIntents.capture(paymentIntentId);
  }

  async createCustomer(email: string, name?: string): Promise<StripeCustomer> {
    const customer = await this.stripe.customers.create({
      email,
      name,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name ?? undefined,
    };
  }

  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (!customer || customer.deleted) {
        return null;
      }

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name ?? undefined,
      };
    } catch {
      return null;
    }
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<{
    id: string;
    status: string;
    amount: number;
  }> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });

    return {
      id: refund.id,
      status: refund.status ?? 'pending',
      amount: refund.amount,
    };
  }

  async constructWebhookEvent(
    payload: Buffer, 
    signature: string, 
    webhookSecret: string
  ): Promise<{
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
  }> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    const obj = event.data.object as any;
    
    return {
      type: event.type,
      data: {
        object: {
          id: obj.id || 'unknown',
          status: obj.status || 'unknown',
          metadata: obj.metadata,
          amount: obj.amount || 0,
          currency: obj.currency || 'eur',
        },
      },
    };
  }
}