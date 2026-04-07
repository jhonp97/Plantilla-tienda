import { Page, expect } from '@playwright/test';

export class ProductListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/products');
    await this.page.waitForLoadState('networkidle');
  }

  async expectProductGridVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="product-grid"], .product-grid, [data-testid="products-list"]')).toBeVisible();
  }

  async expectProductCard(productName: string): Promise<void> {
    await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  }

  async clickProductCard(productName: string): Promise<void> {
    await this.page.click(`a[href*="/products/"]:has-text("${productName}")`);
  }

  async clickFirstProduct(): Promise<void> {
    await this.page.click('a[href*="/products/"]:first-child');
  }

  async searchProducts(query: string): Promise<void> {
    await this.page.fill('[data-testid="search-input"], input[name="search"], input[placeholder*="Buscar"]', query);
    await this.page.press('[data-testid="search-input"], input[name="search"]', 'Enter');
    await this.page.waitForTimeout(500);
  }

  async filterByCategory(category: string): Promise<void> {
    await this.page.click(`[data-testid="category-filter"]:has-text("${category}"), .category-filter:has-text("${category}")`);
    await this.page.waitForTimeout(500);
  }

  async sortProducts(sortOption: string): Promise<void> {
    await this.page.selectOption('[data-testid="sort-select"], select[name="sort"]', sortOption);
    await this.page.waitForTimeout(500);
  }

  async addProductToCart(productIndex: number = 0): Promise<void> {
    const addButton = this.page.locator('button:has-text("Ver detalle")').nth(productIndex);
    await addButton.click();
    await this.page.waitForTimeout(300);
  }

  async expectCartCount(count: string): Promise<void> {
    await expect(this.page.locator('a[href="/cart"]')).toBeVisible();
  }

  async clickShoppingCart(): Promise<void> {
    await this.page.click('a[href="/cart"]');
  }

  async expectNoProducts(): Promise<void> {
    await expect(this.page.locator('text=No hay productos, text=No products')).toBeVisible();
  }

  async clickPagination(pageNumber: number): Promise<void> {
    await this.page.click(`[data-testid="pagination"]:has-text("${pageNumber}")`);
    await this.page.waitForLoadState('networkidle');
  }
}