# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\customer-journey.spec.ts >> Customer Complete Journey >> Guest can browse products and view details
- Location: e2e\specs\customer-journey.spec.ts:11:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="product-grid"], .product-grid, [data-testid="products-list"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="product-grid"], .product-grid, [data-testid="products-list"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e5]
  - heading "Error" [level=2] [ref=e7]
  - paragraph [ref=e8]: Internal Server Error
  - button "Reintentar" [ref=e9] [cursor=pointer]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class ProductListPage {
  4  |   constructor(private page: Page) {}
  5  | 
  6  |   async goto(): Promise<void> {
  7  |     await this.page.goto('/products');
  8  |     await this.page.waitForLoadState('networkidle');
  9  |   }
  10 | 
  11 |   async expectProductGridVisible(): Promise<void> {
> 12 |     await expect(this.page.locator('[data-testid="product-grid"], .product-grid, [data-testid="products-list"]')).toBeVisible();
     |                                                                                                                   ^ Error: expect(locator).toBeVisible() failed
  13 |   }
  14 | 
  15 |   async expectProductCard(productName: string): Promise<void> {
  16 |     await expect(this.page.locator(`text=${productName}`)).toBeVisible();
  17 |   }
  18 | 
  19 |   async clickProductCard(productName: string): Promise<void> {
  20 |     await this.page.click(`a[href*="/products/"]:has-text("${productName}")`);
  21 |   }
  22 | 
  23 |   async clickFirstProduct(): Promise<void> {
  24 |     await this.page.click('a[href*="/products/"]:first-child');
  25 |   }
  26 | 
  27 |   async searchProducts(query: string): Promise<void> {
  28 |     await this.page.fill('[data-testid="search-input"], input[name="search"], input[placeholder*="Buscar"]', query);
  29 |     await this.page.press('[data-testid="search-input"], input[name="search"]', 'Enter');
  30 |     await this.page.waitForTimeout(500);
  31 |   }
  32 | 
  33 |   async filterByCategory(category: string): Promise<void> {
  34 |     await this.page.click(`[data-testid="category-filter"]:has-text("${category}"), .category-filter:has-text("${category}")`);
  35 |     await this.page.waitForTimeout(500);
  36 |   }
  37 | 
  38 |   async sortProducts(sortOption: string): Promise<void> {
  39 |     await this.page.selectOption('[data-testid="sort-select"], select[name="sort"]', sortOption);
  40 |     await this.page.waitForTimeout(500);
  41 |   }
  42 | 
  43 |   async addProductToCart(productIndex: number = 0): Promise<void> {
  44 |     const addButton = this.page.locator('button:has-text("Ver detalle")').nth(productIndex);
  45 |     await addButton.click();
  46 |     await this.page.waitForTimeout(300);
  47 |   }
  48 | 
  49 |   async expectCartCount(count: string): Promise<void> {
  50 |     await expect(this.page.locator('a[href="/cart"]')).toBeVisible();
  51 |   }
  52 | 
  53 |   async clickShoppingCart(): Promise<void> {
  54 |     await this.page.click('a[href="/cart"]');
  55 |   }
  56 | 
  57 |   async expectNoProducts(): Promise<void> {
  58 |     await expect(this.page.locator('text=No hay productos, text=No products')).toBeVisible();
  59 |   }
  60 | 
  61 |   async clickPagination(pageNumber: number): Promise<void> {
  62 |     await this.page.click(`[data-testid="pagination"]:has-text("${pageNumber}")`);
  63 |     await this.page.waitForLoadState('networkidle');
  64 |   }
  65 | }
```