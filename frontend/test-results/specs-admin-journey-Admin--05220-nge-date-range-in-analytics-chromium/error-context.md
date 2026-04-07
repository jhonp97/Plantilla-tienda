# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\admin-journey.spec.ts >> Admin Complete Journey >> Admin can change date range in analytics
- Location: e2e\specs\admin-journey.spec.ts:120:3

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForURL: Test timeout of 60000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/dashboard/**" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Bienvenido" [level=1] [ref=e6]
    - paragraph [ref=e7]: Ingresa a tu cuenta para continuar
  - generic [ref=e8]: Internal Server Error
  - generic [ref=e9]:
    - generic [ref=e11]:
      - generic [ref=e12]: Email
      - textbox "Email" [ref=e13]:
        - /placeholder: tu@email.com
        - text: admin@tienda.com
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: Contraseña
        - textbox "Contraseña" [ref=e17]:
          - /placeholder: ••••••••
          - text: admin123
      - link "¿Olvidaste tu contraseña?" [ref=e18] [cursor=pointer]:
        - /url: /forgot-password
    - button "Entrar" [ref=e19] [cursor=pointer]
  - generic [ref=e21]: o
  - paragraph [ref=e22]:
    - text: ¿No tienes cuenta?
    - link "Crear cuenta" [ref=e23] [cursor=pointer]:
      - /url: /register
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { LoginPage } from '../pages/LoginPage';
  3   | import { AdminDashboardPage } from '../pages/AdminDashboardPage';
  4   | import { AdminOrdersPage } from '../pages/AdminOrdersPage';
  5   | import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';
  6   | import { testUsers, dateRanges } from '../fixtures/test-data';
  7   | 
  8   | test.describe('Admin Complete Journey', () => {
  9   |   test.beforeEach(async ({ page }) => {
  10  |     // Login as admin before each test
  11  |     const loginPage = new LoginPage(page);
  12  |     await loginPage.goto();
  13  |     await loginPage.login(testUsers.admin.email, testUsers.admin.password);
> 14  |     await page.waitForURL('/dashboard/**');
      |                ^ Error: page.waitForURL: Test timeout of 60000ms exceeded.
  15  |   });
  16  | 
  17  |   test('Admin can view dashboard with analytics', async ({ page }) => {
  18  |     const dashboardPage = new AdminDashboardPage(page);
  19  |     await dashboardPage.goto();
  20  |     
  21  |     await dashboardPage.expectDashboardLoaded();
  22  |     await dashboardPage.expectStatsCardsVisible();
  23  |     await dashboardPage.expectSalesChartVisible();
  24  |     await dashboardPage.expectLowStockAlerts();
  25  |     await dashboardPage.expectRecentOrdersVisible();
  26  |   });
  27  | 
  28  |   test('Admin can view different date ranges on dashboard', async ({ page }) => {
  29  |     const dashboardPage = new AdminDashboardPage(page);
  30  |     await dashboardPage.goto();
  31  |     
  32  |     // Test different date ranges
  33  |     await dashboardPage.selectDateRange(dateRanges.last7d);
  34  |     await dashboardPage.expectLoadingSpinner();
  35  |     await dashboardPage.expectLoadingSpinnerHidden();
  36  |     
  37  |     await dashboardPage.selectDateRange(dateRanges.last30d);
  38  |     await dashboardPage.expectLoadingSpinner();
  39  |     await dashboardPage.expectLoadingSpinnerHidden();
  40  |   });
  41  | 
  42  |   test('Admin can navigate to orders management', async ({ page }) => {
  43  |     const dashboardPage = new AdminDashboardPage(page);
  44  |     await dashboardPage.goto();
  45  |     
  46  |     await dashboardPage.navigateToOrders();
  47  |     await page.waitForURL(/\/dashboard\/orders/);
  48  |     
  49  |     const ordersPage = new AdminOrdersPage(page);
  50  |     await ordersPage.expectOrdersTableVisible();
  51  |   });
  52  | 
  53  |   test('Admin can view and update order status in table view', async ({ page }) => {
  54  |     const ordersPage = new AdminOrdersPage(page);
  55  |     await ordersPage.goto();
  56  |     
  57  |     await ordersPage.expectOrdersTableVisible();
  58  |     
  59  |     // Check if there are orders to test with
  60  |     const orderRows = page.locator('[data-testid="order-row"]');
  61  |     const count = await orderRows.count();
  62  |     
  63  |     if (count > 0) {
  64  |       // Get first order number
  65  |       const firstOrderText = await orderRows.first().textContent() || '';
  66  |       const orderNumber = firstOrderText.match(/ORD-\d+/)?.[0] || 'ORD-2024-001';
  67  |       
  68  |       // Open order detail and update status
  69  |       await ordersPage.openOrderDetail(orderNumber);
  70  |       await ordersPage.updateOrderStatus('PROCESSING');
  71  |       await ordersPage.expectStatusUpdateSuccess();
  72  |       await ordersPage.closeOrderDetail();
  73  |     }
  74  |   });
  75  | 
  76  |   test('Admin can switch between table and kanban view', async ({ page }) => {
  77  |     const ordersPage = new AdminOrdersPage(page);
  78  |     await ordersPage.goto();
  79  |     
  80  |     // Default should be table view
  81  |     await ordersPage.expectOrdersTableVisible();
  82  |     
  83  |     // Switch to kanban
  84  |     await ordersPage.switchToKanbanView();
  85  |     await ordersPage.expectOrdersKanbanVisible();
  86  |     
  87  |     // Switch back to table
  88  |     await ordersPage.switchToTableView();
  89  |     await ordersPage.expectOrdersTableVisible();
  90  |   });
  91  | 
  92  |   test('Admin can filter orders by status', async ({ page }) => {
  93  |     const ordersPage = new AdminOrdersPage(page);
  94  |     await ordersPage.goto();
  95  |     
  96  |     await ordersPage.expectOrdersTableVisible();
  97  |     
  98  |     // Filter by pending status
  99  |     await ordersPage.filterByStatus('PENDING');
  100 |     await page.waitForTimeout(500);
  101 |     
  102 |     // Filter by shipped status
  103 |     await ordersPage.filterByStatus('SHIPPED');
  104 |     await page.waitForTimeout(500);
  105 |   });
  106 | 
  107 |   test('Admin can navigate to analytics page', async ({ page }) => {
  108 |     const dashboardPage = new AdminDashboardPage(page);
  109 |     await dashboardPage.goto();
  110 |     
  111 |     await dashboardPage.navigateToAnalytics();
  112 |     await page.waitForURL(/\/dashboard\/analytics/);
  113 |     
  114 |     const analyticsPage = new AdminAnalyticsPage(page);
```