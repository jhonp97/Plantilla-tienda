import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';
import { prisma } from '@shared/infra/prisma/client';
import { FetchAndCacheGoogleReviewsUseCase } from '@modules/review/application/fetch-google-reviews.use-case';

export class GoogleMapsController {
  constructor(
    private readonly fetchAndCacheGoogleReviewsUseCase: FetchAndCacheGoogleReviewsUseCase,
  ) {}

  // GET /api/reviews
  listCached = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const placeId = (req.query.placeId as string) || '';

      if (!placeId) {
        res.json({ success: true, data: [] });
        return;
      }

      // Admin can force refresh
      const forceRefresh = req.query.refresh === 'true';
      if (forceRefresh && req.user?.role === 'ADMIN') {
        const result = await this.fetchAndCacheGoogleReviewsUseCase.execute(placeId);
        console.log(`[GoogleMaps] Forced refresh: ${result.cached}/${result.total} reviews cached`);
      }

      // Return cached reviews
      const reviews = await prisma.googleMapReview.findMany({
        where: { placeId },
        orderBy: { reviewDate: 'desc' },
      });

      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  };
}
