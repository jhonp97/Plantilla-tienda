/**
 * Integration Test Setup
 *
 * Provides helpers for supertest-based integration tests:
 * - Express app instance
 * - Database cleanup and seeding
 * - Authentication helpers (register, login, cookie extraction)
 */

import { app } from '../../src/main';
import request from 'supertest';
import { prisma } from '../../src/shared/infra/prisma/client';
import bcrypt from 'bcryptjs';

// ==========================================
// App & Request
// ==========================================

/** Get a supertest request bound to the Express app */
export function getApp(): request.SuperTest<request.Test> {
  return request(app);
}

// ==========================================
// Database Connectivity Check
// ==========================================

/**
 * Check if the test database is reachable.
 * Call this in beforeAll() to conditionally skip integration tests.
 * Returns `true` if the database is available, `false` otherwise.
 */
export async function checkDatabase(): Promise<boolean> {
  if (process.env.SKIP_INTEGRATION_TESTS) {
    console.warn('⚠️ SKIP_INTEGRATION_TESTS is set — skipping integration suite');
    return false;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.warn('⚠️ Database not available — skipping integration tests. Error:', (err as Error).message);
    console.warn('   Ensure PostgreSQL is running at DATABASE_URL in vitest.setup.ts');
    return false;
  }
}

// ==========================================
// Database Helpers
// ==========================================

/**
 * Truncate all tables in the public schema (except _prisma_migrations).
 * Use this in beforeAll/beforeEach to ensure clean state.
 */
export async function cleanDatabase(): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
}

/**
 * Seed the minimal required test data:
 * - Admin user (admin@test.com / admin123)
 * - Customer user (customer@test.com / customer123)
 * - 2 categories (Electrónica, Ropa)
 * - 2 products (Auriculares Bluetooth Pro, Smartphone Galaxy X)
 */
export async function seedTestData(): Promise<void> {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      passwordHash: adminPassword,
      fullName: 'Admin Test',
      nifCif: '12345678Z',
      role: 'ADMIN',
      address: {
        street: 'Calle Admin 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
    },
  });

  // Customer user
  await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      fullName: 'Customer Test',
      nifCif: '87654321A',
      role: 'CUSTOMER',
      address: {
        street: 'Calle Cliente 456',
        postalCode: '08001',
        city: 'Barcelona',
        province: 'Barcelona',
        country: 'España',
      },
    },
  });

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronica' },
    update: {},
    create: {
      name: 'Electrónica',
      slug: 'electronica',
      description: 'Productos electrónicos y tecnología',
    },
  });

  await prisma.category.upsert({
    where: { slug: 'ropa' },
    update: {},
    create: {
      name: 'Ropa',
      slug: 'ropa',
      description: 'Ropa y accesorios de moda',
    },
  });

  // Products
  await prisma.product.upsert({
    where: { slug: 'auriculares-bluetooth-pro' },
    update: {},
    create: {
      name: 'Auriculares Bluetooth Pro',
      slug: 'auriculares-bluetooth-pro',
      description: 'Auriculares inalámbricos con cancelación de ruido activa.',
      price: 9999,
      stockQuantity: 50,
      isActive: true,
      taxRate: 21,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'smartphone-galaxy-x' },
    update: {},
    create: {
      name: 'Smartphone Galaxy X',
      slug: 'smartphone-galaxy-x',
      description: 'Teléfono inteligente con pantalla AMOLED.',
      price: 59999,
      stockQuantity: 25,
      isActive: true,
      taxRate: 21,
      categoryId: electronics.id,
    },
  });
}

// ==========================================
// Authentication Helpers
// ==========================================

/** Register a new user via the auth endpoint */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  nifCif: string,
): Promise<request.Response> {
  return request(app)
    .post('/api/auth/register')
    .send({ email, password, fullName, nifCif });
}

/** Login and return the Set-Cookie headers */
export async function loginUser(
  email: string,
  password: string,
): Promise<string[]> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.headers['set-cookie'] as string[];
}

/** Get auth cookies for the admin test user */
export async function getAdminCookies(): Promise<string[]> {
  return loginUser('admin@test.com', 'admin123');
}

/** Get auth cookies for the customer test user */
export async function getCustomerCookies(): Promise<string[]> {
  return loginUser('customer@test.com', 'customer123');
}

// ==========================================
// Teardown
// ==========================================

/** Disconnect Prisma after all tests in a suite */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
