import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS, PRODUCT } from './constants';

test.describe('Login — invalid credentials', () => {
  test('locked-out user sees account-disabled error', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.login(USERS.locked.username, USERS.locked.password);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
    await expect(page).toHaveURL('/');
  });

  test('wrong credentials show authentication error', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.login('invalid_user', 'wrong_password');

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
    await expect(page).toHaveURL('/');
  });

  test('empty username shows required-field error', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Act
    await loginPage.login('', USERS.standard.password);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Checkout — missing required fields', () => {
  let checkoutPage: CheckoutPage;

  // Arrange — shared: log in, add product, open cart, navigate to checkout step one
  test.beforeEach(async ({ page }) => {
    const loginPage    = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage     = new CartPage(page);
    checkoutPage       = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.addToCart(PRODUCT.name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await page.waitForURL(/checkout-step-one\.html/);
  });

  const fieldCases = [
    { label: 'First Name',  firstName: '',     lastName: 'Doe', postalCode: '12345', error: 'Error: First Name is required' },
    { label: 'Last Name',   firstName: 'Jane', lastName: '',    postalCode: '12345', error: 'Error: Last Name is required' },
    { label: 'Postal Code', firstName: 'Jane', lastName: 'Doe', postalCode: '',      error: 'Error: Postal Code is required' },
  ];

  for (const { label, firstName, lastName, postalCode, error } of fieldCases) {
    test(`shows validation error when ${label} is missing`, async ({ page }) => {
      // Arrange — see beforeEach above

      // Act
      await checkoutPage.fillInfo(firstName, lastName, postalCode);
      await checkoutPage.continue();

      // Assert
      await expect(page).toHaveURL(/checkout-step-one\.html/);
      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toHaveText(error);
    });
  }
});
