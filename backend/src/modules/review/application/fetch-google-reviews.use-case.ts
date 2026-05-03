import { prisma } from '@shared/infra/prisma/client';
import { GoogleMapsPlacesService } from '@modules/review/infrastructure/google-maps.service';

export class FetchAndCacheGoogleReviewsUseCase {
  constructor(
    private readonly googleMapsService: GoogleMapsPlacesService,
  ) {}

  async execute(placeId: string): Promise<{ cached: number; total: number }> {
    const reviews = await this.googleMapsService.fetchPlaceReviews(placeId);

    let cached = 0;
    for (const review of reviews) {
      try {
        await prisma.googleMapReview.upsert({
          where: {
            placeId_authorName_reviewDate: {
              placeId,
              authorName: review.authorName,
              reviewDate: review.reviewDate,
            },
          },
          update: {
            rating: review.rating,
            text: review.text,
            cachedAt: new Date(),
          },
          create: {
            placeId,
            authorName: review.authorName,
            rating: review.rating,
            text: review.text,
            reviewDate: review.reviewDate,
            cachedAt: new Date(),
          },
        });
        cached++;
      } catch (error) {
        console.error(`[GoogleMaps] Failed to upsert review for ${review.authorName}:`, error);
      }
    }

    return { cached, total: reviews.length };
  }
}
