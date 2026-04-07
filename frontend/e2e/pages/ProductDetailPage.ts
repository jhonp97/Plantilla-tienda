import { Page, expect } from '@playwright/test';

export class ProductDetailPage {
  constructor(private page: Page) {}

  async goto(slug: string): Promise<void> {
    await this.page.goto(`/products/${slug}`);
    await this.page.waitForLoadState('networkidle');
  }

  async expectProductVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="product-detail"], .product-detail')).toBeVisible();
  }

  async expectProductName(productName: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="product-name"], h1:has-text("${productName}")`)).toBeVisible();
  }

  async expectProductPrice(price: string | number): Promise<void> {
    const priceStr = typeof price === 'number' ? `€${price.toFixed(2)}` : price;
    await expect(this.page.locator(`[data-testid="product-price"], .price:has-text("${priceStr}")`)).toBeVisible();
  }

  async expectProductDescription(): Promise<void> {
    await expect(this.page.locator('[data-testid="product-description"], .product-description')).toBeVisible();
  }

  async expectAddToCartButton(): Promise<void> {
    await expect(this.page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  }

  async clickAddToCart(): Promise<void> {
    await this.page.click('button:has-text("Agregar al carrito")');
    await this.page.waitForTimeout(500);
  }

  async expectOutOfStockMessage(): Promise<void> {
    await expect(this.page.locator('[data-testid="out-of-stock-message"], text=Sin stock, text=Out of stock')).toBeVisible();
  }

  async expectAddToCartDisabled(): Promise<void> {
    await expect(this.page.locator('[data-testid="add-to-cart-button"], button:has-text("Añadir al carrito")')).toBeDisabled();
  }

  async expectStockCount(stock: number): Promise<void> {
    await expect(this.page.locator('[data-testid="stock-count"], .stock-count')).toContainText(stock.toString());
  }

  async expectLowStockWarning(): Promise<void> {
    await expect(this.page.locator('[data-testid="low-stock-warning"], text=Pocas unidades disponibles')).toBeVisible();
  }

  async clickIncreaseQuantity(): Promise<void> {
    await this.page.click('[data-testid="increase-quantity"], button:has-text("+")');
  }

  async clickDecreaseQuantity(): Promise<void> {
    await this.page.click('[data-testid="decrease-quantity"], button:has-text("-")');
  }

  async fillQuantity(quantity: number): Promise<void> {
    await this.page.fill('[data-testid="quantity-input"], input[name="quantity"]', quantity.toString());
  }

  async expectQuantityValue(expected: number): Promise<void> {
    await expect(this.page.locator('[data-testid="quantity-input"], input[name="quantity"]')).toHaveValue(expected.toString());
  }

  async clickGoToCart(): Promise<void> {
    await this.page.click('[data-testid="go-to-cart-button"], a[href="/cart"]');
    await this.page.waitForURL('/cart');
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.page.locator('[data-testid="success-message"], text=Producto añadido al carrito')).toBeVisible();
  }

  async clickContinueShopping(): Promise<void> {
    await this.page.click('[data-testid="continue-shopping-button"], a[href="/products"]');
  }
}