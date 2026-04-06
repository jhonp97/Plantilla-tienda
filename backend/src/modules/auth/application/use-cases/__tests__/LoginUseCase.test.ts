import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../LoginUseCase';

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'mocked-jwt-token'),
  },
}));

// Mock env
vi.mock('../../../../../../config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '24h',
  },
}));

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
    };
    loginUseCase = new LoginUseCase(mockUserRepository);
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
      fullName: 'Test User',
      matchesPassword: vi.fn().mockResolvedValue(true),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.fullName).toBe('Test User');
    expect(result.token).toBe('mocked-jwt-token');
  });

  it('should throw error with invalid email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw error with invalid password', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'CUSTOMER' as const,
      fullName: 'Test User',
      matchesPassword: vi.fn().mockResolvedValue(false),
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('should throw error with invalid email format', async () => {
    await expect(
      loginUseCase.execute({
        email: 'invalid-email',
        password: 'password123',
      })
    ).rejects.toThrow();
  });

  it('should throw error with empty password', async () => {
    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: '',
      })
    ).rejects.toThrow();
  });
});