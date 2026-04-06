import { z } from 'zod';

// Report types
const reportTypes = {
  SALES_SUMMARY: 'SALES_SUMMARY',
  PRODUCT_PERFORMANCE: 'PRODUCT_PERFORMANCE',
  CUSTOMER_ANALYTICS: 'CUSTOMER_ANALYTICS',
  INVENTORY_REPORT: 'INVENTORY_REPORT',
  TAX_REPORT: 'TAX_REPORT',
  EXPORT_ORDERS: 'EXPORT_ORDERS',
} as const;

// Report format
const reportFormats = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
} as const;

// Generate report request
export const generateReportSchema = z.object({
  // Report type
  reportType: z.enum(reportTypes, { error: 'Invalid report type' }),
  
  // Date range
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  
  // Report format
  format: z.enum(reportFormats).default('PDF'),
  
  // Optional filters by status
  orderStatuses: z.array(z.string()).optional(),
  
  // Optional category filter
  categoryId: z.string().uuid().optional(),
  
  // Optional product filter
  productId: z.string().uuid().optional(),
  
  // Include specific sections
  includeCharts: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  
  // Email report to (optional)
  emailTo: z.string().email({ error: 'Invalid email format' }).optional(),
});

export type GenerateReportDto = z.infer<typeof generateReportSchema>;
export type ReportType = z.infer<typeof generateReportSchema>['reportType'];
export type ReportFormat = z.infer<typeof generateReportSchema>['format'];

// Report generation response
export const reportGenerationResponseSchema = z.object({
  // Report ID for tracking
  reportId: z.string().uuid(),
  
  // Report type generated
  reportType: z.enum(reportTypes),
  
  // Download URL (if generated)
  downloadUrl: z.string().optional(),
  
  // File format
  format: z.enum(reportFormats),
  
  // File size in bytes
  fileSize: z.number().int().optional(),
  
  // Generation status
  status: z.enum({ PENDING: 'PENDING', PROCESSING: 'PROCESSING', COMPLETED: 'COMPLETED', FAILED: 'FAILED' }),
  
  // Error message if failed
  errorMessage: z.string().optional(),
  
  // Created at
  createdAt: z.string().datetime(),
});

export type ReportGenerationResponse = z.infer<typeof reportGenerationResponseSchema>;