import type { IProductRepository, ProductFilters } from '@modules/product/domain/repositories/IProductRepository';
import type { IStoreSettingsRepository } from '@modules/order/domain/repositories/IStoreSettingsRepository';
import type { Product } from '@modules/product/domain/entities/Product';

interface LowStockProduct {
  productId: string;
  productName: string;
  slug: string;
  currentStock: number;
  threshold: number;
  deficit: number; // How many units below threshold
}

export class GetLowStockProductsUseCase {
  constructor(
    private productRepo: IProductRepository,
    private settingsRepo: IStoreSettingsRepository
  ) {}

  async execute(): Promise<{
    lowStockProducts: LowStockProduct[];
    outOfStockProducts: LowStockProduct[];
    threshold: number;
  }> {
    // Get low stock threshold from settings
    const settings = await this.settingsRepo.get();
    const threshold = settings.lowStockThreshold;

    // Get all active products
    const productsResult = await this.productRepo.findMany(
      { isActive: true },
      { page: 1, limit: 10000 }
    );

    const products = productsResult.items.map(p => p.toJSON());

    // Separate into low stock and out of stock
    const lowStockProducts: LowStockProduct[] = [];
    const outOfStockProducts: LowStockProduct[] = [];

    for (const product of products) {
      const productData = {
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        currentStock: product.stockQuantity,
        threshold,
        deficit: 0,
      };

      if (product.stockQuantity === 0) {
        productData.deficit = threshold; // Treat as max deficit
        outOfStockProducts.push(productData);
      } else if (product.stockQuantity <= threshold) {
        productData.deficit = threshold - product.stockQuantity;
        lowStockProducts.push(productData);
      }
    }

    // Sort by deficit (most critical first)
    lowStockProducts.sort((a, b) => b.deficit - a.deficit);
    outOfStockProducts.sort((a, b) => b.deficit - a.deficit);

    return {
      lowStockProducts,
      outOfStockProducts,
      threshold,
    };
  }
}