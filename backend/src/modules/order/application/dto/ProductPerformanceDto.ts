import { z } from 'zod';

// Product performance request
const sortByValues = {
  REVENUE: 'revenue',
  QUANTITY: 'quantity',
  ORDERS: 'orders',
} as const;

const sortOrderValues = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const productPerformanceRequestSchema = z.object({
  // Date range
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  
  // Optional filters
  categoryId: z.string().uuid().optional(),
  
  // Sorting
  sortBy: z.enum(sortByValues).default('revenue'),
  sortOrder: z.enum(sortOrderValues).default('desc'),
  
  // Pagination
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Single product performance data
const productPerformanceDataSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string().optional(),
  categoryName: z.string().optional(),
  
  // Sales metrics
  unitsSold: z.number().int(),
  revenue: z.number().int(), // in cents
  orders: z.number().int(),
  averageOrderQuantity: z.number(), // average units per order
  
  // Performance indicators
  conversionRate: z.number().optional(), // if visitor data available
  revenuePercentage: z.number(), // percentage of total revenue
  
  // Inventory impact
  currentStock: z.number().int(),
  stockSold: z.number().int(),
});

// Product performance response
export const productPerformanceResponseSchema = z.object({
  // Product performance data
  products: z.array(productPerformanceDataSchema),
  
  // Summary totals
  totalProducts: z.number().int(),
  totalUnitsSold: z.number().int(),
  totalRevenue: z.number().int(),
  
  // Pagination info
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
  
  // Period used
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type ProductPerformanceRequest = z.infer<typeof productPerformanceRequestSchema>;
export type ProductPerformanceResponse = z.infer<typeof productPerformanceResponseSchema>;
export type ProductPerformanceData = z.infer<typeof productPerformanceDataSchema>;