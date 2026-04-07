# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\customer-journey.spec.ts >> Customer Complete Journey >> Logged user can view order history
- Location: e2e\specs\customer-journey.spec.ts:73:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="orders-list"], .orders-list')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="orders-list"], .orders-list')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - img [ref=e6]
  - heading "Error" [level=2] [ref=e8]
  - paragraph [ref=e9]: Internal Server Error
  - button "Reintentar" [ref=e10] [cursor=pointer]
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class OrderHistoryPage {
  4  |   constructor(private page: Page) {}
  5  | 
  6  |   async goto(): Promise<void> {
  7  |     await this.page.goto('/orders');
  8  |     await this.page.waitForLoadState('networkidle');
  9  |   }
  10 | 
  11 |   async expectOrdersListVisible(): Promise<void> {
> 12 |     await expect(this.page.locator('[data-testid="orders-list"], .orders-list')).toBeVisible();
     |                                                                                  ^ Error: expect(locator).toBeVisible() failed
  13 |   }
  14 | 
  15 |   async expectOrderItem(orderNumber: string): Promise<void> {
  16 |     await expect(this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}"), .order-item:has-text("${orderNumber}")`)).toBeVisible();
  17 |   }
  18 | 
  19 |   async clickOrderItem(orderNumber: string): Promise<void> {
  20 |     await this.page.click(`[data-testid="order-item"]:has-text("${orderNumber}")`);
  21 |     await this.page.waitForURL(/\/orders\/.+/);
  22 |   }
  23 | 
  24 |   async expectOrderCount(count: number): Promise<void> {
  25 |     await expect(this.page.locator('[data-testid="order-item"]')).toHaveCount(count);
  26 |   }
  27 | 
  28 |   async expectEmptyOrdersMessage(): Promise<void> {
  29 |     await expect(this.page.locator('[data-testid="empty-orders-message"], text=No tienes pedidos, text=No orders yet')).toBeVisible();
  30 |   }
  31 | 
  32 |   async expectOrderStatus(orderNumber: string, status: string): Promise<void> {
  33 |     const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
  34 |     await expect(orderItem.locator(`[data-testid="order-status"], .order-status:has-text("${status}")`)).toBeVisible();
  35 |   }
  36 | 
  37 |   async expectOrderDate(orderNumber: string, date: string): Promise<void> {
  38 |     const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
  39 |     await expect(orderItem.locator('[data-testid="order-date"], .order-date')).toContainText(date);
  40 |   }
  41 | 
  42 |   async expectOrderTotal(orderNumber: string, total: string): Promise<void> {
  43 |     const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
  44 |     await expect(orderItem.locator('[data-testid="order-total"], .order-total')).toContainText(total);
  45 |   }
  46 | 
  47 |   async filterOrdersByStatus(status: string): Promise<void> {
  48 |     await this.page.selectOption('[data-testid="status-filter"], select[name="status"]', status);
  49 |     await this.page.waitForTimeout(500);
  50 |   }
  51 | 
  52 |   async searchOrders(query: string): Promise<void> {
  53 |     await this.page.fill('[data-testid="search-orders-input"], input[name="search"]', query);
  54 |     await this.page.press('[data-testid="search-orders-input"]', 'Enter');
  55 |     await this.page.waitForTimeout(500);
  56 |   }
  57 | 
  58 |   async clickViewOrderDetails(orderNumber: string): Promise<void> {
  59 |     await this.page.click(`[data-testid="order-item"]:has-text("${orderNumber}") [data-testid="view-details-button"]`);
  60 |     await this.page.waitForURL(/\/orders\/.+/);
  61 |   }
  62 | 
  63 |   async expectPaginationVisible(): Promise<void> {
  64 |     await expect(this.page.locator('[data-testid="pagination"], .pagination')).toBeVisible();
  65 |   }
  66 | }
```