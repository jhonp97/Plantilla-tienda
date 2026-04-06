import type { PrismaClient } from '@shared/infra/prisma/client';
import type {
  ICategoryRepository,
  CategoryWithProductCount
} from '@modules/product/domain/repositories/ICategoryRepository';
import { Category, type CreateCategoryInput, type UpdateCategoryInput } from '@modules/product/domain/entities/Category';
import { Prisma } from '@prisma/client';

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: { products: true };
    };
  };
}>;

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCategoryInput): Promise<Category> {
    const record = await this.prisma.category.create({
      data: {
        name: input.name,
        slug: Category.generateSlug(input.name),
        description: input.description || '',
      },
    });

    return Category.fromPrisma({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record, record._count.products);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!record) return null;

    return this.toDomain(record, record._count.products);
  }

  async findAll(): Promise<CategoryWithProductCount[]> {
    const records = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return records.map(record => ({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description ?? undefined,
      productCount: record._count.products,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  }

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = Category.generateSlug(data.name);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const record = await this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return this.toDomain(record, record._count.products);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { slug },
    });
    return count > 0;
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return count > 0;
  }

  async hasProducts(id: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { categoryId: id },
    });
    return count > 0;
  }

  private toDomain(prismaCategory: CategoryWithCount, productCount?: number): Category {
    return Category.fromPrisma({
      id: prismaCategory.id,
      name: prismaCategory.name,
      slug: prismaCategory.slug,
      description: prismaCategory.description ?? undefined,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }
}