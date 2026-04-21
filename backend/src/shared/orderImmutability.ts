import { Prisma } from '@prisma/client';

/**
 * Prisma middleware to enforce order immutability.
 * Orders that are PAID, PROCESSING, SHIPPED, or DELIVERED cannot be modified.
 * Only cancellation reason can be set, and tracking number can be updated until SHIPPED.
 */
export function createOrderImmutabilityMiddleware() {
  // Prisma 7.x uses a different middleware signature
  // Using generic params type for compatibility
  return async (params: any, next: (params: any) => Promise<any>) => {
    // Only intercept UPDATE and DELETE operations on Order model
    if (params.model !== 'Order' || (params.action !== 'update' && params.action !== 'delete')) {
      return next(params);
    }

    // Get the order ID from the where clause
    const orderId = params.args.where?.id;
    if (!orderId) {
      return next(params);
    }

    // Import PrismaClient dynamically to avoid circular dependency
    const { prisma } = await import('@shared/infra/prisma/client');

    // Fetch current order status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return next(params); // Let the normal error handling occur
    }

    // Define immutable statuses
    const IMMUTABLE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

    if (IMMUTABLE_STATUSES.includes(order.status as typeof IMMUTABLE_STATUSES[number])) {
      // For CANCELLED orders, we allow minimal updates (cancellation reason is already set)
      // and we allow reading status
      if (order.status === 'SHIPPED' && params.action === 'update') {
        // Allow updating tracking number only for SHIPPED orders
        const allowedFields = ['trackingNumber', 'shippedAt'];
        const updateKeys = Object.keys(params.args.data || {});

        const hasOnlyAllowedFields = updateKeys.every(key => allowedFields.includes(key));
        if (hasOnlyAllowedFields && updateKeys.length <= 2) {
          return next(params);
        }
      }

      throw new Error(
        `Order cannot be modified. Order is in "${order.status}" status which is immutable. ` +
        `Contact support if you need to cancel the order.`
      );
    }

    return next(params);
  };
}

/**
 * Alternative: Application-level guard for order immutability
 * This can be used in use-cases where we need more control
 */
export class OrderImmutabilityGuard {
  private static IMMUTABLE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

  static canModify(status: string): boolean {
    return !this.IMMUTABLE_STATUSES.includes(status as typeof this.IMMUTABLE_STATUSES[number]);
  }

  static assertCanModify(status: string): void {
    if (!this.canModify(status)) {
      throw new Error(
        `Order cannot be modified. Order is in "${status}" status which is immutable. ` +
        `Contact support if you need to cancel the order.`
      );
    }
  }

  /**
   * Get allowed status transitions based on current status
   */
  static getAllowedTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    return transitions[currentStatus] || [];
  }
}