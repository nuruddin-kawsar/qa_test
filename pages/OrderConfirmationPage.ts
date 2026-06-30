import { Page, Locator } from '@playwright/test';

export class OrderConfirmationPage {
  readonly page: Page;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backToProductsButton: Locator;
  readonly confirmationContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.confirmationContainer = page.locator('[data-test="checkout-complete-container"]');
  }

  async getHeaderText(): Promise<string> {
    return this.completeHeader.innerText();
  }

  async getCompleteText(): Promise<string> {
    return this.completeText.innerText();
  }

  async isConfirmationVisible(): Promise<boolean> {
    return this.confirmationContainer.isVisible();
  }
}
