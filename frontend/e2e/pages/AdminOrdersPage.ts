import { Page, expect } from '@playwright/test';

export class AdminOrdersPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/dashboard/orders');
    await this.page.waitForLoadState('networkidle');
  }

  async expectOrdersTableVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="orders-table"], .orders-table')).toBeVisible();
  }

  async expectOrdersKanbanVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="orders-kanban"], .orders-kanban')).toBeVisible();
  }

  async openOrderDetail(orderNumber: string): Promise<void> {
    await this.page.click(`[data-testid="order-row"]:has-text("${orderNumber}"), [data-testid="order-card"]:has-text("${orderNumber}")`);
    await expect(this.page.locator('[data-testid="order-detail"], .order-detail')).toBeVisible();
  }

  async closeOrderDetail(): Promise<void> {
    await this.page.click('[data-testid="close-detail-button"], button:has-text("Cerrar")');
    await this.page.waitForTimeout(300);
  }

  async updateOrderStatus(orderNumber: string, newStatus: string): Promise<void> {
    await this.openOrderDetail(orderNumber);
    await this.page.click('[data-testid="status-dropdown"], select[name="status"]');
    await this.page.selectOption('[data-testid="status-dropdown"], select[name="status"]', newStatus);
    await this.page.click('[data-testid="save-status-button"], button:has-text("Guardar")');
  }

  async expectStatusUpdateSuccess(): Promise<void> {
    await expect(this.page.locator('[data-testid="success-message"], text=Estado actualizado')).toBeVisible();
  }

  async switchToKanbanView(): Promise<void> {
    await this.page.click('[data-testid="kanban-view-button"], button:has-text("Vista Kanban")');
    await this.page.waitForTimeout(500);
  }

  async switchToTableView(): Promise<void> {
    await this.page.click('[data-testid="table-view-button"], button:has-text("Vista de tabla")');
    await this.page.waitForTimeout(500);
  }

  async dragOrderToColumn(orderNumber: string, targetColumn: string): Promise<void> {
    const order = this.page.locator(`[data-testid="order-card"]:has-text("${orderNumber}")`);
    const dropZone = this.page.locator(`[data-testid="column-${targetColumn}"], [data-testid="${targetColumn.toLowerCase()}-column"]`);
    await order.dragTo(dropZone);
  }

  async expectOrderInColumn(orderNumber: string, column: string): Promise<void> {
    const columnLocator = this.page.locator(`[data-testid="${column.toLowerCase()}-column"]`);
    await expect(columnLocator.locator(`[data-testid="order-card"]:has-text("${orderNumber}")`)).toBeVisible();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.page.selectOption('[data-testid="status-filter"], select[name="status"]', status);
    await this.page.waitForTimeout(500);
  }

  async searchOrders(query: string): Promise<void> {
    await this.page.fill('[data-testid="search-orders-input"], input[name="search"]', query);
    await this.page.press('[data-testid="search-orders-input"]', 'Enter');
    await this.page.waitForTimeout(500);
  }

  async exportOrders(): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click('[data-testid="export-button"], button:has-text("Exportar")'),
    ]);
    return download;
  }

  async expectOrderCount(count: number): Promise<void> {
    await expect(this.page.locator('[data-testid="order-row"], [data-testid="order-card"]')).toHaveCount(count);
  }

  async clickProcessOrder(orderNumber: string): Promise<void> {
    await this.openOrderDetail(orderNumber);
    await this.page.click('[data-testid="process-order-button"], button:has-text("Procesar")');
  }

  async clickShipOrder(orderNumber: string): Promise<void> {
    await this.openOrderDetail(orderNumber);
    await this.page.click('[data-testid="ship-order-button"], button:has-text("Enviar")');
  }

  async clickCancelOrder(orderNumber: string): Promise<void> {
    await this.openOrderDetail(orderNumber);
    await this.page.click('[data-testid="cancel-order-button"], button:has-text("Cancelar")');
    await this.page.click('[data-testid="confirm-cancel-button"]');
  }
}