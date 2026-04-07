import { Page, expect } from '@playwright/test';

export class AdminDashboardPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/dashboard/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async expectDashboardLoaded(): Promise<void> {
    await expect(this.page.locator('[data-testid="admin-dashboard"], .admin-dashboard')).toBeVisible();
  }

  async expectStatsCardsVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="stats-cards"], .stats-cards')).toBeVisible();
  }

  async expectSalesChartVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="sales-chart"], .sales-chart, [data-testid="chart"]')).toBeVisible();
  }

  async expectLowStockAlerts(): Promise<void> {
    await expect(this.page.locator('[data-testid="low-stock-alerts"], .low-stock-alerts')).toBeVisible();
  }

  async expectRecentOrdersVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="recent-orders"], .recent-orders')).toBeVisible();
  }

  async expectTotalRevenue(revenue: string): Promise<void> {
    await expect(this.page.locator('[data-testid="total-revenue"], .total-revenue')).toContainText(revenue);
  }

  async expectTotalOrders(orders: string | number): Promise<void> {
    const ordersStr = typeof orders === 'number' ? orders.toString() : orders;
    await expect(this.page.locator('[data-testid="total-orders"], .total-orders')).toContainText(ordersStr);
  }

  async expectTotalCustomers(customers: string | number): Promise<void> {
    const customersStr = typeof customers === 'number' ? customers.toString() : customers;
    await expect(this.page.locator('[data-testid="total-customers"], .total-customers')).toContainText(customersStr);
  }

  async navigateToOrders(): Promise<void> {
    await this.page.click('[data-testid="orders-menu"], a[href*="/dashboard/orders"]');
    await this.page.waitForURL(/\/dashboard\/orders/);
  }

  async navigateToProducts(): Promise<void> {
    await this.page.click('[data-testid="products-menu"], a[href*="/dashboard/products"]');
    await this.page.waitForURL(/\/dashboard\/products/);
  }

  async navigateToAnalytics(): Promise<void> {
    await this.page.click('[data-testid="analytics-menu"], a[href*="/dashboard/analytics"]');
    await this.page.waitForURL(/\/dashboard\/analytics/);
  }

  async navigateToReports(): Promise<void> {
    await this.page.click('[data-testid="reports-menu"], a[href*="/dashboard/reports"]');
    await this.page.waitForURL(/\/dashboard\/reports/);
  }

  async clickRefreshData(): Promise<void> {
    await this.page.click('[data-testid="refresh-data-button"]');
    await this.page.waitForTimeout(1000);
  }

  async selectDateRange(range: string): Promise<void> {
    await this.page.click(`[data-testid="date-range-${range}"]`);
    await this.page.waitForTimeout(500);
  }

  async expectLoadingSpinner(): Promise<void> {
    await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).toBeVisible();
  }

  async expectLoadingSpinnerHidden(): Promise<void> {
    await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).not.toBeVisible();
  }
}