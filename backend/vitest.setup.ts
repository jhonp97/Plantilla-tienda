import { vi } from 'vitest';

// Set required environment variables for tests
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-chars';
process.env.JWT_EXPIRES_IN = '24h';
process.env.NODE_ENV = 'test';