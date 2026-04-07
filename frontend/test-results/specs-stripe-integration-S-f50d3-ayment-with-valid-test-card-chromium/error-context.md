# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\stripe-integration.spec.ts >> Stripe Payment Integration >> Successful payment with valid test card
- Location: e2e\specs\stripe-integration.spec.ts:6:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="product-card"]:first-child')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e5]
  - heading "Error" [level=2] [ref=e7]
  - paragraph [ref=e8]: Internal Server Error
  - button "Reintentar" [ref=e9] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { CheckoutPage } from '../pages/CheckoutPage';
  3   | import { testShippingInfo, testCards } from '../fixtures/test-data';
  4   | 
  5   | test.describe('Stripe Payment Integration', () => {
  6   |   test('Successful payment with valid test card', async ({ page }) => {
  7   |     // Navigate to checkout with items in cart
  8   |     await page.goto('/products');
  9   |     await page.waitForLoadState('networkidle');
  10  |     
  11  |     // Add product to cart
  12  |     const productCard = page.locator('[data-testid="product-card"]:first-child');
> 13  |     await productCard.click();
      |                       ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  14  |     await page.waitForURL(/\/products\/.+/);
  15  |     await page.click('[data-testid="add-to-cart-button"]');
  16  |     await page.waitForTimeout(500);
  17  |     
  18  |     // Proceed to checkout
  19  |     await page.goto('/checkout');
  20  |     await page.waitForLoadState('networkidle');
  21  |     
  22  |     // Fill shipping info
  23  |     const checkoutPage = new CheckoutPage(page);
  24  |     await checkoutPage.clickNextStep();
  25  |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  26  |     await checkoutPage.clickNextStep();
  27  |     
  28  |     // Complete payment with valid test card
  29  |     await checkoutPage.completePayment(testCards.valid);
  30  |     
  31  |     // Verify success
  32  |     await checkoutPage.expectOrderSuccess();
  33  |     await checkoutPage.expectOrderNumber();
  34  |   });
  35  | 
  36  |   test('Failed payment with declined card', async ({ page }) => {
  37  |     // Navigate to checkout with items in cart
  38  |     await page.goto('/products');
  39  |     await page.waitForLoadState('networkidle');
  40  |     
  41  |     // Add product to cart
  42  |     const productCard = page.locator('[data-testid="product-card"]:first-child');
  43  |     await productCard.click();
  44  |     await page.waitForURL(/\/products\/.+/);
  45  |     await page.click('[data-testid="add-to-cart-button"]');
  46  |     await page.waitForTimeout(500);
  47  |     
  48  |     // Proceed to checkout
  49  |     await page.goto('/checkout');
  50  |     await page.waitForLoadState('networkidle');
  51  |     
  52  |     // Fill shipping info
  53  |     const checkoutPage = new CheckoutPage(page);
  54  |     await checkoutPage.clickNextStep();
  55  |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  56  |     await checkoutPage.clickNextStep();
  57  |     
  58  |     // Try payment with declined card
  59  |     await checkoutPage.completePayment(testCards.declined);
  60  |     
  61  |     // Verify error - should stay on checkout page
  62  |     await checkoutPage.expectStayOnCheckout();
  63  |     await expect(page.locator('text=Tarjeta rechazada, text=Card declined, text=declined')).toBeVisible({ timeout: 10000 }).catch(() => {
  64  |       // Payment might fail in different ways - just ensure we're still on checkout
  65  |       console.log('Payment failed in unexpected way');
  66  |     });
  67  |   });
  68  | 
  69  |   test('Failed payment with insufficient funds', async ({ page }) => {
  70  |     // Navigate to checkout with items in cart
  71  |     await page.goto('/products');
  72  |     await page.waitForLoadState('networkidle');
  73  |     
  74  |     // Add product to cart
  75  |     const productCard = page.locator('[data-testid="product-card"]:first-child');
  76  |     await productCard.click();
  77  |     await page.waitForURL(/\/products\/.+/);
  78  |     await page.click('[data-testid="add-to-cart-button"]');
  79  |     await page.waitForTimeout(500);
  80  |     
  81  |     // Proceed to checkout
  82  |     await page.goto('/checkout');
  83  |     await page.waitForLoadState('networkidle');
  84  |     
  85  |     // Fill shipping info
  86  |     const checkoutPage = new CheckoutPage(page);
  87  |     await checkoutPage.clickNextStep();
  88  |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  89  |     await checkoutPage.clickNextStep();
  90  |     
  91  |     // Try payment with insufficient funds card
  92  |     await checkoutPage.completePayment(testCards.insufficientFunds);
  93  |     
  94  |     // Verify error - should stay on checkout page
  95  |     await checkoutPage.expectStayOnCheckout();
  96  |     await expect(page.locator('text=Fondos insuficientes, text=Insufficient funds, text=insufficient')).toBeVisible({ timeout: 10000 }).catch(() => {
  97  |       console.log('Payment failed in unexpected way');
  98  |     });
  99  |   });
  100 | 
  101 |   test('Payment fails with expired card', async ({ page }) => {
  102 |     // Navigate to checkout with items in cart
  103 |     await page.goto('/products');
  104 |     await page.waitForLoadState('networkidle');
  105 |     
  106 |     // Add product to cart
  107 |     const productCard = page.locator('[data-testid="product-card"]:first-child');
  108 |     await productCard.click();
  109 |     await page.waitForURL(/\/products\/.+/);
  110 |     await page.click('[data-testid="add-to-cart-button"]');
  111 |     await page.waitForTimeout(500);
  112 |     
  113 |     // Proceed to checkout
```