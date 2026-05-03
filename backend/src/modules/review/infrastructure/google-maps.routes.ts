import { Router } from 'express';
import { GoogleMapsController } from '@modules/review/infrastructure/google-maps.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';

export function createGoogleMapsReviewRouter(controller: GoogleMapsController): Router {
  const router = Router();

  // GET /api/reviews — returns cached Google Maps reviews, ?refresh=true for admin
  router.get('/', controller.listCached);

  return router;
}
