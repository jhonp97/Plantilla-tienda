# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\edge-cases.spec.ts >> Edge Cases and Error Handling >> Non-existent product page handles gracefully
- Location: e2e\specs\edge-cases.spec.ts:202:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
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
  125 |     await page.click('[data-testid="add-to-cart-button"]');
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
> 211 |     expect(has404 || hasRedirect).toBe(true);
      |                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  212 |   });
  213 | });
```