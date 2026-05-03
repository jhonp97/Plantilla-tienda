import { prisma } from '@shared/infra/prisma/client';
import { NotFoundError, ValidationError } from '@shared/errors/DomainError';

export class DeleteReviewUseCase {
  async execute(reviewId: string, userId: string, userRole: string): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError('Review not found', 'Review');
    }

    // Only the author or an admin can delete
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ValidationError('You are not authorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
