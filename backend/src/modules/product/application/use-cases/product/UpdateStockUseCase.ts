import { z } from 'zod';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';
import type { Product } from '../../../domain/entities/Product';

export const updateStockSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(0, 'Stock quantity cannot be negative'),
});

export interface UpdateStockInput {
  productId: string;
  quantity: number;
}

export interface UpdateStockResult {
  product: Product;
}

export class UpdateStockUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: UpdateStockInput): Promise<UpdateStockResult> {
    const validated = updateStockSchema.parse({ quantity: input.quantity });

    // Find existing product
    const existing = await this.productRepository.findById(input.productId);
    if (!existing) {
      throw new NotFoundError('Product not found', 'Product');
    }

    // Validate quantity is non-negative
    if (validated.quantity < 0) {
      throw new ValidationError('Stock quantity cannot be negative');
    }

    // Update stock
    const product = await this.productRepository.update(input.productId, {
      stockQuantity: validated.quantity,
    });

    return { product };
  }
}