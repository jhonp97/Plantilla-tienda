import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';
import type { CreateProductUseCase } from '../../application/use-cases/product';
import type { UpdateProductUseCase } from '../../application/use-cases/product';
import type { DeleteProductUseCase } from '../../application/use-cases/product';
import type { GetProductBySlugUseCase } from '../../application/use-cases/product';
import type { ListProductsUseCase } from '../../application/use-cases/product';
import type { UpdateStockUseCase } from '../../application/use-cases/product';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { DomainError } from '@shared/errors/DomainError';
import { createProductSchema } from '../../application/dto/CreateProductDto';
import { updateProductSchema } from '../../application/dto/UpdateProductDto';
import { listProductsQuerySchema } from '../../application/dto/ListProductsQueryDto';
import type { ListProductsInput } from '../../application/use-cases/product/ListProductsUseCase';
import type { Product } from '../../domain/entities/Product';

/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 * Public: GET /, GET /:slug
 * Admin: POST /, PUT /:id, PATCH /:id/deactivate, PATCH /:id/stock
 */
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly updateStockUseCase: UpdateStockUseCase,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  /**
   * POST /api/products
   * Create a new product (ADMIN only)
   * Accepts multipart/form-data with images
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse multipart form data
      const { name, description, price, stockQuantity, categoryId } = req.body;

      const dto = {
        name: String(name),
        description: String(description || ''),
        price: parseInt(String(price), 10),
        stockQuantity: parseInt(String(stockQuantity), 10),
        categoryId: String(categoryId),
      };

      // Validate with Zod
      const validated = createProductSchema.parse(dto);

      const result = await this.createProductUseCase.execute(validated);

      res.status(201).json({
        success: true,
        data: this.mapProductToResponse(result.product),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * GET /api/products
   * List all active products with pagination and filters (public)
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Handle categorySlug -> categoryId conversion
      let categoryId: string | undefined = undefined;
      
      if (req.query.categorySlug) {
        const slug = String(req.query.categorySlug);
        const category = await this.categoryRepository.findBySlug(slug);
        if (category) {
          categoryId = category.id;
        }
      } else if (req.query.categoryId) {
        categoryId = String(req.query.categoryId);
      }

      const queryParams = {
        page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
        limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
        categoryId: categoryId,
        minPrice: req.query.minPrice ? parseInt(String(req.query.minPrice), 10) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(String(req.query.maxPrice), 10) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        sort: req.query.sort ? String(req.query.sort) as ListProductsInput['sort'] : undefined,
      };

      const validated = listProductsQuerySchema.parse(queryParams);

      const result = await this.listProductsUseCase.execute({
        page: validated.page,
        limit: validated.limit,
        categoryId: validated.categoryId,
        minPrice: validated.minPrice,
        maxPrice: validated.maxPrice,
        search: validated.search,
        sort: validated.sort,
      });

      res.status(200).json({
        success: true,
        data: {
          items: result.items.map((p) => this.mapProductToResponse(p)),
          pagination: result.pagination,
        },
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * GET /api/products/:slug
   * Get product by slug (public)
   */
  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;

      const result = await this.getProductBySlugUseCase.execute(slug);

      res.status(200).json({
        success: true,
        data: this.mapProductToResponse(result.product),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PUT /api/products/:id
   * Update a product (ADMIN only)
   * Accepts multipart/form-data for optional new images
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { name, description, price, stockQuantity, categoryId } = req.body;

      const dto = {
        ...(name && { name: String(name) }),
        ...(description !== undefined && { description: String(description) }),
        ...(price && { price: parseInt(String(price), 10) }),
        ...(stockQuantity !== undefined && { stockQuantity: parseInt(String(stockQuantity), 10) }),
        ...(categoryId && { categoryId: String(categoryId) }),
      };

      const validated = updateProductSchema.parse(dto);

      const result = await this.updateProductUseCase.execute({ id, data: validated });

      res.status(200).json({
        success: true,
        data: this.mapProductToResponse(result.product),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PATCH /api/products/:id/deactivate
   * Soft delete a product (ADMIN only)
   */
  deactivate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;

      await this.deleteProductUseCase.execute({ id });

      res.status(200).json({
        success: true,
        message: 'Product deactivated successfully',
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * PATCH /api/products/:id/stock
   * Update stock quantity (ADMIN only)
   */
  updateStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid quantity: must be a non-negative number',
        });
        return;
      }

      const result = await this.updateStockUseCase.execute({ productId: id, quantity });

      res.status(200).json({
        success: true,
        data: this.mapProductToResponse(result.product),
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  /**
   * Map product entity to response format
   */
  private mapProductToResponse(product: Product): object {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      categoryId: product.categoryId,
      category: (product as any).category
        ? {
            id: (product as any).category.id,
            name: (product as any).category.name,
            slug: (product as any).category.slug,
          }
        : undefined,
      images: (product as any).images
        ? (product as any).images.map((img: any) => ({
            id: img.id,
            url: img.url,
            publicId: img.publicId,
            order: img.order,
          }))
        : undefined,
      imageUrl:
        (product as any).images && (product as any).images.length > 0
          ? (product as any).images.find((img: any) => img.order === 0)?.url || (product as any).images[0].url
          : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
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
