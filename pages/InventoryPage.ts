import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly inventoryList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('[data-test="title"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.inventoryList = page.locator('[data-test="inventory-list"]');
  }

  private addToCartLocator(productName: string): Locator {
    // data-test is built by the app as: ("Add to cart" + "-" + name).replace(/\s+/g,"-").toLowerCase()
    const testId = `add-to-cart-${productName.replace(/\s+/g, '-').toLowerCase()}`;
    return this.page.locator(`[data-test="${testId}"]`);
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartLocator(productName).click();
  }

  // Returns true once the Remove button appears, confirming the item is in the cart.
  async isAddedToCart(productName: string): Promise<boolean> {
    const testId = `remove-${productName.replace(/\s+/g, '-').toLowerCase()}`;
    return this.page.locator(`[data-test="${testId}"]`).isVisible();
  }

  async getCartCount(): Promise<string> {
    return this.cartBadge.innerText();
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
  }

  async isLoaded(): Promise<boolean> {
    return this.inventoryList.isVisible();
  }
}
