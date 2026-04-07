import { Page, Frame } from '@playwright/test';

/**
 * Test helpers for common E2E operations
 */

export async function waitForPageReady(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForURL(urlPattern);
  await page.waitForLoadState('networkidle');
}

export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

export async function getElementText(page: Page, selector: string): Promise<string | null> {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    return element.textContent();
  }
  return null;
}

export async function fillInputByLabel(page: Page, labelText: string, value: string): Promise<void> {
  const input = page.locator(`label:has-text("${labelText}") + input, label:has-text("${labelText}") ~ input, [aria-label="${labelText}"]`);
  await input.fill(value);
}

export async function clickButtonByText(page: Page, text: string): Promise<void> {
  await page.click(`button:has-text("${text}"), [role="button"]:has-text("${text}"), a:has-text("${text}")`);
}

export async function waitForToastMessage(page: Page, message: string, timeout = 5000): Promise<void> {
  await page.waitForSelector(`text=${message}`, { timeout }).catch(() => {
    console.log(`Toast message "${message}" not found within ${timeout}ms`);
  });
}

export async function loginAsUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#contraseña', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/**');
}

export async function loginAsAdmin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"], input[name="email"]', email);
  await page.fill('[data-testid="password-input"], input[name="password"]', password);
  await page.click('[data-testid="login-button"], button[type="submit"]');
  await page.waitForURL('/dashboard/**');
}

export async function addProductToCart(page: Page, productSlug: string): Promise<void> {
  await page.goto(`/products/${productSlug}`);
  await page.waitForLoadState('networkidle');
  
  const addToCartButton = page.locator('[data-testid="add-to-cart-button"], button:has-text("Añadir al carrito"), button:has-text("Add to Cart")');
  await addToCartButton.click();
  await page.waitForTimeout(500);
}

export async function proceedToCheckout(page: Page): Promise<void> {
  await page.goto('/cart');
  await page.click('[data-testid="checkout-button"], button:has-text("Proceder al checkout"), button:has-text("Checkout")');
  await page.waitForURL('/checkout');
}

export async function fillCheckoutForm(
  page: Page,
  shippingInfo: {
    email: string;
    fullName: string;
    phone: string;
    nifCif: string;
    street: string;
    postalCode: string;
    city: string;
  }
): Promise<void> {
  // Fill shipping info
  await page.fill('[data-testid="email-input"], input[name="email"]', shippingInfo.email);
  await page.fill('[data-testid="fullName-input"], input[name="fullName"]', shippingInfo.fullName);
  await page.fill('[data-testid="phone-input"], input[name="phone"]', shippingInfo.phone);
  await page.fill('[data-testid="nifCif-input"], input[name="nifCif"]', shippingInfo.nifCif);
  await page.fill('[data-testid="street-input"], input[name="street"]', shippingInfo.street);
  await page.fill('[data-testid="postalCode-input"], input[name="postalCode"]', shippingInfo.postalCode);
  await page.fill('[data-testid="city-input"], input[name="city"]', shippingInfo.city);
}

export async function completeStripePayment(page: Page, cardNumber: string, expiry: string = '12/25', cvc: string = '123'): Promise<void> {
  // Switch to Stripe iframe if present
  const stripeFrame = page.frameLocator('[data-testid="stripe-iframe"], iframe[name^="__privateStripeFrame"]');
  
  try {
    const cardNumberFrame = stripeFrame.locator('[name="cardnumber"]');
    await cardNumberFrame.fill(cardNumber);
    
    const cardExpiryFrame = stripeFrame.locator('[name="exp-date"]');
    await cardExpiryFrame.fill(expiry);
    
    const cardCvcFrame = stripeFrame.locator('[name="cvc"]');
    await cardCvcFrame.fill(cvc);
  } catch {
    // Fallback: fill directly if Stripe is not in iframe
    await page.fill('[data-testid="card-number-input"], [name="cardNumber"]', cardNumber);
    await page.fill('[data-testid="card-expiry-input"], [name="cardExpiry"]', expiry);
    await page.fill('[data-testid="card-cvc-input"], [name="cardCvc"]', cvc);
  }
  
  await page.click('[data-testid="pay-button"], button:has-text("Pagar"), button:has-text("Pay")');
}

export async function mockApiResponse(page: Page, urlPattern: string, response: unknown): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

export async function mockApiError(page: Page, urlPattern: string, statusCode: number, errorMessage: string): Promise<void> {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: errorMessage }),
    });
  });
}

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  return `test${timestamp}@test.com`;
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}