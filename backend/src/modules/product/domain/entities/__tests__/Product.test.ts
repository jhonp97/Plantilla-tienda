import { describe, it, expect } from 'vitest';
import { Product } from '../Product';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create valid product', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('Test description');
      expect(product.price).toBe(9999);
      expect(product.stockQuantity).toBe(10);
      expect(product.isActive).toBe(true);
      expect(product.slug).toBe('test-product');
    });

    it('should throw error if name is too short', () => {
      expect(() => {
        Product.create({
          name: 'A',
          description: 'Description',
          price: 1000,
          stockQuantity: 10,
          categoryId: 'cat-123',
        });
      }).toThrow('Product name must be at least 2 characters');
    });

    it('should throw error if price is not positive', () => {
      expect(() => {
        Product.create({
          name: 'Product',
          description: 'Description',
          price: 0,
          stockQuantity: 10,
          categoryId: 'cat-123',
        });
      }).toThrow('Price must be a positive integer (cents)');
    });

    it('should throw error if stock quantity is negative', () => {
      expect(() => {
        Product.create({
          name: 'Product',
          description: 'Description',
          price: 1000,
          stockQuantity: -5,
          categoryId: 'cat-123',
        });
      }).toThrow('Stock quantity cannot be negative');
    });

    it('should throw error if category is not provided', () => {
      expect(() => {
        Product.create({
          name: 'Product',
          description: 'Description',
          price: 1000,
          stockQuantity: 10,
          categoryId: '',
        });
      }).toThrow('Category is required');
    });
  });

  describe('updateStock', () => {
    it('should update stock correctly', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      product.updateStock(50);

      expect(product.stockQuantity).toBe(50);
    });

    it('should throw error if quantity is negative', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      expect(() => {
        product.updateStock(-5);
      }).toThrow('Stock quantity cannot be negative');
    });

    it('should allow setting stock to zero', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      product.updateStock(0);

      expect(product.stockQuantity).toBe(0);
    });
  });

  describe('generateSlug', () => {
    it('should generate correct slug', () => {
      const slug = Product.generateSlug('Test Product');
      expect(slug).toBe('test-product');
    });

    it('should handle special characters', () => {
      const slug = Product.generateSlug('Test Product 123!');
      expect(slug).toBe('test-product-123');
    });

    it('should remove diacritics', () => {
      const slug = Product.generateSlug('Testación Product');
      expect(slug).toBe('testacion-product');
    });

    it('should handle leading/trailing dashes', () => {
      const slug = Product.generateSlug('  Test Product  ');
      expect(slug).toBe('test-product');
    });
  });

  describe('deactivate', () => {
    it('should mark isActive as false', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      expect(product.isActive).toBe(true);

      product.deactivate();

      expect(product.isActive).toBe(false);
    });
  });

  describe('activate', () => {
    it('should mark isActive as true', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
        isActive: false,
      });

      product.activate();

      expect(product.isActive).toBe(true);
    });
  });

  describe('isInStock', () => {
    it('should return true when stock > 0', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      expect(product.isInStock()).toBe(true);
    });

    it('should return false when stock = 0', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 0,
        categoryId: 'cat-123',
      });

      expect(product.isInStock()).toBe(false);
    });
  });

  describe('isOutOfStock', () => {
    it('should return true when stock = 0', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 0,
        categoryId: 'cat-123',
      });

      expect(product.isOutOfStock()).toBe(true);
    });

    it('should return false when stock > 0', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 10,
        categoryId: 'cat-123',
      });

      expect(product.isOutOfStock()).toBe(false);
    });
  });

  describe('isLowStock', () => {
    it('should return true when stock between 1 and 10', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 5,
        categoryId: 'cat-123',
      });

      expect(product.isLowStock()).toBe(true);
    });

    it('should return false when stock > 10', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 15,
        categoryId: 'cat-123',
      });

      expect(product.isLowStock()).toBe(false);
    });

    it('should return false when stock = 0', () => {
      const product = Product.create({
        name: 'Test Product',
        description: 'Test description',
        price: 9999,
        stockQuantity: 0,
        categoryId: 'cat-123',
      });

      expect(product.isLowStock()).toBe(false);
    });
  });
});