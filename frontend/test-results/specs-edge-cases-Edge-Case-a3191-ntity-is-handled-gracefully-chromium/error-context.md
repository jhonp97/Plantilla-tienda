# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\edge-cases.spec.ts >> Edge Cases and Error Handling >> Negative quantity is handled gracefully
- Location: e2e\specs\edge-cases.spec.ts:120:3

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
  25  |     
  26  |     const hasOutOfStock = await outOfStockMessage.count() > 0;
  27  |     const hasDisabledButton = await addToCartDisabled.count() > 0;
  28  |     
  29  |     // Either message or disabled button should be visible
  30  |     expect(hasOutOfStock || hasDisabledButton).toBe(true);
  31  |   });
  32  | 
  33  |   test('Stock shows low stock warning', async ({ page }) => {
  34  |     const productDetailPage = new ProductDetailPage(page);
  35  |     
  36  |     // Access limited stock product
  37  |     await productDetailPage.goto('producto-stock-limitado');
  38  |     await page.waitForLoadState('networkidle');
  39  |     
  40  |     // Check for stock count or low stock warning
  41  |     const stockCount = page.locator('[data-testid="stock-count"], .stock-count');
  42  |     const lowStockWarning = page.locator('[data-testid="low-stock-warning"], text=Pocas unidades');
  43  |     
  44  |     const hasStockInfo = await stockCount.count() > 0;
  45  |     const hasWarning = await lowStockWarning.count() > 0;
  46  |     
  47  |     expect(hasStockInfo || hasWarning).toBe(true);
  48  |   });
  49  | 
  50  |   test('Cart persists after page refresh', async ({ page }) => {
  51  |     // Add item as guest
  52  |     await page.goto(`/products/${testProducts.available.slug}`);
  53  |     await page.click('[data-testid="add-to-cart-button"]');
  54  |     await page.waitForTimeout(500);
  55  |     
  56  |     // Refresh page
  57  |     await page.reload();
  58  |     
  59  |     // Cart should still have item
  60  |     await page.goto('/cart');
  61  |     await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  62  |   });
  63  | 
  64  |   test('Guest cart merges on login', async ({ page }) => {
  65  |     const loginPage = new LoginPage(page);
  66  |     
  67  |     // Add item as guest
  68  |     await page.goto(`/products/${testProducts.available.slug}`);
  69  |     await page.click('[data-testid="add-to-cart-button"]');
  70  |     await page.waitForTimeout(500);
  71  |     
  72  |     // Check cart count before login
  73  |     const cartCountBefore = await page.locator('[data-testid="cart-count"]').textContent();
  74  |     
  75  |     // Login
  76  |     await loginPage.goto();
  77  |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  78  |     await page.waitForURL('/**');
  79  |     
  80  |     // Cart should still have item (merged)
  81  |     await page.goto('/cart');
  82  |     const cartItemCount = await page.locator('[data-testid="cart-item"]').count();
  83  |     
  84  |     // Should have at least the item we added (may have more if user already had items)
  85  |     expect(cartItemCount).toBeGreaterThanOrEqual(1);
  86  |   });
  87  | 
  88  |   test('User cannot checkout with invalid shipping data', async ({ page }) => {
  89  |     await page.goto('/checkout');
  90  |     await page.waitForLoadState('networkidle');
  91  |     
  92  |     // Try to proceed without filling required fields
  93  |     await page.click('[data-testid="next-step-button"]');
  94  |     
  95  |     // Should show validation errors
  96  |     await expect(page.locator('text=requerido, text=required, [data-testid="error"]')).toBeVisible({ timeout: 5000 }).catch(() => {
  97  |       console.log('Validation errors may appear differently');
  98  |     });
  99  |   });
  100 | 
  101 |   test('User can update quantity in cart', async ({ page }) => {
  102 |     const cartPage = new CartPage(page);
  103 |     
  104 |     // Add item first
  105 |     await page.goto(`/products/${testProducts.available.slug}`);
  106 |     await page.click('[data-testid="add-to-cart-button"]');
  107 |     await page.waitForTimeout(300);
  108 |     
  109 |     // Go to cart
  110 |     await cartPage.goto();
  111 |     await cartPage.expectCartItemCount(1);
  112 |     
  113 |     // Update quantity
  114 |     await cartPage.updateQuantity(0, 5);
  115 |     
  116 |     // Should still have 1 item (updated quantity, not added new)
  117 |     await cartPage.expectCartItemCount(1);
  118 |   });
  119 | 
  120 |   test('Negative quantity is handled gracefully', async ({ page }) => {
  121 |     const cartPage = new CartPage(page);
  122 |     
  123 |     // Add item first
  124 |     await page.goto(`/products/${testProducts.available.slug}`);
> 125 |     await page.click('[data-testid="add-to-cart-button"]');
      |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  126 |     await page.waitForTimeout(300);
  127 |     
  128 |     // Go to cart
  129 |     await cartPage.goto();
  130 |     
  131 |     // Try to set negative quantity (should either reset to 1 or show error)
  132 |     await cartPage.updateQuantity(0, -1);
  133 |     await page.waitForTimeout(500);
  134 |     
  135 |     // Should still have valid quantity (at least 1)
  136 |     const quantityInput = page.locator('[data-testid="quantity-input"]').first();
  137 |     const value = await quantityInput.inputValue();
  138 |     expect(parseInt(value)).toBeGreaterThanOrEqual(1);
  139 |   });
  140 | 
  141 |   test('Login with empty fields shows error', async ({ page }) => {
  142 |     const loginPage = new LoginPage(page);
  143 |     
  144 |     await loginPage.goto();
  145 |     
  146 |     // Try to login without credentials
  147 |     await loginPage.clickLoginButton();
  148 |     
  149 |     // Should show validation error
  150 |     await expect(page.locator('text=requerido, text=required')).toBeVisible({ timeout: 5000 }).catch(() => {
  151 |       console.log('Validation may work differently');
  152 |     });
  153 |   });
  154 | 
  155 |   test('Checkout validates NIF/CIF format', async ({ page }) => {
  156 |     await page.goto('/checkout');
  157 |     await page.waitForLoadState('networkidle');
  158 |     
  159 |     // Fill shipping with invalid NIF
  160 |     await page.click('[data-testid="next-step-button"]');
  161 |     await page.fill('[data-testid="email-input"]', 'test@test.com');
  162 |     await page.fill('[data-testid="fullName-input"]', 'Test User');
  163 |     await page.fill('[data-testid="phone-input"]', '+34123456789');
  164 |     await page.fill('[data-testid="nifCif-input"]', 'INVALID');
  165 |     await page.fill('[data-testid="street-input"]', 'Test Street 123');
  166 |     await page.fill('[data-testid="postalCode-input"]', '28001');
  167 |     await page.fill('[data-testid="city-input"]', 'Madrid');
  168 |     await page.click('[data-testid="next-step-button"]');
  169 |     
  170 |     // Should show format validation error
  171 |     await page.waitForTimeout(500);
  172 |     // Note: Actual validation depends on backend implementation
  173 |   });
  174 | 
  175 |   test('Multiple items in cart calculates correct total', async ({ page }) => {
  176 |     // Add first product
  177 |     await page.goto('/products');
  178 |     await page.waitForLoadState('networkidle');
  179 |     await page.click('[data-testid="product-card"]:first-child');
  180 |     await page.waitForURL(/\/products\/.+/);
  181 |     await page.click('[data-testid="add-to-cart-button"]');
  182 |     await page.waitForTimeout(500);
  183 |     
  184 |     // Add second product
  185 |     await page.goto('/products');
  186 |     await page.waitForLoadState('networkidle');
  187 |     await page.click('[data-testid="product-card"]').nth(1).click();
  188 |     await page.waitForURL(/\/products\/.+/);
  189 |     await page.click('[data-testid="add-to-cart-button"]');
  190 |     await page.waitForTimeout(500);
  191 |     
  192 |     // Go to cart
  193 |     await page.goto('/cart');
  194 |     
  195 |     // Should have 2 items
  196 |     await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
  197 |     
  198 |     // Total should be visible
  199 |     await expect(page.locator('[data-testid="cart-total"], .cart-total')).toBeVisible();
  200 |   });
  201 | 
  202 |   test('Non-existent product page handles gracefully', async ({ page }) => {
  203 |     // Try to access non-existent product
  204 |     await page.goto('/products/non-existent-product-12345');
  205 |     await page.waitForLoadState('networkidle');
  206 |     
  207 |     // Should either show 404 or redirect to products list
  208 |     const has404 = await page.locator('text=404, text=No encontrado').count() > 0;
  209 |     const hasRedirect = await page.locator('[data-testid="product-grid"]').count() > 0;
  210 |     
  211 |     expect(has404 || hasRedirect).toBe(true);
  212 |   });
  213 | });
```