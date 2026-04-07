# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\auth.spec.ts >> Authentication >> Session persists on page refresh
- Location: e2e\specs\auth.spec.ts:74:3

# Error details

```
Error: expect(page).not.toHaveURL(expected) failed

Expected pattern: not /\/login/
Received string: "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "not toHaveURL" with timeout 5000ms
    8 × unexpected value "http://localhost:5173/login"

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Bienvenido" [level=1] [ref=e6]
    - paragraph [ref=e7]: Ingresa a tu cuenta para continuar
  - generic [ref=e8]:
    - generic [ref=e10]:
      - generic [ref=e11]: Email
      - textbox "Email" [ref=e12]:
        - /placeholder: tu@email.com
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Contraseña
        - textbox "Contraseña" [ref=e16]:
          - /placeholder: ••••••••
      - link "¿Olvidaste tu contraseña?" [ref=e17] [cursor=pointer]:
        - /url: /forgot-password
    - button "Entrar" [ref=e18] [cursor=pointer]
  - generic [ref=e20]: o
  - paragraph [ref=e21]:
    - text: ¿No tienes cuenta?
    - link "Crear cuenta" [ref=e22] [cursor=pointer]:
      - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { LoginPage } from '../pages/LoginPage';
  3  | import { AdminDashboardPage } from '../pages/AdminDashboardPage';
  4  | import { testUsers } from '../fixtures/test-data';
  5  | 
  6  | test.describe('Authentication', () => {
  7  |   test('User can login with valid credentials', async ({ page }) => {
  8  |     const loginPage = new LoginPage(page);
  9  |     
  10 |     await loginPage.goto();
  11 |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  12 |     await loginPage.expectLoginSuccess();
  13 |   });
  14 | 
  15 |   test('User cannot login with invalid credentials', async ({ page }) => {
  16 |     const loginPage = new LoginPage(page);
  17 |     
  18 |     await loginPage.goto();
  19 |     await loginPage.login('invalid@test.com', 'wrongpassword');
  20 |     await loginPage.expectLoginError();
  21 |   });
  22 | 
  23 |   test('Admin can access admin panel after login', async ({ page }) => {
  24 |     const loginPage = new LoginPage(page);
  25 |     const dashboardPage = new AdminDashboardPage(page);
  26 |     
  27 |     await loginPage.goto();
  28 |     await loginPage.login(testUsers.admin.email, testUsers.admin.password);
  29 |     await loginPage.expectLoginSuccess();
  30 |     
  31 |     await dashboardPage.goto();
  32 |     await dashboardPage.expectDashboardLoaded();
  33 |   });
  34 | 
  35 |   test('Non-admin user cannot access admin panel', async ({ page }) => {
  36 |     const loginPage = new LoginPage(page);
  37 |     
  38 |     await loginPage.goto();
  39 |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  40 |     await loginPage.expectLoginSuccess();
  41 |     
  42 |     // Try to access admin dashboard
  43 |     await page.goto('/dashboard/dashboard');
  44 |     
  45 |     // Should either redirect to home or show access denied
  46 |     await expect(page).not.toHaveURL(/\/dashboard\/dashboard/);
  47 |   });
  48 | 
  49 |   test('Login page has forgot password link', async ({ page }) => {
  50 |     const loginPage = new LoginPage(page);
  51 |     
  52 |     await loginPage.goto();
  53 |     await loginPage.clickForgotPassword();
  54 |     // Forgot password page should load (could be modal or redirect)
  55 |     await page.waitForTimeout(500);
  56 |   });
  57 | 
  58 |   test('Login page has register link', async ({ page }) => {
  59 |     const loginPage = new LoginPage(page);
  60 |     
  61 |     await loginPage.goto();
  62 |     await loginPage.clickRegisterLink();
  63 |     await loginPage.expectRedirectToRegister();
  64 |   });
  65 | 
  66 |   test('Logged out user cannot access protected routes', async ({ page }) => {
  67 |     // Try to access orders page without login
  68 |     await page.goto('/orders');
  69 |     
  70 |     // Should redirect to login
  71 |     await expect(page).toHaveURL(/\/login/);
  72 |   });
  73 | 
  74 |   test('Session persists on page refresh', async ({ page }) => {
  75 |     const loginPage = new LoginPage(page);
  76 |     
  77 |     await loginPage.goto();
  78 |     await loginPage.login(testUsers.customer.email, testUsers.customer.password);
  79 |     await loginPage.expectLoginSuccess();
  80 |     
  81 |     // Refresh page
  82 |     await page.reload();
  83 |     
  84 |     // Should still be logged in
> 85 |     await expect(page).not.toHaveURL(/\/login/);
     |                            ^ Error: expect(page).not.toHaveURL(expected) failed
  86 |   });
  87 | });
```