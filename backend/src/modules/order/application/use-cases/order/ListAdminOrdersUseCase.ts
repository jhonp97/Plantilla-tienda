import type { IOrderRepository, PaginatedResult, PaginationParams, OrderFilters } from '@modules/order/domain/repositories/IOrderRepository';
import type { Order, OrderStatus } from '@modules/order/domain/entities/Order';

export interface AdminOrderFilters {
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export class ListAdminOrdersUseCase {
  constructor(private orderRepo: IOrderRepository) {}

  async execute(
    filters?: AdminOrderFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Order>> {
    const orderFilters: OrderFilters = {};
    
    if (filters) {
      if (filters.status) {
        orderFilters.status = filters.status;
      }
      if (filters.fromDate) {
        orderFilters.fromDate = filters.fromDate;
      }
      if (filters.toDate) {
        orderFilters.toDate = filters.toDate;
      }
    }

    const result = await this.orderRepo.findMany(orderFilters, pagination);
    
    let items = result.items;
    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      items = items.filter((order: Order) => {
        const total = order.totalAmount;
        if (filters.minAmount !== undefined && total < filters.minAmount) {
          return false;
        }
        if (filters.maxAmount !== undefined && total > filters.maxAmount) {
          return false;
        }
        return true;
      });
    }

    return {
      items,
      pagination: {
        ...result.pagination,
        total: items.length,
        totalPages: Math.ceil(items.length / (pagination?.limit || 10)),
      },
    };
  }
}