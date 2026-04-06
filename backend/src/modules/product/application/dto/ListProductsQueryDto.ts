import { z } from 'zod';

export const sortOptions = [
  'priceAsc',
  'priceDesc',
  'newest',
  'nameAsc',
] as const;

export const listProductsQuerySchema = z.object({
  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20),
  categoryId: z.string().uuid('Invalid category ID format').optional(),
  minPrice: z
    .number()
    .int('Min price must be a positive integer (cents)')
    .positive('Min price must be positive (in cents)')
    .optional(),
  maxPrice: z
    .number()
    .int('Max price must be a positive integer (cents)')
    .positive('Max price must be positive (in cents)')
    .optional(),
  search: z.string().optional(),
  sort: z.enum(sortOptions).optional(),
});

export type ListProductsQueryDto = z.infer<typeof listProductsQuerySchema>;
export type SortOption = (typeof sortOptions)[number];