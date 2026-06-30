import { Page, Locator } from '@playwright/test';

export class WikimediaSearchPage {
  readonly page: Page;

  // Search form input on Special:Search
  readonly searchInput: Locator;

  // Search results
  readonly searchResultItems: Locator;
  readonly resultThumbnails: Locator;

  // Empty / no-results state
  readonly noResultsMessage: Locator;

  // Loading indicator (MobileFrontend AJAX spinner)
  readonly loadingSpinner: Locator;

  // Image detail page (File: pages)
  readonly imageDetailTitle: Locator;
  readonly imageDirectLink: Locator;

  // Category page
  readonly categoryDescription: Locator;

  // Login page (Special:UserLogin) — used for auth flow tests (TC-M12)
  readonly loginUsernameInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitButton: Locator;
  readonly loginError: Locator;

  constructor(page: Page) {
    this.page = page;

    // Special:Search page has two inputs with name="search":
    //   1) #searchInput — the Minerva header bar (hidden on page load, requires overlay trigger)
    //   2) OOjs UI widget — the actual visible search form (role="combobox", autofocus)
    // We target the visible form widget via role so fill() doesn't wait on a hidden element.
    this.searchInput = page.locator('input[name="search"][role="combobox"]');

    this.searchResultItems = page.locator('.mw-search-result');
    this.resultThumbnails  = page.locator('.searchResultImage, .thumb img, .gallery img');

    this.noResultsMessage = page.locator('.mw-search-nonefound');
    this.loadingSpinner   = page.locator('.spinner, .mw-spinner');

    this.imageDetailTitle = page.locator('#firstHeading');
    // Multiple .fullImageLink a elements exist (original + thumbnails); .first() picks the original file link
    this.imageDirectLink  = page.locator('.fullImageLink a').first();

    // First prose paragraph inside the category description area
    this.categoryDescription = page.locator('.mw-parser-output p').first();

    this.loginUsernameInput = page.locator('#wpName1');
    this.loginPasswordInput = page.locator('#wpPassword1');
    this.loginSubmitButton  = page.locator('#wpLoginAttempt');
    // Wikimedia uses the Codex design system on modern Minerva — error class is cdx-message--error.
    // Legacy skins fall back to .mw-message-box-error / .error.
    // .first() avoids strict-mode violations when multiple error elements appear together.
    this.loginError         = page.locator('.cdx-message--error, .cdx-field__validation-message, .mw-message-box-error, .error').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/wiki/Special:Search');
  }

  /** Navigate directly to the search results page via URL — most reliable for result tests. */
  async searchByUrl(query: string): Promise<void> {
    const encoded = encodeURIComponent(query);
    await this.page.goto(`/w/index.php?title=Special%3ASearch&search=${encoded}&ns0=1`);
  }

  /** Fill the search form and press Enter — used to test the form submission path (TC-M02). */
  async searchByForm(query: string): Promise<void> {
    await this.goto();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  /** Wait for at least one result item to be visible. */
  async waitForResults(): Promise<void> {
    await this.searchResultItems.first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  async getResultCount(): Promise<number> {
    return this.searchResultItems.count();
  }

  async openFirstResult(): Promise<void> {
    await this.searchResultItems.first().click();
  }
}
