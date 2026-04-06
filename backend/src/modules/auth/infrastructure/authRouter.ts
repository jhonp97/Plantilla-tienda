import { Router } from 'express';
import { AuthController } from '@modules/auth/infrastructure/authController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/logout', controller.logout);
  router.get('/me', authMiddleware, controller.getMe);

  return router;
}
