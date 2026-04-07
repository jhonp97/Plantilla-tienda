import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { testUsers } from '../fixtures/test-data';

test.describe('Authentication', () => {
  test('User can login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await loginPage.expectLoginSuccess();
  });

  test('User cannot login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login('invalid@test.com', 'wrongpassword');
    await loginPage.expectLoginError();
  });

  test('Admin can access admin panel after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.admin.email, testUsers.admin.password);
    await loginPage.expectLoginSuccess();
    
    await dashboardPage.goto();
    await dashboardPage.expectDashboardLoaded();
  });

  test('Non-admin user cannot access admin panel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await loginPage.expectLoginSuccess();
    
    // Try to access admin dashboard
    await page.goto('/dashboard/dashboard');
    
    // Should either redirect to home or show access denied
    await expect(page).not.toHaveURL(/\/dashboard\/dashboard/);
  });

  test('Login page has forgot password link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.clickForgotPassword();
    // Forgot password page should load (could be modal or redirect)
    await page.waitForTimeout(500);
  });

  test('Login page has register link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.clickRegisterLink();
    await loginPage.expectRedirectToRegister();
  });

  test('Logged out user cannot access protected routes', async ({ page }) => {
    // Try to access orders page without login
    await page.goto('/orders');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Session persists on page refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login(testUsers.customer.email, testUsers.customer.password);
    await loginPage.expectLoginSuccess();
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).not.toHaveURL(/\/login/);
  });
});