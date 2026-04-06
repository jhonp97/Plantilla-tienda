import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { NotFoundError } from '@shared/errors/DomainError';
import type { Product } from '../../../domain/entities/Product';

export interface GetProductBySlugResult {
  product: Product;
}

export class GetProductBySlugUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string): Promise<GetProductBySlugResult> {
    const product = await this.productRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundError('Product not found', 'Product');
    }

    return { product };
  }
}