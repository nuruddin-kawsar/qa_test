import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartList: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartList = page.locator('[data-test="cart-list"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.pageTitle = page.locator('[data-test="title"]');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allInnerTexts();
  }

  async getCartItemPrices(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-price"]').allInnerTexts();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async getCartItemCount(): Promise<number> {
    return this.page.locator('[data-test="inventory-item"]').count();
  }

  async getFirstItemQuantity(): Promise<string> {
    return this.page.locator('[data-test="item-quantity"]').first().innerText();
  }
}
