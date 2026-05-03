/**
 * Integration Tests: Products Module
 *
 * Tests public product endpoints: list products, get by slug.
 *
 * Prerequisites: PostgreSQL database at DATABASE_URL (set in vitest.setup.ts)
 * Skipped if DB is unavailable or SKIP_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getApp, cleanDatabase, seedTestData, checkDatabase } from './setup';
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
// List Products
// ==========================================

describe('GET /api/products', () => {
  it('should return paginated list of active products', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.items).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);

    const auriculares = res.body.data.items.find((p: any) => p.slug === 'auriculares-bluetooth-pro');
    expect(auriculares).toBeDefined();
    expect(auriculares.name).toBe('Auriculares Bluetooth Pro');
    expect(auriculares.price).toBe(9999);
  });

  it('should support pagination parameters', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/products?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeLessThanOrEqual(1);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(1);
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(2);
    expect(res.body.data.pagination.totalPages).toBeGreaterThanOrEqual(2);
    expect(res.body.data.pagination.hasMore).toBe(true);
  });

  it('should not include inactive products', async () => {
    if (!dbOk) return;
    // Create an inactive product
    const category = await prisma.category.findFirst({ where: { slug: 'electronica' } });
    await prisma.product.create({
      data: {
        name: 'Inactive Product',
        slug: 'inactive-product-test',
        description: 'Should not appear in list',
        price: 1000,
        stockQuantity: 0,
        isActive: false,
        taxRate: 21,
        categoryId: category!.id,
      },
    });

    const res = await api.get('/api/products');
    const items = res.body.data.items;
    const inactive = items.find((p: any) => p.slug === 'inactive-product-test');
    expect(inactive).toBeUndefined();
  });
});

// ==========================================
// Get Product by Slug
// ==========================================

describe('GET /api/products/:slug', () => {
  it('should return product by slug', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/products/auriculares-bluetooth-pro');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.slug).toBe('auriculares-bluetooth-pro');
    expect(res.body.data.name).toBe('Auriculares Bluetooth Pro');
    expect(res.body.data.price).toBe(9999);
    expect(res.body.data.stockQuantity).toBe(50);
  });

  it('should return 404 for non-existent slug', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/products/non-existent-product-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it('should return product with category information', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/products/auriculares-bluetooth-pro');

    expect(res.status).toBe(200);
    expect(res.body.data.categoryId).toBeDefined();
  });
});
