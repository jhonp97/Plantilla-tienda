import type {
  ICategoryRepository,
  CategoryWithProductCount,
} from '../../../domain/repositories/ICategoryRepository';
import type { Category } from '../../../domain/entities/Category';

export interface ListCategoriesResult {
  categories: CategoryWithProductCount[];
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(): Promise<ListCategoriesResult> {
    const categories = await this.categoryRepository.findAll();

    return { categories };
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const category = await this.categoryRepository.findBySlug(slug);
    return category;
  }
}