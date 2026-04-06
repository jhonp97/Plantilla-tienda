import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaCategoryRepository } from '../PrismaCategoryRepository';

// Mock Prisma client
const mockPrisma = {
  category: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  product: {
    count: vi.fn(),
  },
} as any;

describe('PrismaCategoryRepository', () => {
  let repository: PrismaCategoryRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new PrismaCategoryRepository(mockPrisma);
  });

  describe('create', () => {
    it('should create a category', async () => {
      const input = {
        name: 'Electronics',
        description: 'Electronic products',
      };

      const mockCategoryRecord = {
        id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.create.mockResolvedValue(mockCategoryRecord);

      const result = await repository.create(input);

      expect(result.name).toBe('Electronics');
      expect(result.slug).toBe('electronics');
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          slug: expect.any(String),
          description: input.description,
        },
      });
    });
  });

  describe('findById', () => {
    it('should find category by id', async () => {
      const mockCategoryRecord = {
        id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategoryRecord);

      const result = await repository.findById('cat-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('cat-123');
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
        include: {
          _count: { select: { products: true } },
        },
      });
    });

    it('should return null if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('should find category by slug', async () => {
      const mockCategoryRecord = {
        id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategoryRecord);

      const result = await repository.findBySlug('electronics');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('electronics');
    });
  });

  describe('findAll', () => {
    it('should return all categories with product counts', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Electronics', slug: 'electronics', description: 'Electronic products', createdAt: new Date(), updatedAt: new Date(), _count: { products: 5 } },
        { id: 'cat-2', name: 'Clothing', slug: 'clothing', description: 'Clothing items', createdAt: new Date(), updatedAt: new Date(), _count: { products: 10 } },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].productCount).toBe(5);
      expect(result[1].productCount).toBe(10);
    });
  });

  describe('update', () => {
    it('should update category fields', async () => {
      const mockCategoryRecord = {
        id: 'cat-123',
        name: 'Updated Electronics',
        slug: 'updated-electronics',
        description: 'Updated description',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { products: 0 },
      };

      mockPrisma.category.update.mockResolvedValue(mockCategoryRecord);

      const result = await repository.update('cat-123', {
        name: 'Updated Electronics',
        description: 'Updated description',
      });

      expect(result.name).toBe('Updated Electronics');
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      mockPrisma.category.delete.mockResolvedValue(undefined);

      await repository.delete('cat-123');

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
      });
    });
  });

  describe('existsBySlug', () => {
    it('should return true if slug exists', async () => {
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await repository.existsBySlug('electronics');

      expect(result).toBe(true);
    });

    it('should return false if slug does not exist', async () => {
      mockPrisma.category.count.mockResolvedValue(0);

      const result = await repository.existsBySlug('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('existsByName', () => {
    it('should return true if name exists', async () => {
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await repository.existsByName('Electronics');

      expect(result).toBe(true);
    });

    it('should return false if name does not exist', async () => {
      mockPrisma.category.count.mockResolvedValue(0);

      const result = await repository.existsByName('NonExistent');

      expect(result).toBe(false);
    });
  });

  describe('hasProducts', () => {
    it('should return true if category has products', async () => {
      mockPrisma.product.count.mockResolvedValue(5);

      const result = await repository.hasProducts('cat-123');

      expect(result).toBe(true);
      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: { categoryId: 'cat-123' },
      });
    });

    it('should return false if category has no products', async () => {
      mockPrisma.product.count.mockResolvedValue(0);

      const result = await repository.hasProducts('cat-123');

      expect(result).toBe(false);
    });
  });
});