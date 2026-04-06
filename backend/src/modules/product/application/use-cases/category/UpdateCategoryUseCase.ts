import slugify from 'slugify';
import { z } from 'zod';
import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import type { UpdateCategoryDto } from '../../dto/UpdateCategoryDto';
import { updateCategorySchema } from '../../dto/UpdateCategoryDto';
import { NotFoundError, ConflictError } from '@shared/errors/DomainError';
import type { Category } from '../../../domain/entities/Category';

export interface UpdateCategoryInput {
  id: string;
  data: UpdateCategoryDto;
}

export interface UpdateCategoryResult {
  category: Category;
}

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryResult> {
    const validated = updateCategorySchema.parse(input.data);

    // Find existing category
    const existing = await this.categoryRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Category not found', 'Category');
    }

    // Check for duplicate name if name is being changed
    if (validated.name && validated.name !== existing.name) {
      const nameExists = await this.categoryRepository.existsByName(validated.name);
      if (nameExists) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    // Prepare update data
    const updateData: Partial<{
      name: string;
      description: string;
    }> = {};

    if (validated.name !== undefined) {
      // Generate new slug if name changed
      const baseSlug = slugify(validated.name, { lower: true });
      let slug = baseSlug;
      let counter = 1;

      // Check for slug collision (excluding current category)
      while (
        await this.categoryRepository.existsBySlug(slug) &&
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

    // Update category
    const category = await this.categoryRepository.update(input.id, updateData);

    return { category };
  }
}