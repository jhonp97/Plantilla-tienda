# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\customer-journey.spec.ts >> Customer Complete Journey >> Cart persists items after adding
- Location: e2e\specs\customer-journey.spec.ts:111:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Agregar al carrito")')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e5]
  - heading "Producto no encontrado" [level=2] [ref=e7]
  - paragraph [ref=e8]: Internal Server Error
  - link "Volver al catálogo" [ref=e9] [cursor=pointer]:
    - /url: /products
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class ProductDetailPage {
  4  |   constructor(private page: Page) {}
  5  | 
  6  |   async goto(slug: string): Promise<void> {
  7  |     await this.page.goto(`/products/${slug}`);
  8  |     await this.page.waitForLoadState('networkidle');
  9  |   }
  10 | 
  11 |   async expectProductVisible(): Promise<void> {
  12 |     await expect(this.page.locator('[data-testid="product-detail"], .product-detail')).toBeVisible();
  13 |   }
  14 | 
  15 |   async expectProductName(productName: string): Promise<void> {
  16 |     await expect(this.page.locator(`[data-testid="product-name"], h1:has-text("${productName}")`)).toBeVisible();
  17 |   }
  18 | 
  19 |   async expectProductPrice(price: string | number): Promise<void> {
  20 |     const priceStr = typeof price === 'number' ? `€${price.toFixed(2)}` : price;
  21 |     await expect(this.page.locator(`[data-testid="product-price"], .price:has-text("${priceStr}")`)).toBeVisible();
  22 |   }
  23 | 
  24 |   async expectProductDescription(): Promise<void> {
  25 |     await expect(this.page.locator('[data-testid="product-description"], .product-description')).toBeVisible();
  26 |   }
  27 | 
  28 |   async expectAddToCartButton(): Promise<void> {
  29 |     await expect(this.page.locator('[data-testid="add-to-cart-button"]')).toBeVisible();
  30 |   }
  31 | 
  32 |   async clickAddToCart(): Promise<void> {
> 33 |     await this.page.click('button:has-text("Agregar al carrito")');
     |                     ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  34 |     await this.page.waitForTimeout(500);
  35 |   }
  36 | 
  37 |   async expectOutOfStockMessage(): Promise<void> {
  38 |     await expect(this.page.locator('[data-testid="out-of-stock-message"], text=Sin stock, text=Out of stock')).toBeVisible();
  39 |   }
  40 | 
  41 |   async expectAddToCartDisabled(): Promise<void> {
  42 |     await expect(this.page.locator('[data-testid="add-to-cart-button"], button:has-text("Añadir al carrito")')).toBeDisabled();
  43 |   }
  44 | 
  45 |   async expectStockCount(stock: number): Promise<void> {
  46 |     await expect(this.page.locator('[data-testid="stock-count"], .stock-count')).toContainText(stock.toString());
  47 |   }
  48 | 
  49 |   async expectLowStockWarning(): Promise<void> {
  50 |     await expect(this.page.locator('[data-testid="low-stock-warning"], text=Pocas unidades disponibles')).toBeVisible();
  51 |   }
  52 | 
  53 |   async clickIncreaseQuantity(): Promise<void> {
  54 |     await this.page.click('[data-testid="increase-quantity"], button:has-text("+")');
  55 |   }
  56 | 
  57 |   async clickDecreaseQuantity(): Promise<void> {
  58 |     await this.page.click('[data-testid="decrease-quantity"], button:has-text("-")');
  59 |   }
  60 | 
  61 |   async fillQuantity(quantity: number): Promise<void> {
  62 |     await this.page.fill('[data-testid="quantity-input"], input[name="quantity"]', quantity.toString());
  63 |   }
  64 | 
  65 |   async expectQuantityValue(expected: number): Promise<void> {
  66 |     await expect(this.page.locator('[data-testid="quantity-input"], input[name="quantity"]')).toHaveValue(expected.toString());
  67 |   }
  68 | 
  69 |   async clickGoToCart(): Promise<void> {
  70 |     await this.page.click('[data-testid="go-to-cart-button"], a[href="/cart"]');
  71 |     await this.page.waitForURL('/cart');
  72 |   }
  73 | 
  74 |   async expectSuccessMessage(): Promise<void> {
  75 |     await expect(this.page.locator('[data-testid="success-message"], text=Producto añadido al carrito')).toBeVisible();
  76 |   }
  77 | 
  78 |   async clickContinueShopping(): Promise<void> {
  79 |     await this.page.click('[data-testid="continue-shopping-button"], a[href="/products"]');
  80 |   }
  81 | }
```