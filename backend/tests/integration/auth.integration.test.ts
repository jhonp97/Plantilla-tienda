/**
 * Integration Tests: Auth Module
 *
 * Tests the full HTTP auth flow: register, login, logout, getMe, forgot/reset password.
 *
 * Prerequisites: PostgreSQL database at DATABASE_URL (set in vitest.setup.ts)
 * Skipped if DB is unavailable or SKIP_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getApp, cleanDatabase, seedTestData, getAdminCookies, checkDatabase } from './setup';
import { prisma } from '../../src/shared/infra/prisma/client';

const api = getApp();
let dbOk = false;

beforeAll(async () => {
  dbOk = await checkDatabase();
  if (!dbOk) return;
  await cleanDatabase();
  await seedTestData();
});

afterAll(async () => {
  if (dbOk) await prisma.$disconnect();
});

// ==========================================
// Registration
// ==========================================

describe('POST /api/auth/register', () => {
  const newUser = {
    email: 'newuser@test.com',
    password: 'securepassword123',
    fullName: 'New User',
    nifCif: '12345678B',
  };

  it('should register a new user and return 201', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/register').send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe(newUser.email);
    expect(res.body.data.fullName).toBe(newUser.fullName);
    expect(res.body.data.role).toBe('CUSTOMER');
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('should return 409 when email is already registered', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/register').send(newUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already registered');
  });

  it('should return 400 for invalid email format', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      fullName: 'Bad Email',
      nifCif: '12345678C',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for short password', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/register').send({
      email: 'shortpw@test.com',
      password: '123',
      fullName: 'Short PW',
      nifCif: '12345678D',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ==========================================
// Login
// ==========================================

describe('POST /api/auth/login', () => {
  it('should login with valid credentials and return JWT cookie', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/login').send({
      email: 'customer@test.com',
      password: 'customer123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe('customer@test.com');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const tokenCookie = (cookies as string[]).find((c: string) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();
    expect(tokenCookie).toContain('HttpOnly');
  });

  it('should return 401 for invalid credentials', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/login').send({
      email: 'customer@test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid credentials');
  });

  it('should return 400 for missing fields', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/login').send({
      email: 'customer@test.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ==========================================
// Logout
// ==========================================

describe('POST /api/auth/logout', () => {
  it('should logout and clear the JWT cookie', async () => {
    if (!dbOk) return;
    const cookies = await getAdminCookies();

    const res = await api
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Logged out');

    const clearCookie = (res.headers['set-cookie'] as string[]).find((c: string) => c.startsWith('token='));
    expect(clearCookie).toBeDefined();
    expect(clearCookie).toContain('Max-Age=0');
  });
});

// ==========================================
// Get Current User (Me)
// ==========================================

describe('GET /api/auth/me', () => {
  it('should return current user when authenticated', async () => {
    if (!dbOk) return;
    const cookies = await getAdminCookies();

    const res = await api
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe('admin@test.com');
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('should return 401 when not authenticated', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('should return 401 with invalid token cookie', async () => {
    if (!dbOk) return;
    const res = await api
      .get('/api/auth/me')
      .set('Cookie', ['token=invalid-jwt-token']);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ==========================================
// Forgot Password
// ==========================================

describe('POST /api/auth/forgot-password', () => {
  it('should return 200 for existing email (anti-enumeration)', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/forgot-password').send({
      email: 'customer@test.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('reset link');
  });

  it('should return 200 even for non-existent email (anti-enumeration)', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/forgot-password').send({
      email: 'nonexistent@test.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create a PasswordResetToken in the database', async () => {
    if (!dbOk) return;
    await prisma.passwordResetToken.deleteMany();

    await api.post('/api/auth/forgot-password').send({
      email: 'customer@test.com',
    });

    const tokens = await prisma.passwordResetToken.findMany({
      where: { email: 'customer@test.com' },
    });

    expect(tokens.length).toBeGreaterThanOrEqual(1);
    expect(tokens[0]!.used).toBe(false);
    expect(tokens[0]!.tokenHash).toBeDefined();
    expect(new Date(tokens[0]!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});

// ==========================================
// Reset Password
// ==========================================

describe('POST /api/auth/reset-password', () => {
  it('should validate token and return error for invalid token', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/reset-password').send({
      token: 'invalid-token',
      newPassword: 'newpassword123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid or expired');
  });

  it('should return 400 for missing token', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/reset-password').send({
      newPassword: 'newpassword123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for short new password', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/auth/reset-password').send({
      token: 'sometoken',
      newPassword: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
