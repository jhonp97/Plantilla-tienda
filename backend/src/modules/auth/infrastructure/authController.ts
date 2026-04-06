import type { Request, Response, NextFunction } from 'express';
import type { RegisterResult } from '@modules/auth/application/RegisterUseCase';
import { LoginUseCase } from '@modules/auth/application/LoginUseCase';
import { GetCurrentUserUseCase } from '@modules/auth/application/GetCurrentUserUseCase';
import { LogoutUseCase } from '@modules/auth/application/LogoutUseCase';
import { getCookieOptions, getClearCookieOptions } from '@config/cookie';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthController {
  constructor(
    private readonly registerUseCase: any,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result: RegisterResult = await this.registerUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        data: {
          id: result.id,
          email: result.email,
          role: result.role,
          fullName: result.fullName,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);

      res.cookie('token', result.token, getCookieOptions());

      res.status(200).json({
        success: true,
        data: result.user,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.logoutUseCase.execute();

      res.clearCookie('token', getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const user = await this.getCurrentUserUseCase.execute(req.user.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
