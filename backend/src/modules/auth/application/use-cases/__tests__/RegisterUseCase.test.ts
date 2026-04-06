import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterUseCase } from '@modules/auth/application/RegisterUseCase';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => 'hashed-password'),
  },
}));

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    registerUseCase = new RegisterUseCase(mockUserRepository);
  });

  it('should register successfully with valid data', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'CUSTOMER',
      fullName: 'Test User',
      nifCif: '12345678A',
      phone: '123456789',
      address: {
        street: 'Test Street',
        postalCode: '12345',
        city: 'Test City',
        province: 'Test Province',
        country: 'Test Country',
      },
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);

    const result = await registerUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      nifCif: '12345678A',
      phone: '123456789',
      address: {
        street: 'Test Street',
        postalCode: '12345',
        city: 'Test City',
        province: 'Test Province',
        country: 'Test Country',
      },
    });

    expect(result.email).toBe('test@example.com');
    expect(result.fullName).toBe('Test User');
    expect(result.nifCif).toBe('12345678A');
  });

  it('should throw error when email already exists', async () => {
    const existingUser = {
      id: '1',
      email: 'test@example.com',
      role: 'CUSTOMER',
      fullName: 'Existing User',
      nifCif: '12345678A',
      phone: '123456789',
      address: {
        street: 'Test Street',
        postalCode: '12345',
        city: 'Test City',
        province: 'Test Province',
        country: 'Test Country',
      },
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '87654321B',
      })
    ).rejects.toThrow('Email already registered');
  });

  it('should register successfully without optional address', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'CUSTOMER',
      fullName: 'Test User',
      nifCif: '12345678A',
      phone: '123456789',
      address: {
        street: '',
        postalCode: '',
        city: '',
        province: '',
        country: '',
      },
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);

    const result = await registerUseCase.execute({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      nifCif: '12345678A',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.address).toEqual({
      street: '',
      postalCode: '',
      city: '',
      province: '',
      country: '',
    });
  });

  it('should throw error with invalid email format', async () => {
    await expect(
      registerUseCase.execute({
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '12345678A',
      })
    ).rejects.toThrow();
  });

  it('should throw error with short password', async () => {
    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'short',
        fullName: 'Test User',
        nifCif: '12345678A',
      })
    ).rejects.toThrow();
  });

  it('should throw error with short fullName', async () => {
    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'T',
        nifCif: '12345678A',
      })
    ).rejects.toThrow();
  });

  it('should throw error with short nifCif', async () => {
    await expect(
      registerUseCase.execute({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '123',
      })
    ).rejects.toThrow();
  });
});