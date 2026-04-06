import { z } from 'zod';

// Time granularity for analytics
const analyticsGranularityValues = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

// Sales data point
const salesDataPointSchema = z.object({
  period: z.string(), // date string (e.g., "2024-01-15")
  revenue: z.number().int(), // in cents
  orders: z.number().int(),
  averageOrderValue: z.number().int(), // in cents
});

// Top selling product
const topProductSchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  totalSold: z.number().int(),
  revenue: z.number().int(), // in cents
  percentageOfTotal: z.number(), // percentage
});

// Sales analytics request
export const salesAnalyticsRequestSchema = z.object({
  // Date range
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  
  // Granularity
  granularity: z.enum(analyticsGranularityValues).default('daily'),
  
  // Optional filters
  categoryId: z.uuid().optional(),
  productId: z.uuid().optional(),
});

// Sales analytics response
export const salesAnalyticsResponseSchema = z.object({
  // Time series data
  salesOverTime: z.array(salesDataPointSchema),
  
  // Summary statistics
  totalRevenue: z.number().int(),
  totalOrders: z.number().int(),
  averageOrderValue: z.number().int(),
  
  // Top performing products
  topProducts: z.array(topProductSchema),
  
  // Payment method distribution
  salesByPaymentMethod: z.record(z.string(), z.number().int()),
  
  // Period used
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  granularity: z.enum(analyticsGranularityValues),
});

export type SalesAnalyticsRequest = z.infer<typeof salesAnalyticsRequestSchema>;
export type SalesAnalyticsResponse = z.infer<typeof salesAnalyticsResponseSchema>;
export type SalesDataPoint = z.infer<typeof salesDataPointSchema>;
export type TopProduct = z.infer<typeof topProductSchema>;
export type AnalyticsGranularity = z.infer<typeof salesAnalyticsRequestSchema>['granularity'];