# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\customer-journey.spec.ts >> Customer Complete Journey >> User can apply coupon code
- Location: e2e\specs\customer-journey.spec.ts:158:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="add-to-cart-button"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e5]
  - heading "Producto no encontrado" [level=2] [ref=e7]
  - paragraph [ref=e8]: Internal Server Error
  - link "Volver al catálogo" [ref=e9] [cursor=pointer]:
    - /url: /products
```

# Test source

```ts
  63  |     await checkoutPage.clickNextStep();
  64  |     await checkoutPage.fillShippingInfo(testShippingInfo.valid);
  65  |     await checkoutPage.clickNextStep();
  66  |     
  67  |     // 7. Complete payment with test card
  68  |     await checkoutPage.completePayment(testCards.valid);
  69  |     await checkoutPage.expectOrderSuccess();
  70  |     await checkoutPage.expectOrderNumber();
  71  |   });
  72  | 
  73  |   test('Logged user can view order history', async ({ page }) => {
  74  |     const loginPage = new LoginPage(page);
  75  |     
  76  |     // Login as customer
  77  |     await loginPage.goto();
  78  |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  79  |     await loginPage.expectLoginSuccess();
  80  |     
  81  |     // View orders
  82  |     const orderHistoryPage = new OrderHistoryPage(page);
  83  |     await orderHistoryPage.goto();
  84  |     await orderHistoryPage.expectOrdersListVisible();
  85  |   });
  86  | 
  87  |   test('Logged user can view order details', async ({ page }) => {
  88  |     const loginPage = new LoginPage(page);
  89  |     
  90  |     // Login as customer
  91  |     await loginPage.goto();
  92  |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  93  |     await loginPage.expectLoginSuccess();
  94  |     
  95  |     // View order details
  96  |     const orderHistoryPage = new OrderHistoryPage(page);
  97  |     await orderHistoryPage.goto();
  98  |     
  99  |     // Check if there are any orders - if not, test is skipped
  100 |     const orderItems = page.locator('[data-testid="order-item"]');
  101 |     const count = await orderItems.count();
  102 |     
  103 |     if (count > 0) {
  104 |       await orderHistoryPage.clickOrderItem(await orderItems.first().textContent() || '');
  105 |       await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
  106 |     } else {
  107 |       await orderHistoryPage.expectEmptyOrdersMessage();
  108 |     }
  109 |   });
  110 | 
  111 |   test('Cart persists items after adding', async ({ page }) => {
  112 |     const productDetailPage = new ProductDetailPage(page);
  113 |     const cartPage = new CartPage(page);
  114 |     
  115 |     // Add product to cart
  116 |     await productDetailPage.goto(testProducts.available.slug);
  117 |     await productDetailPage.clickAddToCart();
  118 |     
  119 |     // Go to cart
  120 |     await cartPage.goto();
  121 |     await cartPage.expectCartPageVisible();
  122 |     await cartPage.expectCartItemCount(1);
  123 |   });
  124 | 
  125 |   test('User can update cart item quantity', async ({ page }) => {
  126 |     const cartPage = new CartPage(page);
  127 |     
  128 |     // Add item first
  129 |     await page.goto(`/products/${testProducts.available.slug}`);
  130 |     await page.click('[data-testid="add-to-cart-button"]');
  131 |     await page.waitForTimeout(300);
  132 |     
  133 |     // Go to cart
  134 |     await cartPage.goto();
  135 |     
  136 |     // Update quantity
  137 |     await cartPage.updateQuantity(0, 3);
  138 |     await cartPage.expectCartItemCount(1);
  139 |   });
  140 | 
  141 |   test('User can remove item from cart', async ({ page }) => {
  142 |     const cartPage = new CartPage(page);
  143 |     
  144 |     // Add item first
  145 |     await page.goto(`/products/${testProducts.available.slug}`);
  146 |     await page.click('[data-testid="add-to-cart-button"]');
  147 |     await page.waitForTimeout(300);
  148 |     
  149 |     // Go to cart
  150 |     await cartPage.goto();
  151 |     await cartPage.expectCartItemCount(1);
  152 |     
  153 |     // Remove item
  154 |     await cartPage.removeItem(0);
  155 |     await cartPage.expectEmptyCart();
  156 |   });
  157 | 
  158 |   test('User can apply coupon code', async ({ page }) => {
  159 |     const cartPage = new CartPage(page);
  160 |     
  161 |     // Add item first
  162 |     await page.goto(`/products/${testProducts.available.slug}`);
> 163 |     await page.click('[data-testid="add-to-cart-button"]');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  164 |     await page.waitForTimeout(300);
  165 |     
  166 |     // Go to cart
  167 |     await cartPage.goto();
  168 |     
  169 |     // Apply coupon
  170 |     await cartPage.applyCoupon('TEST10');
  171 |     // Note: This test expects either success or failure - actual behavior depends on backend
  172 |     await page.waitForTimeout(500);
  173 |   });
  174 | });
```