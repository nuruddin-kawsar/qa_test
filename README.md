# Sauce Demo Playwright E2E Tests

End-to-end test suite for the [Sauce Demo](https://www.saucedemo.com) checkout flow,
built with [Playwright](https://playwright.dev/) and TypeScript using the Page Object Model pattern.

## Prerequisites

- Node.js 18 or higher — check with `node --version`
- npm 9 or higher — check with `npm --version`

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/saucedemo-playwright.git
cd saucedemo-playwright
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browsers

```bash
npm run install:browsers
```

This downloads Chromium, Firefox, and WebKit along with their OS-level dependencies.

## Running Tests

### Run all tests across all browsers

```bash
npm test
```

### Run all tests with a visible browser window

```bash
npm run test:headed
```

### Run tests with Playwright's interactive UI mode

```bash
npm run test:ui
```

### Run tests for a specific browser

```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Run a specific test file

```bash
npm run test:checkout    # Happy path: full checkout flow
npm run test:negative    # Negative tests: invalid login + missing fields
```

## View the HTML Report

After any test run, an HTML report is generated in `playwright-report/`:

```bash
npm run report
```

This opens a local server at `http://localhost:9323` with a full test report including
screenshots and traces for any failures.

## Test Coverage

| Test File | Scenario | Assertions |
|-----------|----------|------------|
| `checkout.spec.ts` | Login → add Sauce Labs Backpack → checkout | URL changes, cart badge, product name/price, payment info, shipping, totals, confirmation header |
| `negative.spec.ts` | Login with invalid credentials | Error visible, exact error text, stays on login page |
| `negative.spec.ts` | Login with empty username | "Epic sadface: Username is required" |
| `negative.spec.ts` | Checkout — First Name missing | "Error: First Name is required", stays on step-one |
| `negative.spec.ts` | Checkout — Last Name missing | "Error: Last Name is required" |
| `negative.spec.ts` | Checkout — Postal Code missing | "Error: Postal Code is required" |

## Project Structure

```
saucedemo-playwright/
├── .github/
│   └── workflows/
│       └── playwright.yml        # GitHub Actions CI (runs on push/PR)
├── pages/                        # Page Object Models
│   ├── LoginPage.ts              # Login form locators and methods
│   ├── InventoryPage.ts          # Product list, cart badge, add-to-cart
│   ├── CartPage.ts               # Cart items, checkout navigation
│   ├── CheckoutPage.ts           # Info form (step 1) + order summary (step 2)
│   └── OrderConfirmationPage.ts  # Confirmation page assertions
├── tests/
│   ├── checkout.spec.ts          # Happy path end-to-end test
│   └── negative.spec.ts          # Negative / validation tests
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies and npm scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md
```

## CI/CD

Tests run automatically on every push and pull request via GitHub Actions.
See [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml).

- Chromium, Firefox, and WebKit run in parallel (separate jobs)
- `fail-fast: false` — a Firefox failure does not abort the Chromium run
- Test reports and screenshots are uploaded as artifacts, retained for 30 days
- Trigger a manual run anytime via the **Actions** tab → **Run workflow**

## Credentials

This suite uses `standard_user / secret_sauce`, which are publicly documented
on the Sauce Demo login page. No secrets or environment variables are required.
