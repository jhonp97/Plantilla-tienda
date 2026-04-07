import { Page, expect, Frame } from '@playwright/test';

export interface ShippingInfo {
  email: string;
  fullName: string;
  phone: string;
  nifCif: string;
  street: string;
  postalCode: string;
  city: string;
}

export class CheckoutPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
    await this.page.waitForLoadState('networkidle');
  }

  async expectCheckoutPageVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="checkout-page"], .checkout-page')).toBeVisible();
  }

  async expectCartSummaryVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="cart-summary"], .cart-summary')).toBeVisible();
  }

  async clickNextStep(): Promise<void> {
    await this.page.click('[data-testid="next-step-button"], button:has-text("Siguiente"), button:has-text("Next")');
    await this.page.waitForTimeout(500);
  }

  async fillShippingInfo(data: ShippingInfo): Promise<void> {
    // Fill the address form fields
    await this.page.fill('#firstName', data.fullName.split(' ')[0] || data.fullName);
    await this.page.fill('#lastName', data.fullName.split(' ').slice(1).join(' ') || data.fullName);
    await this.page.fill('#address1', data.street);
    await this.page.fill('#postalCode', data.postalCode);
    await this.page.fill('#city', data.city);
    await this.page.fill('#state', data.city); // Using city as state for test
    await this.page.fill('#phone', data.phone);
    await this.page.selectOption('#country', 'ES');
  }

  async expectShippingFormVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="shipping-form"], .shipping-form')).toBeVisible();
  }

  async clickPreviousStep(): Promise<void> {
    await this.page.click('[data-testid="previous-step-button"], button:has-text("Anterior"), button:has-text("Back")');
    await this.page.waitForTimeout(500);
  }

  async expectPaymentFormVisible(): Promise<void> {
    await expect(this.page.locator('[data-testid="payment-form"], .payment-form')).toBeVisible();
  }

  async fillCardDetails(cardNumber: string, expiry: string = '12/25', cvc: string = '123'): Promise<void> {
    try {
      // Try to fill in Stripe iframe
      const stripeFrame = this.page.frameLocator('[data-testid="stripe-iframe"], iframe[name^="__privateStripeFrame"]');
      await stripeFrame.locator('[name="cardnumber"]').fill(cardNumber);
      await stripeFrame.locator('[name="exp-date"]').fill(expiry);
      await stripeFrame.locator('[name="cvc"]').fill(cvc);
    } catch {
      // Fallback: fill directly
      await this.page.fill('[data-testid="card-number-input"], input[name="cardNumber"]', cardNumber);
      await this.page.fill('[data-testid="card-expiry-input"], input[name="cardExpiry"]', expiry);
      await this.page.fill('[data-testid="card-cvc-input"], input[name="cardCvc"]', cvc);
    }
  }

  async clickPayButton(): Promise<void> {
    await this.page.click('[data-testid="pay-button"], button:has-text("Pagar"), button:has-text("Pay")');
  }

  async completePayment(cardNumber: string = '4242424242424242', expiry: string = '12/25', cvc: string = '123'): Promise<void> {
    await this.fillCardDetails(cardNumber, expiry, cvc);
    await this.clickPayButton();
  }

  async expectOrderSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout\/success/, { timeout: 15000 });
    await expect(this.page.locator('[data-testid="order-success-message"], text=¡Pedido completado!')).toBeVisible();
  }

  async expectOrderNumber(): Promise<void> {
    await expect(this.page.locator('[data-testid="order-number"], .order-number')).toBeVisible();
  }

  async expectPaymentError(errorMessage: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="payment-error-message"], text=${errorMessage}`)).toBeVisible();
  }

  async expectStayOnCheckout(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout/);
  }

  async clickGoToOrders(): Promise<void> {
    await this.page.click('[data-testid="go-to-orders-button"], a[href="/orders"]');
  }

  async clickContinueShopping(): Promise<void> {
    await this.page.click('[data-testid="continue-shopping-button"], a[href="/products"]');
  }

  async expectTotalAmount(expectedAmount: string): Promise<void> {
    await expect(this.page.locator('[data-testid="total-amount"], .total-amount')).toContainText(expectedAmount);
  }

  async selectShippingMethod(method: string): Promise<void> {
    await this.page.click(`[data-testid="shipping-method"]:has-text("${method}")`);
    await this.page.waitForTimeout(300);
  }

  async expectShippingMethodSelected(method: string): Promise<void> {
    await expect(this.page.locator(`[data-testid="shipping-method"].selected:has-text("${method}")`)).toBeVisible();
  }

  async clickEditCart(): Promise<void> {
    await this.page.click('[data-testid="edit-cart-button"], a[href="/cart"]');
  }
}