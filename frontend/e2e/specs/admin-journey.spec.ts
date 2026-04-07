import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminOrdersPage } from '../pages/AdminOrdersPage';
import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';
import { testUsers, dateRanges } from '../fixtures/test-data';

test.describe('Admin Complete Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await page.waitForURL('/dashboard/**');
  });

  test('Admin can view dashboard with analytics', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    await dashboardPage.expectDashboardLoaded();
    await dashboardPage.expectStatsCardsVisible();
    await dashboardPage.expectSalesChartVisible();
    await dashboardPage.expectLowStockAlerts();
    await dashboardPage.expectRecentOrdersVisible();
  });

  test('Admin can view different date ranges on dashboard', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    // Test different date ranges
    await dashboardPage.selectDateRange(dateRanges.last7d);
    await dashboardPage.expectLoadingSpinner();
    await dashboardPage.expectLoadingSpinnerHidden();
    
    await dashboardPage.selectDateRange(dateRanges.last30d);
    await dashboardPage.expectLoadingSpinner();
    await dashboardPage.expectLoadingSpinnerHidden();
  });

  test('Admin can navigate to orders management', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    await dashboardPage.navigateToOrders();
    await page.waitForURL(/\/dashboard\/orders/);
    
    const ordersPage = new AdminOrdersPage(page);
    await ordersPage.expectOrdersTableVisible();
  });

  test('Admin can view and update order status in table view', async ({ page }) => {
    const ordersPage = new AdminOrdersPage(page);
    await ordersPage.goto();
    
    await ordersPage.expectOrdersTableVisible();
    
    // Check if there are orders to test with
    const orderRows = page.locator('[data-testid="order-row"]');
    const count = await orderRows.count();
    
    if (count > 0) {
      // Get first order number
      const firstOrderText = await orderRows.first().textContent() || '';
      const orderNumber = firstOrderText.match(/ORD-\d+/)?.[0] || 'ORD-2024-001';
      
      // Open order detail and update status
      await ordersPage.openOrderDetail(orderNumber);
      await ordersPage.updateOrderStatus('PROCESSING');
      await ordersPage.expectStatusUpdateSuccess();
      await ordersPage.closeOrderDetail();
    }
  });

  test('Admin can switch between table and kanban view', async ({ page }) => {
    const ordersPage = new AdminOrdersPage(page);
    await ordersPage.goto();
    
    // Default should be table view
    await ordersPage.expectOrdersTableVisible();
    
    // Switch to kanban
    await ordersPage.switchToKanbanView();
    await ordersPage.expectOrdersKanbanVisible();
    
    // Switch back to table
    await ordersPage.switchToTableView();
    await ordersPage.expectOrdersTableVisible();
  });

  test('Admin can filter orders by status', async ({ page }) => {
    const ordersPage = new AdminOrdersPage(page);
    await ordersPage.goto();
    
    await ordersPage.expectOrdersTableVisible();
    
    // Filter by pending status
    await ordersPage.filterByStatus('PENDING');
    await page.waitForTimeout(500);
    
    // Filter by shipped status
    await ordersPage.filterByStatus('SHIPPED');
    await page.waitForTimeout(500);
  });

  test('Admin can navigate to analytics page', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    await dashboardPage.navigateToAnalytics();
    await page.waitForURL(/\/dashboard\/analytics/);
    
    const analyticsPage = new AdminAnalyticsPage(page);
    await analyticsPage.expectAnalyticsPageVisible();
    await analyticsPage.expectSalesChartVisible();
    await analyticsPage.expectProductPerformanceTable();
  });

  test('Admin can change date range in analytics', async ({ page }) => {
    const analyticsPage = new AdminAnalyticsPage(page);
    await analyticsPage.goto();
    
    await analyticsPage.expectAnalyticsPageVisible();
    
    // Test different date ranges
    await analyticsPage.selectDateRange(dateRanges.last30d);
    await analyticsPage.expectLoadingSpinner();
    await analyticsPage.expectLoadingSpinnerHidden();
    
    await analyticsPage.selectDateRange(dateRanges.last90d);
    await analyticsPage.expectLoadingSpinner();
    await analyticsPage.expectLoadingSpinnerHidden();
  });

  test('Admin can navigate to reports page', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    await dashboardPage.navigateToReports();
    await page.waitForURL(/\/dashboard\/reports/);
    
    // Verify reports page loaded
    await expect(page.locator('[data-testid="reports-page"], .reports-page')).toBeVisible();
  });

  test('Admin can navigate to products management', async ({ page }) => {
    const dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.goto();
    
    await dashboardPage.navigateToProducts();
    await page.waitForURL(/\/dashboard\/products/);
    
    // Verify products page loaded
    await expect(page.locator('[data-testid="products-management"], .products-management')).toBeVisible();
  });

  test('Admin can search orders', async ({ page }) => {
    const ordersPage = new AdminOrdersPage(page);
    await ordersPage.goto();
    
    await ordersPage.expectOrdersTableVisible();
    await ordersPage.searchOrders('ORD-2024');
    await page.waitForTimeout(500);
  });
});