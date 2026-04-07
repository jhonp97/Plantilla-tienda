# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: specs\auth.spec.ts >> Authentication >> Login page has register link
- Location: e2e\specs\auth.spec.ts:58:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('[data-testid="register-link"], a:has-text("Regístrate"), a:has-text("Registrarse")')

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
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | export class LoginPage {
  4  |   constructor(private page: Page) {}
  5  | 
  6  |   async goto(): Promise<void> {
  7  |     await this.page.goto('/login');
  8  |     await this.page.waitForLoadState('networkidle');
  9  |   }
  10 | 
  11 |   async fillEmail(email: string): Promise<void> {
  12 |     await this.page.fill('#email, input[type="email"]', email);
  13 |   }
  14 | 
  15 |   async fillPassword(password: string): Promise<void> {
  16 |     await this.page.fill('#contraseña, input[type="password"]', password);
  17 |   }
  18 | 
  19 |   async clickLoginButton(): Promise<void> {
  20 |     await this.page.click('button[type="submit"]:has-text("Entrar"), button[type="submit"]:has-text("Iniciar sesión")');
  21 |   }
  22 | 
  23 |   async login(email: string, password: string): Promise<void> {
  24 |     await this.fillEmail(email);
  25 |     await this.fillPassword(password);
  26 |     await this.clickLoginButton();
  27 |   }
  28 | 
  29 |   async expectLoginSuccess(): Promise<void> {
  30 |     // Check for URL change OR error message appears (which means login attempt was made)
  31 |     await this.page.waitForTimeout(2000);
  32 |     const url = this.page.url();
  33 |     // Either we successfully logged in and redirected, or we're still on login with an error (no backend)
  34 |     const hasUserMenu = await this.page.locator('[data-testid="user-menu"], [data-testid="user-avatar"], [data-testid="logout-button"]').count() > 0;
  35 |     const hasError = await this.page.locator('.error, [class*="error"]').count() > 0;
  36 |     
  37 |     // Pass if either logged in OR got error (meaning form submission worked but no backend)
  38 |     expect(hasUserMenu || hasError || !url.includes('/login')).toBe(true);
  39 |   }
  40 | 
  41 |   async expectLoginError(): Promise<void> {
  42 |     await expect(this.page.locator('[data-testid="error-message"], .error, text=Credenciales incorrectas')).toBeVisible();
  43 |   }
  44 | 
  45 |   async clickForgotPassword(): Promise<void> {
  46 |     await this.page.click('[data-testid="forgot-password-link"], a:has-text("¿Olvidaste tu contraseña?")');
  47 |   }
  48 | 
  49 |   async clickRegisterLink(): Promise<void> {
> 50 |     await this.page.click('[data-testid="register-link"], a:has-text("Regístrate"), a:has-text("Registrarse")');
     |                     ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  51 |   }
  52 | 
  53 |   async expectRedirectToRegister(): Promise<void> {
  54 |     await expect(this.page).toHaveURL('/register');
  55 |   }
  56 | }
```