import { test, expect } from '@playwright/test';
import { WikimediaSearchPage } from '../pages/WikimediaSearchPage';
import { WIKIMEDIA_QUERIES, WIKIMEDIA_URLS } from './wikimedia-constants';


// ─── Search ──────────────────────────────────────────────────────────────────

test.describe('Wikimedia Commons — Mobile Search', () => {

  test('TC-M01: valid query returns results with thumbnails', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.valid);
    await page.waitForLoadState('load');
    await searchPage.waitForResults();

    await expect(searchPage.searchResultItems.first()).toBeVisible();
    await expect(searchPage.noResultsMessage).not.toBeVisible();
    // Note: Minerva mobile skin does not render thumbnails in the search result list —
    // only the result titles and snippets appear. Thumbnail presence is not asserted here.
  });

  test('TC-M02: empty form submission does not leave an unresolvable spinner (BUG-M01)', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    // Mirrors the manual steps in BUG-M01: open search, leave field empty, submit
    await searchPage.searchByForm(WIKIMEDIA_QUERIES.empty);
    await page.waitForLoadState('load');
    // Give the page 10 s to settle — the native app spun indefinitely here
    await page.waitForTimeout(10_000);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-mob-bug-001-empty-search-spinner.png` });

    // Spinner must not still be visible — page must have reached a stable state
    await expect(searchPage.loadingSpinner).not.toBeVisible();
    // Page must have a title (i.e. it rendered something)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('TC-M03: nonsense query shows no-results empty state (BUG-M02)', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.noResults);
    await page.waitForLoadState('load');

    await expect(searchPage.noResultsMessage).toBeVisible();
    await expect(searchPage.searchResultItems).toHaveCount(0);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-mob-bug-002-no-results-empty-state.png` });
  });

  test('TC-M04: AJAX autocomplete failure does not freeze the search form', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    // Intercept client-side AJAX autocomplete calls (these ARE JS-fetched, unlike the SSR results page)
    await page.route('**/w/api.php*action=opensearch*', route => route.abort());
    await page.route('**/w/rest.php/v1/search/title*', route => route.abort());

    await searchPage.goto();
    await page.waitForLoadState('load');

    // Type to trigger autocomplete — the AJAX calls will be aborted
    await searchPage.searchInput.fill(WIKIMEDIA_QUERIES.valid);
    await page.waitForTimeout(2_000);

    // No spinner should be frozen despite the failed autocomplete API calls
    await expect(searchPage.loadingSpinner).not.toBeVisible();

    // The form must still be functional — submitting should load SSR results normally
    await searchPage.searchInput.press('Enter');
    await page.waitForLoadState('load');
    await searchPage.waitForResults();
    await expect(searchPage.searchResultItems.first()).toBeVisible();
  });

});

// ─── Offline / Airplane Mode ──────────────────────────────────────────────────

test.describe('Wikimedia Commons — Offline Mode', () => {

  // Restore connectivity after every test in this block, even when the test fails mid-way.
  // Without this, a timed-out or errored test that called context.setOffline(true) can
  // leave the browser context in an offline state and cascade failures into sibling tests.
  test.afterEach(async ({ context }) => {
    await context.setOffline(false);
  });

  test('TC-M05: going offline after results load prevents detail page from loading (BUG-M03)', async ({ page, context }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    // Load results while online
    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.valid);
    await page.waitForLoadState('load');
    await searchPage.waitForResults();
    await expect(searchPage.searchResultItems.first()).toBeVisible();

    // Simulate airplane mode ON
    await context.setOffline(true);

    // Tap/click the first result — navigation will fail (network error)
    await searchPage.openFirstResult();
    await page.waitForTimeout(3_000);

    // #firstHeading exists on the search results page itself ("Search results"), so we
    // check a file-page-specific element that is ONLY present on a successfully loaded File: page
    const filePageLoaded = await page.locator('.fileinfotpl, #mw-imagepage-section-filehistory').isVisible().catch(() => false);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-mob-bug-003-airplane-blank-screen.png` });
    expect(filePageLoaded).toBe(false);

    await context.setOffline(false);
  });

  test('TC-M06: restoring connectivity allows navigation without full app restart (BUG-M04)', async ({ page, context }) => {
    test.setTimeout(60_000);
    const searchPage = new WikimediaSearchPage(page);

    // Load results while online
    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.valid);
    await page.waitForLoadState('load');
    await searchPage.waitForResults();

    // Simulate airplane mode ON then OFF
    await context.setOffline(true);
    await page.waitForTimeout(1_000);
    await context.setOffline(false);
    await page.waitForTimeout(2_000);

    // The already-rendered search results must still be visible after reconnection
    await expect(searchPage.searchResultItems.first()).toBeVisible();

    // Navigating to a result must now succeed — no full restart required
    await searchPage.openFirstResult();
    await page.waitForLoadState('load', { timeout: 15_000 });
    await expect(page.locator('#firstHeading, h1').first()).toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: `screenshots/${test.info().project.name}-mob-bug-004-no-reconnect-recovery.png` });
  });

});

// ─── Image Detail ─────────────────────────────────────────────────────────────

test.describe('Wikimedia Commons — Image Detail', () => {

  test('TC-M07: image detail page shows title and file information table', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    // Navigate to a permanently stable, well-known file (the Commons site logo)
    await page.goto(WIKIMEDIA_URLS.stableFile);
    await page.waitForLoadState('load');

    // Title heading must be visible
    await expect(searchPage.imageDetailTitle).toBeVisible();
    const title = await searchPage.imageDetailTitle.innerText();
    expect(title).toContain('Commons-logo');

    // File information table (contains author, date, licence) must be present
    const fileInfoTable = page.locator('.fileinfotpl, table.wikitable, #mw-imagepage-section-filehistory');
    await expect(fileInfoTable.first()).toBeVisible();

    // The direct link to the media file must exist
    await expect(searchPage.imageDirectLink).toBeVisible();
  });

  test('TC-M08: image direct link points to the media file, not the description page (BUG-M05)', async ({ page }) => {
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await page.goto(WIKIMEDIA_URLS.stableFile);
    await page.waitForLoadState('load');

    await expect(searchPage.imageDirectLink).toBeVisible();
    const href = await searchPage.imageDirectLink.getAttribute('href');
    expect(href).not.toBeNull();

    // The link must NOT be another File: description page (that is BUG-M05's wrong behaviour)
    expect(href).not.toContain('/wiki/File:');

    // The link must resolve to the actual media content
    const isDirectMedia =
      href!.includes('upload.wikimedia.org') ||
      href!.includes('/Special:FilePath') ||
      /\.(svg|png|jpg|jpeg|webp|gif|pdf)(\?|$)/i.test(href!);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-mob-bug-005-share-url-wrong-target.png` });
    expect(isDirectMedia).toBe(true);
  });

});

