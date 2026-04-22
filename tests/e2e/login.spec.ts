import { test, expect } from '@playwright/test';

test('should show login page and allow form interaction', async ({ page }) => {
  await page.goto('/login');

  // Expect title to contain Institutional
  await expect(page).toHaveTitle(/Login/);

  // Check for email and password fields
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  // Try to type
  await emailInput.fill('admin@traininglab.com');
  await passwordInput.fill('password123');

  // Check for login button
  const loginButton = page.locator('button', { hasText: /Sign In/i });
  await expect(loginButton).toBeVisible();
});
