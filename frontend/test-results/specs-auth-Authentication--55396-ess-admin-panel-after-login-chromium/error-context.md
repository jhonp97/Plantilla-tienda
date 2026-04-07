# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\auth.spec.ts >> Authentication >> Admin can access admin panel after login
- Location: e2e\specs\auth.spec.ts:23:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="admin-dashboard"], .admin-dashboard')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="admin-dashboard"], .admin-dashboard')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Bienvenido" [level=1] [ref=e6]
    - paragraph [ref=e7]: Ingresa a tu cuenta para continuar
  - generic [ref=e8]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]:
        - /placeholder: tu@email.com
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Contraseña
        - textbox "Contraseña" [ref=e16]:
          - /placeholder: ••••••••
      - link "¿Olvidaste tu contraseña?" [ref=e17] [cursor=pointer]:
        - /url: /forgot-password
    - button "Entrar" [ref=e18] [cursor=pointer]
  - generic [ref=e20]: o
  - paragraph [ref=e21]:
    - text: ¿No tienes cuenta?
    - link "Crear cuenta" [ref=e22] [cursor=pointer]:
      - /url: /register
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class AdminDashboardPage {
  4  |   constructor(private page: Page) {}
  5  | 
  6  |   async goto(): Promise<void> {
  7  |     await this.page.goto('/dashboard/dashboard');
  8  |     await this.page.waitForLoadState('networkidle');
  9  |   }
  10 | 
  11 |   async expectDashboardLoaded(): Promise<void> {
> 12 |     await expect(this.page.locator('[data-testid="admin-dashboard"], .admin-dashboard')).toBeVisible();
     |                                                                                          ^ Error: expect(locator).toBeVisible() failed
  13 |   }
  14 | 
  15 |   async expectStatsCardsVisible(): Promise<void> {
  16 |     await expect(this.page.locator('[data-testid="stats-cards"], .stats-cards')).toBeVisible();
  17 |   }
  18 | 
  19 |   async expectSalesChartVisible(): Promise<void> {
  20 |     await expect(this.page.locator('[data-testid="sales-chart"], .sales-chart, [data-testid="chart"]')).toBeVisible();
  21 |   }
  22 | 
  23 |   async expectLowStockAlerts(): Promise<void> {
  24 |     await expect(this.page.locator('[data-testid="low-stock-alerts"], .low-stock-alerts')).toBeVisible();
  25 |   }
  26 | 
  27 |   async expectRecentOrdersVisible(): Promise<void> {
  28 |     await expect(this.page.locator('[data-testid="recent-orders"], .recent-orders')).toBeVisible();
  29 |   }
  30 | 
  31 |   async expectTotalRevenue(revenue: string): Promise<void> {
  32 |     await expect(this.page.locator('[data-testid="total-revenue"], .total-revenue')).toContainText(revenue);
  33 |   }
  34 | 
  35 |   async expectTotalOrders(orders: string | number): Promise<void> {
  36 |     const ordersStr = typeof orders === 'number' ? orders.toString() : orders;
  37 |     await expect(this.page.locator('[data-testid="total-orders"], .total-orders')).toContainText(ordersStr);
  38 |   }
  39 | 
  40 |   async expectTotalCustomers(customers: string | number): Promise<void> {
  41 |     const customersStr = typeof customers === 'number' ? customers.toString() : customers;
  42 |     await expect(this.page.locator('[data-testid="total-customers"], .total-customers')).toContainText(customersStr);
  43 |   }
  44 | 
  45 |   async navigateToOrders(): Promise<void> {
  46 |     await this.page.click('[data-testid="orders-menu"], a[href*="/dashboard/orders"]');
  47 |     await this.page.waitForURL(/\/dashboard\/orders/);
  48 |   }
  49 | 
  50 |   async navigateToProducts(): Promise<void> {
  51 |     await this.page.click('[data-testid="products-menu"], a[href*="/dashboard/products"]');
  52 |     await this.page.waitForURL(/\/dashboard\/products/);
  53 |   }
  54 | 
  55 |   async navigateToAnalytics(): Promise<void> {
  56 |     await this.page.click('[data-testid="analytics-menu"], a[href*="/dashboard/analytics"]');
  57 |     await this.page.waitForURL(/\/dashboard\/analytics/);
  58 |   }
  59 | 
  60 |   async navigateToReports(): Promise<void> {
  61 |     await this.page.click('[data-testid="reports-menu"], a[href*="/dashboard/reports"]');
  62 |     await this.page.waitForURL(/\/dashboard\/reports/);
  63 |   }
  64 | 
  65 |   async clickRefreshData(): Promise<void> {
  66 |     await this.page.click('[data-testid="refresh-data-button"]');
  67 |     await this.page.waitForTimeout(1000);
  68 |   }
  69 | 
  70 |   async selectDateRange(range: string): Promise<void> {
  71 |     await this.page.click(`[data-testid="date-range-${range}"]`);
  72 |     await this.page.waitForTimeout(500);
  73 |   }
  74 | 
  75 |   async expectLoadingSpinner(): Promise<void> {
  76 |     await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).toBeVisible();
  77 |   }
  78 | 
  79 |   async expectLoadingSpinnerHidden(): Promise<void> {
  80 |     await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).not.toBeVisible();
  81 |   }
  82 | }
```