import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../authController';

// Helper to create mock request
const createMockRequest = (body: any = {}, user?: any): Partial<Request> => ({
  body,
  user,
});

// Helper to create mock response
const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockRegisterUseCase: any;
  let mockLoginUseCase: any;
  let mockGetCurrentUserUseCase: any;
  let mockLogoutUseCase: any;

  beforeEach(() => {
    mockRegisterUseCase = {
      execute: vi.fn(),
    };
    mockLoginUseCase = {
      execute: vi.fn(),
    };
    mockGetCurrentUserUseCase = {
      execute: vi.fn(),
    };
    mockLogoutUseCase = {
      execute: vi.fn(),
    };

    authController = new AuthController(
      mockRegisterUseCase,
      mockLoginUseCase,
      mockGetCurrentUserUseCase,
      mockLogoutUseCase
    );
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '12345678A',
      });
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      mockRegisterUseCase.execute.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'CUSTOMER',
        fullName: 'Test User',
      });

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          role: 'CUSTOMER',
          fullName: 'Test User',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const mockReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '12345678A',
      });
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      mockRegisterUseCase.execute.mockRejectedValue(new Error('Email already exists'));

      await authController.register(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Email already exists'));
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockReq = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      mockLoginUseCase.execute.mockResolvedValue({
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'CUSTOMER',
          fullName: 'Test User',
        },
        token: 'mocked-jwt-token',
      });

      await authController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.cookie).toHaveBeenCalledWith('token', 'mocked-jwt-token', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          role: 'CUSTOMER',
          fullName: 'Test User',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error on invalid credentials', async () => {
      const mockReq = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      mockLoginUseCase.execute.mockRejectedValue(new Error('Invalid credentials'));

      await authController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Invalid credentials'));
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      await authController.logout(mockReq as Request, mockRes as Response, mockNext);

      expect(mockLogoutUseCase.execute).toHaveBeenCalled();
      expect(mockRes.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('getMe', () => {
    it('should return user data when authenticated', async () => {
      const mockReq = createMockRequest({}, { id: '1', email: 'test@example.com', role: 'CUSTOMER' });
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      mockGetCurrentUserUseCase.execute.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'CUSTOMER',
        fullName: 'Test User',
      });

      await authController.getMe(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          role: 'CUSTOMER',
          fullName: 'Test User',
        },
      });
    });

    it('should return 401 when user not authenticated', async () => {
      const mockReq = createMockRequest({}, null);
      const mockRes = createMockResponse();
      const mockNext: NextFunction = vi.fn();

      await authController.getMe(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized',
      });
    });
  });
});