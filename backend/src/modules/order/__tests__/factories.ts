// ==========================================
// Test Data Factories
// Shared factory functions for test data creation
// ==========================================

import type { Order, OrderStatus, CreateOrderInput, OrderProps } from '../../domain/entities/Order';
import type { Invoice, InvoiceStatus, InvoiceProps, CustomerSnapshot, InvoiceItemSnapshot } from '../../domain/entities/Invoice';
import type { AddressProps } from '../../domain/entities/Address';
import type { OrderItemProps } from '../../domain/entities/OrderItem';

// ==========================================
// Address Factory
// ==========================================

export const createAddressFactory = (overrides?: Partial<AddressProps>): AddressProps => ({
  street: 'Calle Principal 123',
  postalCode: '28001',
  city: 'Madrid',
  province: 'Madrid',
  country: 'España',
  ...overrides,
});

// ==========================================
// OrderItem Factory
// ==========================================

export const createOrderItemFactory = (overrides?: Partial<OrderItemProps> & { productId?: string; productName?: string }): OrderItemProps => ({
  id: crypto.randomUUID(),
  orderId: '',
  productId: 'product-123',
  productName: 'Test Product',
  productSku: 'TEST-001',
  quantity: 2,
  unitPrice: 1000, // €10.00 in cents
  taxRate: 21,
  discountAmount: 0,
  createdAt: new Date(),
  ...overrides,
});

// ==========================================
// Order Factory
// ==========================================

export const createOrderFactory = (overrides?: Partial<OrderProps> & { userId?: string; items?: OrderItemProps[] }): OrderProps => {
  const now = new Date();
  const defaultAddress = createAddressFactory();
  
  return {
    id: crypto.randomUUID(),
    orderNumber: `ORD-26${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-ABC123`,
    userId: 'user-123',
    status: 'PENDING',
    subtotal: 2000,
    taxAmount: 420,
    shippingCost: 500,
    discountAmount: 0,
    totalAmount: 2920,
    paymentMethod: 'CARD',
    paymentIntentId: undefined,
    shippingAddress: defaultAddress,
    billingAddress: defaultAddress,
    notes: undefined,
    customerNif: undefined,
    guestFullName: undefined,
    guestEmail: undefined,
    guestPhone: undefined,
    guestNifCif: undefined,
    items: [],
    paidAt: undefined,
    shippedAt: undefined,
    deliveredAt: undefined,
    cancelledAt: undefined,
    cancellationReason: undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

// ==========================================
// Invoice Factory
// ==========================================

export const createInvoiceFactory = (overrides?: Partial<InvoiceProps>): InvoiceProps => {
  const now = new Date();
  
  const defaultCustomerSnapshot: CustomerSnapshot = {
    name: 'Test Customer',
    email: 'customer@example.com',
    nifCif: '12345678A',
    address: createAddressFactory(),
  };
  
  const defaultItemsSnapshot: InvoiceItemSnapshot[] = [
    {
      productId: 'product-123',
      productName: 'Test Product',
      productPrice: 1000,
      quantity: 2,
      taxRate: 21,
    },
  ];
  
  return {
    id: crypto.randomUUID(),
    orderId: 'order-123',
    invoiceNumber: `F-${now.getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-5)}`,
    customerSnapshot: defaultCustomerSnapshot,
    itemsSnapshot: defaultItemsSnapshot,
    subtotal: 2000,
    taxAmount: 420,
    total: 2920,
    taxRate: 21,
    verifactuUuid: undefined,
    verifactuQrCode: undefined,
    verifactuUrl: undefined,
    verifactuStatus: undefined,
    verifactuRegisteredAt: undefined,
    createdAt: now,
    ...overrides,
  };
};

// ==========================================
// Product Factory
// ==========================================

export interface ProductFactoryOutput {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createProductFactory = (overrides?: Partial<ProductFactoryOutput>): ProductFactoryOutput => {
  const now = new Date();
  
  return {
    id: 'product-123',
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    price: 1000,
    stockQuantity: 100,
    categoryId: 'category-123',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

// ==========================================
// User Factory
// ==========================================

export interface UserFactoryOutput {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  fullName: string;
  nifCif: string;
  phone: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  matchesPassword: (password: string) => Promise<boolean>;
}

export const createUserFactory = (overrides?: Partial<UserFactoryOutput> & { matchesPassword?: (password: string) => Promise<boolean> }): UserFactoryOutput => {
  const now = new Date();
  
  return {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2a$10$hashedpassword',
    role: 'CUSTOMER',
    fullName: 'Test User',
    nifCif: '12345678A',
    phone: '123456789',
    address: {
      street: 'Calle Test 123',
      postalCode: '28001',
      city: 'Madrid',
      province: 'Madrid',
      country: 'España',
    },
    createdAt: now,
    updatedAt: now,
    matchesPassword: async (_password: string) => true,
    ...overrides,
  };
};
