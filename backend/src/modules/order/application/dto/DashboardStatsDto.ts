import { z } from 'zod';

// Dashboard statistics response
export const dashboardStatsSchema = z.object({
  // Revenue statistics
  totalRevenue: z.number().int(), // in cents
  revenueToday: z.number().int(),
  revenueThisWeek: z.number().int(),
  revenueThisMonth: z.number().int(),
  revenueThisYear: z.number().int(),
  
  // Order statistics
  totalOrders: z.number().int(),
  ordersToday: z.number().int(),
  ordersThisWeek: z.number().int(),
  ordersThisMonth: z.number().int(),
  ordersThisYear: z.number().int(),
  
  // Order status breakdown
  ordersByStatus: z.record(z.string(), z.number().int()), // { PENDING_PAYMENT: 5, PAID: 10, etc. }
  
  // Average order value
  averageOrderValue: z.number().int(), // in cents
  
  // Customer statistics
  totalCustomers: z.number().int(),
  newCustomersThisMonth: z.number().int(),
  repeatCustomers: z.number().int(),
  
  // Product statistics
  totalProductsSold: z.number().int(),
  lowStockProducts: z.number().int(),
  outOfStockProducts: z.number().int(),
  
  // Conversion rate (orders / visitors)
  conversionRate: z.number().optional(),
  
  // Period used for calculations
  period: z.enum({ TODAY: 'today', WEEK: 'week', MONTH: 'month', YEAR: 'year' }),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

export type DashboardStatsDto = z.infer<typeof dashboardStatsSchema>;