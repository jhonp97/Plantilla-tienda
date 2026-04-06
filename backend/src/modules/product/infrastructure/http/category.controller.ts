import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';
import type { CreateCategoryUseCase } from '../../application/use-cases/category';
import type { UpdateCategoryUseCase } from '../../application/use-cases/category';
import type { DeleteCategoryUseCase } from '../../application/use-cases/category';
import type { ListCategoriesUseCase } from '../../application/use-cases/category';
import { DomainError } from '@shared/errors/DomainError';
import { createCategorySchema } from '../../application/dto/CreateCategoryDto';
import { updateCategorySchema } from '../../application/dto/UpdateCategoryDto';
import type { Category } from '../../domain/entities/Category';

/**
 * Category Controller
 * Handles HTTP requests for category endpoints
 * Public: GET /, GET /:slug
 * Admin: POST /, PUT /:id, DELETE /:id
 */
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  /**
   * POST /api/categories
   * Create a new category (ADMIN only)
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createCategorySchema.parse(req.body);

      const result = await this.createCategoryUseCase.execute(validated);

      res.status(201).json({
        success: true,
        data: this.mapCategoryToResponse(result.category),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * GET /api/categories
   * List all categories (public)
   */
  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listCategoriesUseCase.execute();

      res.status(200).json({
        success: true,
        data: result.categories.map((c) => this.mapCategoryToResponse(c)),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * GET /api/categories/:slug
   * Get category by slug with products (public)
   */
  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;

      const category = await this.listCategoriesUseCase.getBySlug(slug);

      if (!category) {
        res.status(404).json({
          success: false,
          error: 'Category not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: this.mapCategoryToResponse(category),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PUT /api/categories/:id
   * Update a category (ADMIN only)
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const validated = updateCategorySchema.parse(req.body);

      const result = await this.updateCategoryUseCase.execute({ id, data: validated });

      res.status(200).json({
        success: true,
        data: this.mapCategoryToResponse(result.category),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * DELETE /api/categories/:id
   * Delete a category (ADMIN only)
   * Only allowed if category has no products
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.deleteCategoryUseCase.execute({ id });

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Map category entity to response format
   */
  private mapCategoryToResponse(category: any): object {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      productCount: category.productCount || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Handle errors with proper status codes
   */
  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof DomainError) {
      if (error.statusCode === 404) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.statusCode === 409) {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    // Pass to global error handler
    next(error);
  }
}