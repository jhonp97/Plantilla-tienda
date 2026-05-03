import { prisma } from '@shared/infra/prisma/client';
import { createReviewSchema } from '@shared/infra/validation/schemas';
import { ConflictError, NotFoundError } from '@shared/errors/DomainError';
import type { z } from 'zod';

export interface CreateReviewResult {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

export class CreateReviewUseCase {
  async execute(
    input: z.infer<typeof createReviewSchema>,
    userId: string,
  ): Promise<CreateReviewResult> {
    const validated = createReviewSchema.parse(input);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found', 'Product');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validated.productId,
        userId,
      },
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: validated.productId,
        order: {
          userId,
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });

    if (orderItem) {
      isVerifiedPurchase = true;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId: validated.productId,
        userId,
        rating: validated.rating,
        comment: validated.comment ?? null,
        isVerifiedPurchase,
      },
    });

    // Update product average rating
    await this.updateProductAverageRating(validated.productId);

    return {
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
    };
  }

  private async updateProductAverageRating(productId: string): Promise<void> {
    const aggregation = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Store average rating in a custom field or just return it from the get endpoint
    // For now we just log it - the GET endpoint will calculate it dynamically
    const avgRating = aggregation._avg.rating ?? 0;
    const count = aggregation._count.rating;

    // Update the product with computed average (stored as virtual field via JSON or separate field)
    // Since Product model doesn't have averageRating, we calculate on-the-fly in the GET endpoint
    console.log(`[Review] Product ${productId} average rating: ${avgRating} (${count} reviews)`);
  }
}
