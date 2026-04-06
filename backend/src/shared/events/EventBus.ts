type EventHandler<T> = (data: T) => Promise<void>;

export interface OrderPaidEvent {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  taxAmount: number;
  customerEmail: string;
  customerNif?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  paymentMethod: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  customerEmail: string;
}

export interface StockAdjustedEvent {
  productId: string;
  previousStock: number;
  newStock: number;
  orderId?: string;
}

class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private static instance: EventBus;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async emit<T>(event: string, data: T): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }

  clear(): void {
    this.handlers.clear();
  }

  hasHandlers(event: string): boolean {
    const handlers = this.handlers.get(event);
    return handlers !== undefined && handlers.length > 0;
  }
}

export const eventBus = EventBus.getInstance();
export default eventBus;