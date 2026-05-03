/**
 * Integration Tests: Coupon Module
 *
 * Tests admin coupon CRUD endpoints and public coupon validation.
 *
 * Prerequisites: PostgreSQL database at DATABASE_URL (set in vitest.setup.ts)
 * Skipped if DB is unavailable or SKIP_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getApp, cleanDatabase, seedTestData, getAdminCookies, getCustomerCookies, checkDatabase } from './setup';
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
// Admin: Create Coupon
// ==========================================

describe('POST /api/admin/coupons (admin)', () => {
  it('should create a percentage coupon', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const res = await api
      .post('/api/admin/coupons')
      .set('Cookie', adminCookies)
      .send({
        code: 'TEST10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 3000,
        usageLimit: 100,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.code).toBe('TEST10');
    expect(res.body.data.discountType).toBe('PERCENTAGE');
    expect(res.body.data.discountValue).toBe(10);
  });

  it('should create a fixed discount coupon', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const res = await api
      .post('/api/admin/coupons')
      .set('Cookie', adminCookies)
      .send({
        code: 'FLAT5',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderAmount: 2000,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('FLAT5');
    expect(res.body.data.discountType).toBe('FIXED');
    expect(res.body.data.discountValue).toBe(500);
  });

  it('should return 403 for non-admin users', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .post('/api/admin/coupons')
      .set('Cookie', customerCookies)
      .send({
        code: 'UNAUTHORIZED',
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for unauthenticated requests', async () => {
    if (!dbOk) return;
    const res = await api
      .post('/api/admin/coupons')
      .send({
        code: 'NOAUTH',
        discountType: 'PERCENTAGE',
        discountValue: 10,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid coupon data', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const res = await api
      .post('/api/admin/coupons')
      .set('Cookie', adminCookies)
      .send({
        code: '',
        discountType: 'INVALID',
        discountValue: -1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ==========================================
// Admin: List Coupons
// ==========================================

describe('GET /api/admin/coupons (admin)', () => {
  it('should list all coupons for admin', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const res = await api
      .get('/api/admin/coupons')
      .set('Cookie', adminCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const codes = res.body.data.map((c: any) => c.code);
    expect(codes).toContain('TEST10');
    expect(codes).toContain('FLAT5');
  });

  it('should return 403 for non-admin users', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .get('/api/admin/coupons')
      .set('Cookie', customerCookies);

    expect(res.status).toBe(403);
  });
});

// ==========================================
// Admin: Update Coupon
// ==========================================

describe('PUT /api/admin/coupons/:id (admin)', () => {
  it('should update a coupon', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const listRes = await api
      .get('/api/admin/coupons')
      .set('Cookie', adminCookies);

    const coupon = listRes.body.data.find((c: any) => c.code === 'TEST10');
    expect(coupon).toBeDefined();

    const res = await api
      .put(`/api/admin/coupons/${coupon.id}`)
      .set('Cookie', adminCookies)
      .send({ discountValue: 15, usageLimit: 50 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountValue).toBe(15);
    expect(res.body.data.usageLimit).toBe(50);
  });

  it('should return 403 for non-admin users when updating', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .put('/api/admin/coupons/some-id')
      .set('Cookie', customerCookies)
      .send({ discountValue: 20 });

    expect(res.status).toBe(403);
  });
});

// ==========================================
// Public: Validate Coupon
// ==========================================

describe('GET /api/coupons/validate', () => {
  it('should validate a valid coupon and return discount', async () => {
    if (!dbOk) return;
    const res = await api
      .get('/api/coupons/validate')
      .query({ code: 'TEST10', orderAmount: 10000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.code).toBe('TEST10');
    expect(res.body.data.discountType).toBe('PERCENTAGE');
    // 10% of 10000 = 1000
    expect(res.body.data.discountAmount).toBe(1000);
  });

  it('should validate a fixed coupon correctly', async () => {
    if (!dbOk) return;
    const res = await api
      .get('/api/coupons/validate')
      .query({ code: 'FLAT5', orderAmount: 10000 });

    expect(res.status).toBe(200);
    expect(res.body.data.discountAmount).toBe(500);
    expect(res.body.data.discountType).toBe('FIXED');
  });

  it('should return 404 for non-existent coupon code', async () => {
    if (!dbOk) return;
    const res = await api
      .get('/api/coupons/validate')
      .query({ code: 'NONEXISTENT', orderAmount: 10000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return error for coupon below minimum order amount', async () => {
    if (!dbOk) return;
    const res = await api
      .get('/api/coupons/validate')
      .query({ code: 'TEST10', orderAmount: 1000 }); // minOrderAmount is 3000

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Minimum order amount');
  });
});

// ==========================================
// Admin: Delete (Soft) Coupon
// ==========================================

describe('DELETE /api/admin/coupons/:id (admin)', () => {
  it('should soft-delete a coupon (set isActive=false)', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const listRes = await api
      .get('/api/admin/coupons')
      .set('Cookie', adminCookies);

    const coupon = listRes.body.data.find((c: any) => c.code === 'FLAT5');
    expect(coupon).toBeDefined();

    const res = await api
      .delete(`/api/admin/coupons/${coupon.id}`)
      .set('Cookie', adminCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });
});
