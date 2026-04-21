import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaProductRepository } from '../PrismaProductRepository';

// Helper to create a mock Decimal-like object
const createDecimal = (value: number) => {
  return {
    toString: () => String(value),
    toNumber: () => value,
    [Symbol.toStringTag]: 'Decimal',
  };
};

// Mock Prisma client
const mockPrisma = {
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
} as any;

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PrismaProductRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a product', async () => {
      const input = {
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      };

      const mockProductRecord = {
        id: 'prod-123',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        isActive: true,
        taxRate: createDecimal(21),
        categoryId: 'cat-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.create.mockResolvedValue(mockProductRecord);

      const result = await repository.create(input);

      expect(result.name).toBe('Test Product');
      expect(result.slug).toBe('test-product');
      expect(result.taxRate).toBe(21);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          slug: 'test-product',
          description: input.description,
          price: input.price,
          stockQuantity: input.stockQuantity,
          isActive: true,
          taxRate: 21,
          categoryId: input.categoryId,
        },
      });
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      const mockProductRecord = {
        id: 'prod-123',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        isActive: true,
        categoryId: 'cat-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-123',
          name: 'Category',
          slug: 'category',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images: [],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProductRecord);

      const result = await repository.findById('prod-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('prod-123');
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-123' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      });
    });

    it('should return null if product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find product by slug', async () => {
      const mockProductRecord = {
        id: 'prod-123',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        isActive: true,
        categoryId: 'cat-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-123',
          name: 'Category',
          slug: 'category',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images: [],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProductRecord);

      const result = await repository.findBySlug('test-product');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-product');
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
        },
      });
    });

    it('should return null if slug not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const result = await repository.findBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should list products with pagination', async () => {
      const mockProducts = [
        { id: 'prod-1', name: 'Product 1', slug: 'product-1', description: '', price: 5000, stockQuantity: 10, isActive: true, categoryId: 'cat-1', createdAt: new Date(), updatedAt: new Date(), category: null, images: [] },
        { id: 'prod-2', name: 'Product 2', slug: 'product-2', description: '', price: 6000, stockQuantity: 20, isActive: true, categoryId: 'cat-1', createdAt: new Date(), updatedAt: new Date(), category: null, images: [] },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await repository.findMany();

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should apply category filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await repository.findMany({ categoryId: 'cat-123' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-123' }),
        })
      );
    });

    it('should apply price filters', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await repository.findMany({ minPrice: 1000, maxPrice: 5000 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: expect.objectContaining({ gte: 1000, lte: 5000 }),
          }),
        })
      );
    });

    it('should apply search filter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await repository.findMany({ search: 'test query' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should sort by price ascending', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await repository.findMany({}, { page: 1, limit: 10 }, 'priceAsc');

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });

    it('should filter only active products by default', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await repository.findMany();

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const mockProductRecord = {
        id: 'prod-123',
        name: 'Updated Product',
        slug: 'updated-product',
        description: 'Updated description',
        price: 15000,
        stockQuantity: 50,
        isActive: true,
        categoryId: 'cat-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        images: [],
      };

      mockPrisma.product.update.mockResolvedValue(mockProductRecord);

      const result = await repository.update('prod-123', {
        name: 'Updated Product',
        description: 'Updated description',
        price: 15000,
        stockQuantity: 50,
      });

      expect(result.name).toBe('Updated Product');
      expect(result.price).toBe(15000);
    });
  });

  describe('deactivate', () => {
    it('should deactivate product', async () => {
      const mockProductRecord = {
        id: 'prod-123',
        name: 'Product',
        slug: 'product',
        description: 'Description',
        price: 5000,
        stockQuantity: 10,
        isActive: false,
        categoryId: 'cat-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: null,
        images: [],
      };

      mockPrisma.product.update.mockResolvedValue(mockProductRecord);

      const result = await repository.deactivate('prod-123');

      expect(result.isActive).toBe(false);
    });
  });

  describe('existsBySlug', () => {
    it('should return true if slug exists', async () => {
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await repository.existsBySlug('test-product');

      expect(result).toBe(true);
    });

    it('should return false if slug does not exist', async () => {
      mockPrisma.product.count.mockResolvedValue(0);

      const result = await repository.existsBySlug('non-existent');

      expect(result).toBe(false);
    });
  });
});