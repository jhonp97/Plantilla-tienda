import { z } from 'zod';
import type {
  IProductRepository,
  ProductFilters,
} from '../../../domain/repositories/IProductRepository';
import type {
  ListProductsQueryDto,
  SortOption,
} from '../../dto/ListProductsQueryDto';
import { listProductsQuerySchema } from '../../dto/ListProductsQueryDto';
import type { Product } from '../../../domain/entities/Product';

export interface ListProductsInput {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: SortOption;
}

export interface ListProductsResult {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ListProductsInput): Promise<ListProductsResult> {
    const validated = listProductsQuerySchema.parse({
      page: input.page,
      limit: input.limit,
      categoryId: input.categoryId,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      search: input.search,
      sort: input.sort,
    });

    // Build filters
    const filters: ProductFilters = {};
    if (validated.categoryId) {
      filters.categoryId = validated.categoryId;
    }
    if (validated.minPrice !== undefined) {
      filters.minPrice = validated.minPrice;
    }
    if (validated.maxPrice !== undefined) {
      filters.maxPrice = validated.maxPrice;
    }
    if (validated.search) {
      filters.search = validated.search;
    }

    // Fetch products with pagination
    const result = await this.productRepository.findMany(
      filters,
      {
        page: validated.page,
        limit: validated.limit,
      },
      validated.sort
    );

    return {
      items: result.items,
      pagination: result.pagination,
    };
  }
}