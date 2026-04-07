import { Page, expect } from '@playwright/test';

export class OrderHistoryPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/orders');
    await this.page.waitForLoadState('networkidle');
  }

  async expectOrdersListVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="orders-list"], .orders-list')).toBeVisible();
  }

  async expectOrderItem(orderNumber: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}"), .order-item:has-text("${orderNumber}")`)).toBeVisible();
  }

  async clickOrderItem(orderNumber: string): Promise<void> {
    await this.page.click(`[data-testid="order-item"]:has-text("${orderNumber}")`);
    await this.page.waitForURL(/\/orders\/.+/);
  }

  async expectOrderCount(count: number): Promise<void> {
    await expect(this.page.locator('[data-testid="order-item"]')).toHaveCount(count);
  }

  async expectEmptyOrdersMessage(): Promise<void> {
    await expect(this.page.locator('[data-testid="empty-orders-message"], text=No tienes pedidos, text=No orders yet')).toBeVisible();
  }

  async expectOrderStatus(orderNumber: string, status: string): Promise<void> {
    const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
    await expect(orderItem.locator(`[data-testid="order-status"], .order-status:has-text("${status}")`)).toBeVisible();
  }

  async expectOrderDate(orderNumber: string, date: string): Promise<void> {
    const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
    await expect(orderItem.locator('[data-testid="order-date"], .order-date')).toContainText(date);
  }

  async expectOrderTotal(orderNumber: string, total: string): Promise<void> {
    const orderItem = this.page.locator(`[data-testid="order-item"]:has-text("${orderNumber}")`);
    await expect(orderItem.locator('[data-testid="order-total"], .order-total')).toContainText(total);
  }

  async filterOrdersByStatus(status: string): Promise<void> {
    await this.page.selectOption('[data-testid="status-filter"], select[name="status"]', status);
    await this.page.waitForTimeout(500);
  }

  async searchOrders(query: string): Promise<void> {
    await this.page.fill('[data-testid="search-orders-input"], input[name="search"]', query);
    await this.page.press('[data-testid="search-orders-input"]', 'Enter');
    await this.page.waitForTimeout(500);
  }

  async clickViewOrderDetails(orderNumber: string): Promise<void> {
    await this.page.click(`[data-testid="order-item"]:has-text("${orderNumber}") [data-testid="view-details-button"]`);
    await this.page.waitForURL(/\/orders\/.+/);
  }

  async expectPaginationVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="pagination"], .pagination')).toBeVisible();
  }
}