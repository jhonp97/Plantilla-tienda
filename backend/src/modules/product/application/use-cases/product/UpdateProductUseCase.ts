import slugify from 'slugify';
import { z } from 'zod';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import type { UpdateProductDto } from '../../dto/UpdateProductDto';
import { updateProductSchema } from '../../dto/UpdateProductDto';
import { NotFoundError } from '@shared/errors/DomainError';
import type { Product } from '../../../domain/entities/Product';

export interface UpdateProductInput {
  id: string;
  data: UpdateProductDto;
}

export interface UpdateProductResult {
  product: Product;
}

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductResult> {
    const validated = updateProductSchema.parse(input.data);

    // Find existing product
    const existing = await this.productRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Product not found', 'Product');
    }

    // Validate category if provided
    if (validated.categoryId) {
      const category = await this.categoryRepository.findById(validated.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found', 'Category');
      }
    }

    // Prepare update data
    const updateData: Partial<{
      name: string;
      description: string;
      price: number;
      stockQuantity: number;
      categoryId: string;
    }> = {};

    if (validated.name !== undefined) {
      // Generate new slug if name changed
      const baseSlug = slugify(validated.name, { lower: true });
      let slug = baseSlug;
      let counter = 1;

      // Check for slug collision (excluding current product)
      while (
        await this.productRepository.existsBySlug(slug) &&
        slug !== existing.slug
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.name = validated.name;
    }

    if (validated.description !== undefined) {
      updateData.description = validated.description;
    }

    if (validated.price !== undefined) {
      updateData.price = validated.price;
    }

    if (validated.stockQuantity !== undefined) {
      updateData.stockQuantity = validated.stockQuantity;
    }

    if (validated.categoryId !== undefined) {
      updateData.categoryId = validated.categoryId;
    }

    // Update product
    const product = await this.productRepository.update(input.id, updateData);

    return { product };
  }
}