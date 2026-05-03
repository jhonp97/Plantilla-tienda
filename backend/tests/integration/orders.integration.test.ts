/**
 * Integration Tests: Orders Module
 *
 * Tests order endpoints: list user orders, create order (with coupon).
 *
 * Prerequisites: PostgreSQL database at DATABASE_URL (set in vitest.setup.ts)
 * Skipped if DB is unavailable or SKIP_INTEGRATION_TESTS=true
 *
 * NOTE: The OrderController currently returns stub data for create/list endpoints.
 * When the real use cases are wired in the controller, update these tests
 * to verify actual order creation (items, totals, coupon discount, etc.).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getApp, cleanDatabase, seedTestData, getCustomerCookies, getAdminCookies, checkDatabase } from './setup';
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
// List User Orders
// ==========================================

describe('GET /api/orders/my-orders (authenticated)', () => {
  it('should return paginated user orders when authenticated', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .get('/api/orders/my-orders')
      .set('Cookie', customerCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/orders/my-orders');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return pagination structure', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .get('/api/orders/my-orders')
      .set('Cookie', customerCookies);

    expect(res.status).toBe(200);
    // Current stub returns: { orders: [], pagination: { page, limit, total, totalPages, hasMore } }
    expect(res.body.data.pagination).toBeDefined();
    expect(typeof res.body.data.pagination.page).toBe('number');
    expect(typeof res.body.data.pagination.total).toBe('number');
  });
});

// ==========================================
// Get Order by ID
// ==========================================

describe('GET /api/orders/:id', () => {
  it('should return order details', async () => {
    if (!dbOk) return;
    const res = await api.get('/api/orders/some-order-id');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
  });
});

// ==========================================
// Create Order
// ==========================================

describe('POST /api/orders (authenticated)', () => {
  it('should create an order when authenticated', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const orderData = {
      items: [{ productId: 'test-product-id', quantity: 1 }],
      shippingAddress: {
        street: 'Calle Test 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'stripe',
    };

    const res = await api
      .post('/api/orders')
      .set('Cookie', customerCookies)
      .send(orderData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    if (!dbOk) return;
    const res = await api.post('/api/orders').send({
      items: [],
      shippingAddress: {},
      paymentMethod: 'stripe',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should create an order with a coupon code', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();
    const adminCookies = await getAdminCookies();

    // Create coupon
    await api
      .post('/api/admin/coupons')
      .set('Cookie', adminCookies)
      .send({
        code: 'ORDER10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        usageLimit: 100,
      });

    const orderData = {
      items: [{ productId: 'test-product-id', quantity: 1 }],
      shippingAddress: {
        street: 'Calle Test 123',
        postalCode: '28001',
        city: 'Madrid',
        province: 'Madrid',
        country: 'España',
      },
      paymentMethod: 'stripe',
      couponCode: 'ORDER10',
    };

    const res = await api
      .post('/api/orders')
      .set('Cookie', customerCookies)
      .send(orderData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // TODO: When CreateOrderUseCase is wired in OrderController:
    // - verify discountAmount is reflected in response
    // - verify couponCode is stored on the order
  });
});

// ==========================================
// Admin Order Routes
// ==========================================

describe('GET /api/orders/admin/all (admin)', () => {
  it('should return all orders for admin', async () => {
    if (!dbOk) return;
    const adminCookies = await getAdminCookies();

    const res = await api
      .get('/api/orders/admin/all')
      .set('Cookie', adminCookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return 403 for non-admin users', async () => {
    if (!dbOk) return;
    const customerCookies = await getCustomerCookies();

    const res = await api
      .get('/api/orders/admin/all')
      .set('Cookie', customerCookies);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
