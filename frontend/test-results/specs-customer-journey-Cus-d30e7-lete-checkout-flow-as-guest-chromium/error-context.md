# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\customer-journey.spec.ts >> Customer Complete Journey >> Guest can complete checkout flow as guest
- Location: e2e\specs\customer-journey.spec.ts:36:3

# Error details

```
TimeoutError: locator.textContent: Timeout 10000ms exceeded.
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
  2   | import { LoginPage } from '../pages/LoginPage';
  3   | import { ProductListPage } from '../pages/ProductListPage';
  4   | import { ProductDetailPage } from '../pages/ProductDetailPage';
  5   | import { CartPage } from '../pages/CartPage';
  6   | import { CheckoutPage } from '../pages/CheckoutPage';
  7   | import { OrderHistoryPage } from '../pages/OrderHistoryPage';
  8   | import { testUsers, testProducts, testShippingInfo, testCards } from '../fixtures/test-data';
  9   | 
  10  | test.describe('Customer Complete Journey', () => {
  11  |   test('Guest can browse products and view details', async ({ page }) => {
  12  |     const productListPage = new ProductListPage(page);
  13  |     
  14  |     // 1. Browse products
  15  |     await productListPage.goto();
  16  |     await productListPage.expectProductGridVisible();
  17  |     
  18  |     // 2. Click on first product to view details
  19  |     await productListPage.clickFirstProduct();
  20  |     await page.waitForURL(/\/products\/.+/);
  21  |     
  22  |     const productDetailPage = new ProductDetailPage(page);
  23  |     await productDetailPage.expectProductVisible();
  24  |     await productDetailPage.expectAddToCartButton();
  25  |   });
  26  | 
  27  |   test('Guest can add product to cart', async ({ page }) => {
  28  |     const productDetailPage = new ProductDetailPage(page);
  29  |     
  30  |     await productDetailPage.goto(testProducts.available.slug);
  31  |     await productDetailPage.expectAddToCartButton();
  32  |     await productDetailPage.clickAddToCart();
  33  |     await productDetailPage.expectSuccessMessage();
  34  |   });
  35  | 
  36  |   test('Guest can complete checkout flow as guest', async ({ page }) => {
  37  |     // 1. Browse products
  38  |     await page.goto('/products');
  39  |     await page.waitForLoadState('networkidle');
  40  |     
  41  |     // 2. Click on first product
  42  |     const productCard = page.locator('[data-testid="product-card"]:first-child');
> 43  |     const productName = await productCard.textContent() || '';
      |                                           ^ TimeoutError: locator.textContent: Timeout 10000ms exceeded.
  44  |     await productCard.click();
  45  |     await page.waitForURL(/\/products\/.+/);
  46  |     
  47  |     // 3. Add to cart
  48  |     await page.click('[data-testid="add-to-cart-button"]');
  49  |     await page.waitForTimeout(500);
  50  |     
  51  |     // 4. Go to cart
  52  |     const cartPage = new CartPage(page);
  53  |     await cartPage.goto();
  54  |     await cartPage.expectCartPageVisible();
  55  |     await cartPage.expectItemInCart(productName.split('\n')[0]); // Get product name from first line
  56  |     
  57  |     // 5. Proceed to checkout
  58  |     await cartPage.clickProceedToCheckout();
  59  |     
  60  |     // 6. Fill shipping info
  61  |     const checkoutPage = new CheckoutPage(page);
  62  |     await checkoutPage.expectCheckoutPageVisible();
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
```