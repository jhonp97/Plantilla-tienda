import type { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

export interface DeleteCategoryInput {
  id: string;
}

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    // Find existing category
    const existing = await this.categoryRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundError('Category not found', 'Category');
    }

    // Check if category has products
    // Note: In a real implementation, this would check the product count
    // For now, we rely on the database constraint or repository logic
    if (existing.products && existing.products.length > 0) {
      throw new ValidationError(
        'Cannot delete category with associated products. Please remove or reassign products first.'
      );
    }

    // Delete category
    await this.categoryRepository.delete(input.id);
  }
}