# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\stripe-integration.spec.ts >> Stripe Payment Integration >> Checkout calculates correct total with shipping
- Location: e2e\specs\stripe-integration.spec.ts:130:3

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
  114 |     await page.goto('/checkout');
  115 |     await page.waitForLoadState('networkidle');
  116 |     
  117 |     // Fill shipping info
  118 |     const checkoutPage = new CheckoutPage(page);
  119 |     await checkoutPage.clickNextStep();
  120 |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  121 |     await checkoutPage.clickNextStep();
  122 |     
  123 |     // Try payment with expired card
  124 |     await checkoutPage.completePayment(testCards.expired, '01/20', '123');
  125 |     
  126 |     // Verify error
  127 |     await checkoutPage.expectStayOnCheckout();
  128 |   });
  129 | 
  130 |   test('Checkout calculates correct total with shipping', async ({ page }) => {
  131 |     // Navigate to checkout with items in cart
  132 |     await page.goto('/products');
  133 |     await page.waitForLoadState('networkidle');
  134 |     
  135 |     // Add product to cart
  136 |     const productCard = page.locator('[data-testid="product-card"]:first-child');
> 137 |     await productCard.click();
      |                       ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  138 |     await page.waitForURL(/\/products\/.+/);
  139 |     await page.click('[data-testid="add-to-cart-button"]');
  140 |     await page.waitForTimeout(500);
  141 |     
  142 |     // Proceed to checkout
  143 |     await page.goto('/checkout');
  144 |     await page.waitForLoadState('networkidle');
  145 |     
  146 |     // Fill shipping info
  147 |     const checkoutPage = new CheckoutPage(page);
  148 |     await checkoutPage.clickNextStep();
  149 |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  150 |     await checkoutPage.clickNextStep();
  151 |     
  152 |     // Verify total is shown
  153 |     await expect(page.locator('[data-testid="total-amount"], .total-amount')).toBeVisible();
  154 |   });
  155 | });
```