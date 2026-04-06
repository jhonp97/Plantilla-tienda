import type { PrismaClient } from '@shared/infra/prisma/client';
import type {
  IProductRepository,
  ProductFilters,
  PaginationParams,
  SortOption,
  PaginatedResult
} from '@modules/product/domain/repositories/IProductRepository';
import { Product, type CreateProductInput, type UpdateProductInput } from '@modules/product/domain/entities/Product';
import { Category } from '@modules/product/domain/entities/Category';
import { ProductImage } from '@modules/product/domain/entities/ProductImage';
import { Prisma } from '@prisma/client';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
  };
}>;

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateProductInput): Promise<Product> {
    const record = await this.prisma.product.create({
      data: {
        name: input.name,
        slug: Product.generateSlug(input.name),
        description: input.description || '',
        price: input.price,
        stockQuantity: input.stockQuantity,
        isActive: input.isActive ?? true,
        categoryId: input.categoryId,
      },
    });

    return Product.fromPrisma({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description ?? '',
      price: record.price,
      stockQuantity: record.stockQuantity,
      isActive: record.isActive,
      categoryId: record.categoryId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findMany(
    filters?: ProductFilters,
    pagination?: PaginationParams,
    sort?: SortOption
  ): Promise<PaginatedResult<Product>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: filters?.isActive ?? true,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'priceAsc':
        orderBy = { price: 'asc' };
        break;
      case 'priceDesc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'nameAsc':
        orderBy = { name: 'asc' };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(item => this.toDomain(item)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = Product.generateSlug(data.name);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.stockQuantity !== undefined) {
      updateData.stockQuantity = data.stockQuantity;
    }
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    const record = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.toDomain(record);
  }

  async deactivate(id: string): Promise<Product> {
    const record = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return this.toDomain(record);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { slug },
    });
    return count > 0;
  }

  async count(filters?: ProductFilters): Promise<number> {
    const where: Prisma.ProductWhereInput = {
      isActive: filters?.isActive ?? true,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.count({ where });
  }

  private toDomain(prismaProduct: ProductWithRelations): Product {
    const category = prismaProduct.category
      ? Category.fromPrisma({
          id: prismaProduct.category.id,
          name: prismaProduct.category.name,
          slug: prismaProduct.category.slug,
          description: prismaProduct.category.description ?? undefined,
          createdAt: prismaProduct.category.createdAt,
          updatedAt: prismaProduct.category.updatedAt,
        })
      : undefined;

    const images = prismaProduct.images?.map(
      img =>
        ProductImage.fromPrisma({
          id: img.id,
          productId: img.productId,
          url: img.url,
          publicId: img.publicId,
          order: img.order,
          createdAt: img.createdAt,
        })
    );

    return Product.fromPrisma({
      id: prismaProduct.id,
      name: prismaProduct.name,
      slug: prismaProduct.slug,
      description: prismaProduct.description ?? '',
      price: prismaProduct.price,
      stockQuantity: prismaProduct.stockQuantity,
      isActive: prismaProduct.isActive,
      categoryId: prismaProduct.categoryId,
      category: category?.toJSON(),
      images: images?.map(img => img.toJSON()),
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    });
  }
}