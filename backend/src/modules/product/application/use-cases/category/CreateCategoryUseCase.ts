import slugify from 'slugify';
import { z } from 'zod';
import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import type { CreateCategoryDto } from '../../dto/CreateCategoryDto';
import { createCategorySchema } from '../../dto/CreateCategoryDto';
import { ConflictError } from '@shared/errors/DomainError';
import type { Category } from '../../../domain/entities/Category';

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface CreateCategoryResult {
  category: Category;
}

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryDto): Promise<CreateCategoryResult> {
    const validated = createCategorySchema.parse(input);

    // Check for duplicate name
    const nameExists = await this.categoryRepository.existsByName(validated.name);
    if (nameExists) {
      throw new ConflictError('Category with this name already exists');
    }

    // Generate unique slug
    let baseSlug = slugify(validated.name, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.categoryRepository.existsBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create category
    const category = await this.categoryRepository.create({
      name: validated.name,
      description: validated.description,
    });

    return { category };
  }
}