/**
 * Test data for E2E tests
 * Contains test users, products, and checkout data
 */

export const testUsers = {
  customer: {
    email: 'customer@test.com',
    password: 'password123',
    fullName: 'Juan Pérez',
    phone: '+34123456789',
    nifCif: '12345678A',
  },
  admin: {
    email: 'admin@tienda.com',
    password: 'admin123',
    fullName: 'Admin User',
    role: 'ADMIN',
  },
  newUser: {
    email: 'newuser@test.com',
    password: 'newuser123',
    confirmPassword: 'newuser123',
    fullName: 'Nuevo Usuario',
    phone: '+34987654321',
    nifCif: '87654321B',
  },
};

export const testProducts = {
  available: {
    slug: 'auriculares-bluetooth',
    name: 'Auriculares Bluetooth',
    price: 79.99,
  },
  outOfStock: {
    slug: 'producto-sin-stock',
    name: 'Producto Sin Stock',
    stock: 0,
  },
  limitedStock: {
    slug: 'producto-stock-limitado',
    name: 'Producto Stock Limitado',
    stock: 2,
  },
};

export const testShippingInfo = {
  valid: {
    email: 'guest@test.com',
    fullName: 'Juan Pérez',
    phone: '+34123456789',
    nifCif: '12345678A',
    street: 'Calle Mayor 123',
    postalCode: '28001',
    city: 'Madrid',
  },
  alternate: {
    email: 'alternate@test.com',
    fullName: 'María García',
    phone: '+34911223344',
    nifCif: '55667788C',
    street: 'Avenida Gran Vía 45',
    postalCode: '28013',
    city: 'Madrid',
  },
};

export const testCards = {
  valid: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000044',
};

export const orderStatuses = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export const dateRanges = {
  last7d: '7d',
  last30d: '30d',
  last90d: '90d',
  lastYear: '1y',
};