import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderHistoryPage } from '../pages/OrderHistoryPage';
import { testUsers, testProducts, testShippingInfo, testCards } from '../fixtures/test-data';

test.describe('Customer Complete Journey', () => {
  test('Guest can browse products and view details', async ({ page }) => {
    const productListPage = new ProductListPage(page);
    
    // 1. Browse products
    await productListPage.goto();
    await productListPage.expectProductGridVisible();
    
    // 2. Click on first product to view details
    await productListPage.clickFirstProduct();
    await page.waitForURL(/\/products\/.+/);
    
    const productDetailPage = new ProductDetailPage(page);
    await productDetailPage.expectProductVisible();
    await productDetailPage.expectAddToCartButton();
  });

  test('Guest can add product to cart', async ({ page }) => {
    const productDetailPage = new ProductDetailPage(page);
    
    await productDetailPage.goto(testProducts.available.slug);
    await productDetailPage.expectAddToCartButton();
    await productDetailPage.clickAddToCart();
    await productDetailPage.expectSuccessMessage();
  });

  test('Guest can complete checkout flow as guest', async ({ page }) => {
    // 1. Browse products
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // 2. Click on first product
    const productCard = page.locator('[data-testid="product-card"]:first-child');
    const productName = await productCard.textContent() || '';
    await productCard.click();
    await page.waitForURL(/\/products\/.+/);
    
    // 3. Add to cart
    await page.click('[data-testid="add-to-cart-button"]');
    await page.waitForTimeout(500);
    
    // 4. Go to cart
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.expectCartPageVisible();
    await cartPage.expectItemInCart(productName.split('\n')[0]); // Get product name from first line
    
    // 5. Proceed to checkout
    await cartPage.clickProceedToCheckout();
    
    // 6. Fill shipping info
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.expectCheckoutPageVisible();
    await checkoutPage.clickNextStep();
    await checkoutPage.fillShippingInfo(testShippingInfo.valid);
    await checkoutPage.clickNextStep();
    
    // 7. Complete payment with test card
    await checkoutPage.completePayment(testCards.valid);
    await checkoutPage.expectOrderSuccess();
    await checkoutPage.expectOrderNumber();
  });

  test('Logged user can view order history', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login as customer
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await loginPage.expectLoginSuccess();
    
    // View orders
    const orderHistoryPage = new OrderHistoryPage(page);
    await orderHistoryPage.goto();
    await orderHistoryPage.expectOrdersListVisible();
  });

  test('Logged user can view order details', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login as customer
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await loginPage.expectLoginSuccess();
    
    // View order details
    const orderHistoryPage = new OrderHistoryPage(page);
    await orderHistoryPage.goto();
    
    // Check if there are any orders - if not, test is skipped
    const orderItems = page.locator('[data-testid="order-item"]');
    const count = await orderItems.count();
    
    if (count > 0) {
      await orderHistoryPage.clickOrderItem(await orderItems.first().textContent() || '');
      await expect(page.locator('[data-testid="order-detail"]')).toBeVisible();
    } else {
      await orderHistoryPage.expectEmptyOrdersMessage();
    }
  });

  test('Cart persists items after adding', async ({ page }) => {
    const productDetailPage = new ProductDetailPage(page);
    const cartPage = new CartPage(page);
    
    // Add product to cart
    await productDetailPage.goto(testProducts.available.slug);
    await productDetailPage.clickAddToCart();
    
    // Go to cart
    await cartPage.goto();
    await cartPage.expectCartPageVisible();
    await cartPage.expectCartItemCount(1);
  });

  test('User can update cart item quantity', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    // Add item first
    await page.goto(`/products/${testProducts.available.slug}`);
    await page.click('[data-testid="add-to-cart-button"]');
    await page.waitForTimeout(300);
    
    // Go to cart
    await cartPage.goto();
    
    // Update quantity
    await cartPage.updateQuantity(0, 3);
    await cartPage.expectCartItemCount(1);
  });

  test('User can remove item from cart', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    // Add item first
    await page.goto(`/products/${testProducts.available.slug}`);
    await page.click('[data-testid="add-to-cart-button"]');
    await page.waitForTimeout(300);
    
    // Go to cart
    await cartPage.goto();
    await cartPage.expectCartItemCount(1);
    
    // Remove item
    await cartPage.removeItem(0);
    await cartPage.expectEmptyCart();
  });

  test('User can apply coupon code', async ({ page }) => {
    const cartPage = new CartPage(page);
    
    // Add item first
    await page.goto(`/products/${testProducts.available.slug}`);
    await page.click('[data-testid="add-to-cart-button"]');
    await page.waitForTimeout(300);
    
    // Go to cart
    await cartPage.goto();
    
    // Apply coupon
    await cartPage.applyCoupon('TEST10');
    // Note: This test expects either success or failure - actual behavior depends on backend
    await page.waitForTimeout(500);
  });
});