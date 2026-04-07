import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  async expectCartPageVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-page"], .cart-page')).toBeVisible();
  }

  async expectItemInCart(productName: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="cart-item"]:has-text("${productName}"), .cart-item:has-text("${productName}")`)).toBeVisible();
  }

  async expectCartItemCount(count: number): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-item"]')).toHaveCount(count);
  }

  async updateQuantity(itemIndex: number, quantity: number): Promise<void> {
    const input = this.page.locator('[data-testid="quantity-input"]').nth(itemIndex);
    await input.fill(quantity.toString());
    await input.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async clickIncreaseQuantity(itemIndex: number = 0): Promise<void> {
    await this.page.locator('[data-testid="increase-quantity"]').nth(itemIndex).click();
    await this.page.waitForTimeout(300);
  }

  async clickDecreaseQuantity(itemIndex: number = 0): Promise<void> {
    await this.page.locator('[data-testid="decrease-quantity"]').nth(itemIndex).click();
    await this.page.waitForTimeout(300);
  }

  async removeItem(itemIndex: number = 0): Promise<void> {
    await this.page.locator('[data-testid="remove-item-button"]').nth(itemIndex).click();
    await this.page.waitForTimeout(500);
  }

  async expectEmptyCart(): Promise<void> {
    await expect(this.page.locator('[data-testid="empty-cart-message"], text=Tu carrito está vacío, text=Your cart is empty')).toBeVisible();
  }

  async expectCartTotal(expectedTotal: string): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-total"], .cart-total')).toContainText(expectedTotal);
  }

  async clickProceedToCheckout(): Promise<void> {
    await this.page.click('[data-testid="checkout-button"], button:has-text("Proceder al checkout"), button:has-text("Checkout")');
    await this.page.waitForURL('/checkout');
  }

  async clickContinueShopping(): Promise<void> {
    await this.page.click('[data-testid="continue-shopping-button"], a[href="/products"]');
  }

  async expectSubtotal(productName: string, expectedSubtotal: string): Promise<void> {
    const itemRow = this.page.locator(`[data-testid="cart-item"]:has-text("${productName}")`);
    await expect(itemRow.locator('[data-testid="item-subtotal"], .item-subtotal')).toContainText(expectedSubtotal);
  }

  async applyCoupon(couponCode: string): Promise<void> {
    await this.page.fill('[data-testid="coupon-input"], input[name="coupon"]', couponCode);
    await this.page.click('[data-testid="apply-coupon-button"], button:has-text("Aplicar")');
    await this.page.waitForTimeout(500);
  }

  async expectCouponApplied(): Promise<void> {
    await expect(this.page.locator('[data-testid="coupon-applied-message"], text=Cupón aplicado')).toBeVisible();
  }

  async expectCouponError(): Promise<void> {
    await expect(this.page.locator('[data-testid="coupon-error-message"], text=Cupón inválido')).toBeVisible();
  }

  async clickUpdateCart(): Promise<void> {
    await this.page.click('[data-testid="update-cart-button"], button:has-text("Actualizar carrito")');
    await this.page.waitForTimeout(500);
  }

  async expectShippingEstimate(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-estimate"], .shipping-estimate')).toBeVisible();
  }
}