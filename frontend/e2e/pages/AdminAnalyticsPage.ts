import { Page, expect } from '@playwright/test';

export class AdminAnalyticsPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/dashboard/analytics');
    await this.page.waitForLoadState('networkidle');
  }

  async expectAnalyticsPageVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="analytics-page"], .analytics-page')).toBeVisible();
  }

  async expectSalesChartVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="sales-chart"], .sales-chart')).toBeVisible();
  }

  async expectProductPerformanceTable(): Promise<void> {
    await expect(this.page.locator('[data-testid="product-performance-table"], .product-performance-table')).toBeVisible();
  }

  async expectTopProducts(): Promise<void> {
    await expect(this.page.locator('[data-testid="top-products"], .top-products')).toBeVisible();
  }

  async expectRevenueChart(): Promise<void> {
    await expect(this.page.locator('[data-testid="revenue-chart"], .revenue-chart')).toBeVisible();
  }

  async expectOrdersChart(): Promise<void> {
    await expect(this.page.locator('[data-testid="orders-chart"], .orders-chart')).toBeVisible();
  }

  async selectDateRange(range: string): Promise<void> {
    await this.page.click(`[data-testid="date-range-${range}"]`);
    await this.page.waitForTimeout(1000);
  }

  async expectLoadingSpinner(): Promise<void> {
    await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).toBeVisible();
  }

  async expectLoadingSpinnerHidden(): Promise<void> {
    await expect(this.page.locator('[data-testid="loading-spinner"], .loading-spinner')).not.toBeVisible();
  }

  async expectRevenueValue(revenue: string): Promise<void> {
    await expect(this.page.locator('[data-testid="revenue-value"], .revenue-value')).toContainText(revenue);
  }

  async expectOrdersValue(orders: string | number): Promise<void> {
    const ordersStr = typeof orders === 'number' ? orders.toString() : orders;
    await expect(this.page.locator('[data-testid="orders-value"], .orders-value')).toContainText(ordersStr);
  }

  async expectAverageOrderValue(value: string): Promise<void> {
    await expect(this.page.locator('[data-testid="average-order-value"], .average-order-value')).toContainText(value);
  }

  async expectConversionRate(rate: string): Promise<void> {
    await expect(this.page.locator('[data-testid="conversion-rate"], .conversion-rate')).toContainText(rate);
  }

  async clickExportReport(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('[data-testid="export-report-button"], button:has-text("Exportar informe")'),
    ]);
    return download;
  }

  async selectCustomDateRange(startDate: string, endDate: string): Promise<void> {
    await this.page.fill('[data-testid="start-date"], input[name="startDate"]', startDate);
    await this.page.fill('[data-testid="end-date"], input[name="endDate"]', endDate);
    await this.page.click('[data-testid="apply-date-range-button"]');
    await this.page.waitForTimeout(1000);
  }

  async expectProductRow(productName: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="product-row"]:has-text("${productName}")`)).toBeVisible();
  }

  async sortByColumn(column: string, order: 'asc' | 'desc' = 'asc'): Promise<void> {
    await this.page.click(`[data-testid="sort-${column}"]`);
    if (order === 'desc') {
      await this.page.click(`[data-testid="sort-${column}"]`);
    }
    await this.page.waitForTimeout(500);
  }

  async filterByCategory(category: string): Promise<void> {
    await this.page.selectOption('[data-testid="category-filter"], select[name="category"]', category);
    await this.page.waitForTimeout(500);
  }
}