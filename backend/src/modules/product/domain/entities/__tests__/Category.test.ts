import { describe, it, expect } from 'vitest';
import { Category } from '../Category';

describe('Category Entity', () => {
  describe('create', () => {
    it('should create valid category', () => {
      const category = Category.create({
        name: 'Electronics',
        description: 'Electronic products',
      });

      expect(category.name).toBe('Electronics');
      expect(category.description).toBe('Electronic products');
      expect(category.slug).toBe('electronics');
    });

    it('should throw error if name is too short', () => {
      expect(() => {
        Category.create({
          name: 'A',
          description: 'Description',
        });
      }).toThrow('Category name must be at least 2 characters');
    });
  });

  describe('generateSlug', () => {
    it('should generate correct slug from name', () => {
      const slug = Category.generateSlug('Electronics');
      expect(slug).toBe('electronics');
    });

    it('should handle spaces and special characters', () => {
      const slug = Category.generateSlug('Home & Garden');
      expect(slug).toBe('home-garden');
    });

    it('should remove diacritics', () => {
      const slug = Category.generateSlug('Categoría');
      expect(slug).toBe('categoria');
    });
  });

  describe('update', () => {
    it('should update name and regenerate slug', () => {
      const category = Category.create({
        name: 'Old Category',
        description: 'Description',
      });

      category.update({ name: 'New Category' });

      expect(category.name).toBe('New Category');
      expect(category.slug).toBe('new-category');
    });

    it('should update description', () => {
      const category = Category.create({
        name: 'Category',
        description: 'Old description',
      });

      category.update({ description: 'New description' });

      expect(category.description).toBe('New description');
    });
  });

  describe('hasProducts', () => {
    it('should return true when category has products', () => {
      const category = Category.create({
        name: 'Category',
        description: 'Description',
      });

      const result = category.hasProducts();
      expect(result).toBe(false);
    });

    it('should return false when category has no products', () => {
      const category = Category.create({
        name: 'Category',
        description: 'Description',
      });

      // Access private props for testing
      const props = (category as any).props;
      props.products = [
        { id: 'prod-1', name: 'Product', slug: 'product', description: '', price: 1000, stockQuantity: 10, categoryId: 'cat-1', isActive: true, createdAt: new Date(), updatedAt: new Date() }
      ];

      const result = category.hasProducts();
      expect(result).toBe(true);
    });
  });
});