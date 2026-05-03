/**
 * Integration Tests: Review Module
 *
 * Tests review endpoints: create, list, delete.
 *
 * Prerequisites: PostgreSQL database at DATABASE_URL (set in vitest.setup.ts)
 * Skipped if DB is unavailable or SKIP_INTEGRATION_TESTS=true
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getApp, cleanDatabase, seedTestData, getCustomerCookies, getAdminCookies, checkDatabase } from './setup';
import { prisma } from '../../src/shared/infra/prisma/client';

const api = getApp();
let dbOk = false;

let productId: string;
let secondProductId: string;

beforeAll(async () => {
  dbOk = await checkDatabase();
  if (!dbOk) return;

  await cleanDatabase();
  await seedTestData();

  const product = await prisma.product.findUnique({ where: { slug: 'auriculares-bluetooth-pro' } });
  productId = product!.id;

  const secondProduct = await prisma.product.findUnique({ where: { slug: 'smartphone-galaxy-x' } });
  secondProductId = secondProduct!.id;
});

afterAll(async () => {
  if (dbOk) await prisma.$disconnect();
});

// ==========================================
// Create Review
// ==========================================

describe('POST /api/products/:productId/reviews (authenticated)', () => {
  it('should create a review when authenticated', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .post(`/api/products/${productId}/reviews`)
      .set('Cookie', customerCookies)
      .send({ rating: 5, comment: 'Excelente producto, muy recomendado.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe('Excelente producto, muy recomendado.');
    expect(res.body.data.productId).toBe(productId);
  });

  it('should return 401 when not authenticated', async () => {
    if (!dbOk) return;
    const res = await api
      .post(`/api/products/${productId}/reviews`)
      .send({ rating: 4, comment: 'Good product.' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 when user already reviewed this product', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .post(`/api/products/${productId}/reviews`)
      .set('Cookie', customerCookies)
      .send({ rating: 3, comment: 'Segunda review (debería fallar).' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already reviewed');
  });

  it('should return 400 for invalid rating (out of range)', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .post(`/api/products/${secondProductId}/reviews`)
      .set('Cookie', customerCookies)
      .send({ rating: 6 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for non-existent product', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .post('/api/products/non-existent-id/reviews')
      .set('Cookie', customerCookies)
      .send({ rating: 4, comment: 'Review for non-existent product.' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ==========================================
// List Reviews
// ==========================================

describe('GET /api/products/:productId/reviews', () => {
  it('should list reviews for a product', async () => {
    if (!dbOk) return;
    const res = await api.get(`/api/products/${productId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.reviews).toBeDefined();
    expect(res.body.data.averageRating).toBeDefined();
    expect(res.body.data.totalReviews).toBeDefined();

    expect(res.body.data.totalReviews).toBeGreaterThanOrEqual(1);
    expect(Number(res.body.data.averageRating)).toBe(5);
  });

  it('should return paginated reviews', async () => {
    if (!dbOk) return;
    const res = await api
      .get(`/api/products/${productId}/reviews`)
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(10);
  });

  it('should return empty reviews list for product with no reviews', async () => {
    if (!dbOk) return;
    const res = await api.get(`/api/products/${secondProductId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBe(0);
    expect(res.body.data.reviews).toHaveLength(0);
    expect(Number(res.body.data.averageRating)).toBe(0);
  });
});

// ==========================================
// Delete Review
// ==========================================

describe('DELETE /api/reviews/:id', () => {
  it('should delete own review', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const listRes = await api.get(`/api/products/${productId}/reviews`);
    const review = listRes.body.data.reviews[0];
    expect(review).toBeDefined();

    const res = await api
      .delete(`/api/reviews/${review.id}`)
      .set('Cookie', customerCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('deleted');

    const afterRes = await api.get(`/api/products/${productId}/reviews`);
    expect(afterRes.body.data.totalReviews).toBe(0);
  });

  it('should allow admin to delete any review', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    // Create a review as customer on second product
    await api
      .post(`/api/products/${secondProductId}/reviews`)
      .set('Cookie', customerCookies)
      .send({ rating: 4, comment: 'Review to be deleted by admin.' });

    // Get review ID
    const listRes = await api.get(`/api/products/${secondProductId}/reviews`);
    const review = listRes.body.data.reviews[0];
    expect(review).toBeDefined();

    // Delete as admin
    const adminCookies = await getAdminCookies();
    const res = await api
      .delete(`/api/reviews/${review.id}`)
      .set('Cookie', adminCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    if (!dbOk) return;
    const res = await api.delete('/api/reviews/some-id');
    expect(res.status).toBe(401);
  });
});
