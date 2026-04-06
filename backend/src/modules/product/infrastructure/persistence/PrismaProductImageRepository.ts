import type { PrismaClient } from '@shared/infra/prisma/client';
import type { IProductImageRepository } from '@modules/product/domain/repositories/IProductImageRepository';
import { ProductImage, type CreateProductImageInput } from '@modules/product/domain/entities/ProductImage';

export class PrismaProductImageRepository implements IProductImageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateProductImageInput): Promise<ProductImage> {
    const record = await this.prisma.productImage.create({
      data: {
        productId: input.productId,
        url: input.url,
        publicId: input.publicId,
        order: input.order ?? 0,
      },
    });

    return this.toDomain(record);
  }

  async createMany(inputs: CreateProductImageInput[]): Promise<ProductImage[]> {
    await this.prisma.productImage.createMany({
      data: inputs.map(input => ({
        productId: input.productId,
        url: input.url,
        publicId: input.publicId,
        order: input.order ?? 0,
      })),
    });

    // Fetch created records to return domain entities
    const productId = inputs[0]?.productId;
    if (!productId) {
      throw new Error('At least one input with productId is required');
    }

    const createdImages = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });

    return createdImages.map(img => this.toDomain(img));
  }

  async findById(id: string): Promise<ProductImage | null> {
    const record = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    const records = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });

    return records.map(record => this.toDomain(record));
  }

  async findPrimaryByProductId(productId: string): Promise<ProductImage | null> {
    const record = await this.prisma.productImage.findFirst({
      where: {
        productId,
        order: 0,
      },
    });

    if (!record) return null;

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productImage.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.productImage.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async deleteByProductId(productId: string): Promise<void> {
    await this.prisma.productImage.deleteMany({
      where: { productId },
    });
  }

  async countByProductId(productId: string): Promise<number> {
    return this.prisma.productImage.count({
      where: { productId },
    });
  }

  private toDomain(prismaImage: {
    id: string;
    productId: string;
    url: string;
    publicId: string;
    order: number;
    createdAt: Date;
  }): ProductImage {
    return ProductImage.fromPrisma({
      id: prismaImage.id,
      productId: prismaImage.productId,
      url: prismaImage.url,
      publicId: prismaImage.publicId,
      order: prismaImage.order,
      createdAt: prismaImage.createdAt,
    });
  }
}