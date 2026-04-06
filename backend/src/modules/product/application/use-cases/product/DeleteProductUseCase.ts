import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { NotFoundError } from '@shared/errors/DomainError';
import type { Product } from '../../../domain/entities/Product';

export interface DeleteProductInput {
  id: string;
}

export interface DeleteProductResult {
  product: Product;
}

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: DeleteProductInput): Promise<DeleteProductResult> {
    // Find existing product
    const existing = await this.productRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Product not found', 'Product');
    }

    // Soft delete - deactivate
    const product = await this.productRepository.deactivate(input.id);

    return { product };
  }
}