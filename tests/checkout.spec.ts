import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { USERS, PRODUCT, CUSTOMER } from './constants';

test.describe('Happy Path: Checkout Flow', () => {
  test('should complete full checkout and show order confirmation', async ({ page }) => {
    // Arrange
    const loginPage            = new LoginPage(page);
    const inventoryPage        = new InventoryPage(page);
    const cartPage             = new CartPage(page);
    const checkoutPage         = new CheckoutPage(page);
    const orderConfirmationPage = new OrderConfirmationPage(page);
    await loginPage.goto();

    // Act — execute the full checkout flow and capture intermediate state
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await page.waitForURL(/inventory\.html/);

    await inventoryPage.addToCart(PRODUCT.name);
    const cartBadgeText  = await inventoryPage.cartBadge.innerText();
    const addedToCart    = await inventoryPage.isAddedToCart(PRODUCT.name);

    await inventoryPage.goToCart();
    await page.waitForURL(/cart\.html/);
    const cartItemNames  = await cartPage.getCartItemNames();
    const cartItemPrices = await cartPage.getCartItemPrices();
    const cartItemCount  = await cartPage.getCartItemCount();
    const itemQuantity   = await cartPage.getFirstItemQuantity();

    await cartPage.proceedToCheckout();
    await page.waitForURL(/checkout-step-one\.html/);
    await checkoutPage.submitInfoForm(CUSTOMER.firstName, CUSTOMER.lastName, CUSTOMER.postalCode);
    await page.waitForURL(/checkout-step-two\.html/);

    const paymentInfo  = await checkoutPage.paymentInfoValue.innerText();
    const shippingInfo = await checkoutPage.shippingInfoValue.innerText();
    const subtotalText = await checkoutPage.subtotalLabel.innerText();
    const taxText      = await checkoutPage.taxLabel.innerText();
    const totalText    = await checkoutPage.totalLabel.innerText();

    await checkoutPage.finish();

    // Assert
    await expect(page).toHaveURL(/checkout-complete\.html/);

    // Cart state — badge updated, Remove button replaced Add to Cart
    expect(cartBadgeText).toBe('1');
    expect(addedToCart).toBe(true);

    // Cart contents — correct product, price, count, and quantity
    expect(cartItemNames).toContain(PRODUCT.name);
    expect(cartItemPrices[0]).toBe(PRODUCT.price);
    expect(cartItemCount).toBe(1);
    expect(itemQuantity).toBe('1');

    // Order summary — payment method, shipping, and financials
    expect(paymentInfo).toBe('SauceCard #31337');
    expect(shippingInfo).toBe('Free Pony Express Delivery!');
    expect(subtotalText).toContain(`Item total: ${PRODUCT.price}`);
    expect(taxText).toContain('Tax: $2.40');
    expect(totalText).toContain('Total: $32.39');

    // Confirmation page — heading and body copy
    await expect(orderConfirmationPage.confirmationContainer).toBeVisible();
    await expect(orderConfirmationPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(orderConfirmationPage.completeText).toContainText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });
});
