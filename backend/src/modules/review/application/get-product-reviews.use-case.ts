import { prisma } from '@shared/infra/prisma/client';
import { NotFoundError } from '@shared/errors/DomainError';

export interface GetProductReviewsInput {
  productId: string;
  page: number;
  limit: number;
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  userName: string;
  createdAt: Date;
}

export interface GetProductReviewsOutput {
  reviews: ReviewWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  averageRating: number;
  totalReviews: number;
}

export class GetProductReviewsUseCase {
  async execute(input: GetProductReviewsInput): Promise<GetProductReviewsOutput> {
    const { productId, page, limit } = input;
    const skip = (page - 1) * limit;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found', 'Product');
    }

    // Get total count
    const total = await prisma.review.count({
      where: { productId },
    });

    // Get reviews with user info
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Calculate average rating
    const aggregation = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = Math.round((aggregation._avg.rating ?? 0) * 10) / 10;
    const totalReviews = aggregation._count.rating;

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        userName: r.user.fullName,
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      averageRating,
      totalReviews,
    };
  }
}
