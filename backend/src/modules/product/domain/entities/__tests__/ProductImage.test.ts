import { describe, it, expect } from 'vitest';
import { ProductImage } from '../ProductImage';

describe('ProductImage Entity', () => {
  describe('create', () => {
    it('should create valid product image', () => {
      const image = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
      });

      expect(image.productId).toBe('prod-123');
      expect(image.url).toBe('https://example.com/image.jpg');
      expect(image.publicId).toBe('products/prod-123/image');
      expect(image.order).toBe(0);
    });

    it('should throw error if product ID is not provided', () => {
      expect(() => {
        ProductImage.create({
          productId: '',
          url: 'https://example.com/image.jpg',
          publicId: 'public-id',
        });
      }).toThrow('Product ID is required');
    });

    it('should throw error if URL is not provided', () => {
      expect(() => {
        ProductImage.create({
          productId: 'prod-123',
          url: '',
          publicId: 'public-id',
        });
      }).toThrow('Image URL is required');
    });

    it('should throw error if public ID is not provided', () => {
      expect(() => {
        ProductImage.create({
          productId: 'prod-123',
          url: 'https://example.com/image.jpg',
          publicId: '',
        });
      }).toThrow('Cloudinary public ID is required');
    });
  });

  describe('isPrimary', () => {
    it('should return true when order is 0', () => {
      const image = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
        order: 0,
      });

      expect(image.isPrimary()).toBe(true);
    });

    it('should return false when order is not 0', () => {
      const image = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
        order: 1,
      });

      expect(image.isPrimary()).toBe(false);
    });

    it('should identify primary image (order=0)', () => {
      const primaryImage = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/primary.jpg',
        publicId: 'products/prod-123/primary',
        order: 0,
      });

      const secondaryImage = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/secondary.jpg',
        publicId: 'products/prod-123/secondary',
        order: 1,
      });

      expect(primaryImage.isPrimary()).toBe(true);
      expect(secondaryImage.isPrimary()).toBe(false);
    });
  });

  describe('order', () => {
    it('should use default order of 0 when not provided', () => {
      const image = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
      });

      expect(image.order).toBe(0);
    });

    it('should use custom order when provided', () => {
      const image = ProductImage.create({
        productId: 'prod-123',
        url: 'https://example.com/image.jpg',
        publicId: 'products/prod-123/image',
        order: 5,
      });

      expect(image.order).toBe(5);
    });
  });
});