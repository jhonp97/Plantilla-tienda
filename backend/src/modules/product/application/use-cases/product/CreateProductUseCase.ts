import slugify from 'slugify';
import { z } from 'zod';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import type { ICloudinaryService } from '../../../domain/services/ICloudinaryService';
import type { CreateProductDto } from '../../dto/CreateProductDto';
import { createProductSchema } from '../../dto/CreateProductDto';
import { NotFoundError } from '@shared/errors/DomainError';
import type { Product } from '../../../domain/entities/Product';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  taxRate?: number; // 0, 4, 10, or 21
  categoryId: string;
  images?: Array<{
    url: string;
    publicId: string;
    order?: number;
  }>;
}

export interface CreateProductResult {
  product: Product;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository,
    private readonly cloudinaryService: ICloudinaryService
  ) {}

  async execute(input: CreateProductDto): Promise<CreateProductResult> {
    const validated = createProductSchema.parse(input);

    // Validate category exists
    const category = await this.categoryRepository.findById(validated.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found', 'Category');
    }

    // Generate unique slug
    let baseSlug = slugify(validated.name, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.productRepository.existsBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create product
    const product = await this.productRepository.create({
      name: validated.name,
      description: validated.description,
      price: validated.price,
      stockQuantity: validated.stockQuantity,
      taxRate: validated.taxRate ?? 21,
      categoryId: validated.categoryId,
    });

    // Handle images if provided
    if (validated.images && validated.images.length > 0) {
      // Note: Images would be handled by the image repository
      // The product creation with images would need modification in the repository
    }

    return { product };
  }
}