import { vi } from 'vitest';

// Set required environment variables for tests
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-chars';
process.env.JWT_EXPIRES_IN = '24h';
process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = '123456789012345';
process.env.CLOUDINARY_API_SECRET = 'test-secret-for-cloudinary';
process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890abcdefghijklmnop';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_1234567890abcdefghijklmnop';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_1234567890abcdefghijklmnop';
process.env.REPORTS_FOLDER = './reports';
process.env.RESEND_API_KEY = 're_test_1234567890abcdefghijklmnop';
process.env.EMAIL_FROM = 'test@tienda.com';
process.env.ADMIN_EMAIL = 'admin@tienda.com';