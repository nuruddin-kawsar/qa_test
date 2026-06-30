import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Step one — checkout-step-one.html
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step two — checkout-step-two.html
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.paymentInfoValue = page.locator('[data-test="payment-info-value"]');
    this.shippingInfoValue = page.locator('[data-test="shipping-info-value"]');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async submitInfoForm(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fillInfo(firstName, lastName, postalCode);
    await this.continue();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async getErrorText(): Promise<string> {
    return this.errorMessage.innerText();
  }

  async getSubtotalText(): Promise<string> {
    return this.subtotalLabel.innerText();
  }

  async getTotalText(): Promise<string> {
    return this.totalLabel.innerText();
  }
}