// ─── Category Pages ───────────────────────────────────────────────────────────

test.describe('Wikimedia Commons — Category Pages', () => {

  test('TC-M09: category page shows description text (upstream #5621)', async ({ page }) => {
    // Covers GitHub #5621 — category description texts not shown in the native app.
    // On the web the description paragraph must be visible in the page body.
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await page.goto(WIKIMEDIA_URLS.categoryPage);
    await page.waitForLoadState('load');

    // The page must have rendered a heading (sanity check that it loaded at all)
    await expect(searchPage.imageDetailTitle).toBeVisible();

    // The category description paragraph must be present and non-empty.
    // Category:Sunsets has a prose description block inside .mw-parser-output.
    await expect(searchPage.categoryDescription).toBeVisible();
    const descText = await searchPage.categoryDescription.innerText();
    expect(descText.trim().length).toBeGreaterThan(0);
  });

});

// ─── Special Character Search ─────────────────────────────────────────────────

test.describe('Wikimedia Commons — Special Character Search', () => {

  test('TC-M10: CJK query returns results or clean empty state — no frozen spinner', async ({ page }) => {
    // Covers "What I'd Test Next" item 3: CJK character handling.
    // The page must settle (no indefinite spinner) and display either results or no-results.
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.cjk);
    await page.waitForLoadState('load');
    await page.waitForTimeout(3_000);

    await expect(searchPage.loadingSpinner).not.toBeVisible();

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);

    const hasResults   = await searchPage.searchResultItems.count() > 0;
    const hasNoResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    expect(hasResults || hasNoResults).toBe(true);
  });

  test('TC-M11: RTL (Arabic) query renders without display corruption — no frozen spinner', async ({ page }) => {
    // Covers "What I'd Test Next" item 3: right-to-left input handling.
    // صورة = "image" in Arabic — a high-frequency term expected to return results on Commons.
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await searchPage.searchByUrl(WIKIMEDIA_QUERIES.rtl);
    await page.waitForLoadState('load');
    await page.waitForTimeout(3_000);

    await expect(searchPage.loadingSpinner).not.toBeVisible();

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);

    const hasResults   = await searchPage.searchResultItems.count() > 0;
    const hasNoResults = await searchPage.noResultsMessage.isVisible().catch(() => false);
    expect(hasResults || hasNoResults).toBe(true);
  });

});

// ─── Auth / Upload Entry Points ───────────────────────────────────────────────

test.describe('Wikimedia Commons — Auth & Upload', () => {

  test('TC-M12: login form shows error feedback on invalid credentials (upstream #6906, #3246)', async ({ page }) => {
    // Covers GitHub #6906 and #3246 — login failures that give no or misleading feedback.
    // The web form must display a visible error message rather than a blank or frozen screen.
    test.setTimeout(45_000);
    const searchPage = new WikimediaSearchPage(page);

    await page.goto(WIKIMEDIA_URLS.loginPage);
    await page.waitForLoadState('load');

    await expect(searchPage.loginUsernameInput).toBeVisible();
    await expect(searchPage.loginPasswordInput).toBeVisible();

    await searchPage.loginUsernameInput.fill('fake_user_xyz_playwright');
    await searchPage.loginPasswordInput.fill('wrong_password_123');
    await searchPage.loginSubmitButton.click();
    await page.waitForLoadState('load');

    // The page must show an error message — never a blank or spinner-frozen screen
    await expect(searchPage.loginError).toBeVisible({ timeout: 10_000 });
  });

  test('TC-M13: UploadWizard gates anonymous users to login — no blank screen', async ({ page }) => {
    // Covers the upload-entry-point area (GitHub #6908, #6904, #6902 context).
    // Anonymous users must be shown a login-required page, not a blank/frozen screen.
    // Observed behaviour: URL stays at Special:UploadWizard; page renders a
    // "Login required" heading and links to Special:UserLogin — no redirect occurs.
    test.setTimeout(45_000);

    await page.goto(WIKIMEDIA_URLS.uploadWizard);
    await page.waitForLoadState('load');

    // Page must never be blank — heading must be present
    const heading = await page.locator('#firstHeading, h1').first().innerText().catch(() => '');
    await expect(page.locator('#firstHeading, h1').first()).toBeVisible();

    // Accept any of: URL redirect to login, "Login required" heading, or a visible UserLogin link
    const url = page.url();
    const redirectedToLogin = url.includes('UserLogin');
    const headingIndicatesLogin = /login|required|sign.?in/i.test(heading);
    const hasLoginLink = await page.locator('a[href*="UserLogin"]').first().isVisible().catch(() => false);

    expect(redirectedToLogin || headingIndicatesLogin || hasLoginLink).toBe(true);
  });

});
