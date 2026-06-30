# Bug Report — Sauce Demo (saucedemo.com)

**Tested:** 30 June 2026
**Browser:** Chromium (Playwright headless, equivalent to Chrome latest)
**OS:** macOS 25.0.0
**Tester:** QA Candidate

---

## Accounts Tested

| Username | Password | Test Focus |
|----------|----------|-----------|
| standard_user | secret_sauce | Baseline, full checkout flow |
| locked_out_user | secret_sauce | Login rejection |
| problem_user | secret_sauce | Product listing, cart, checkout |
| performance_glitch_user | secret_sauce | Login performance |

---

## BUG-001: problem_user — "Add to Cart" button is non-functional for 3 of 6 products

**Steps to Reproduce:**
1. Navigate to https://www.saucedemo.com
2. Log in as `problem_user` / `secret_sauce`
3. Click "Add to Cart" on:
   - Sauce Labs Bolt T-Shirt
   - Sauce Labs Fleece Jacket
   - Test.allTheThings() T-Shirt (Red)

**Expected Result:**
Cart badge increments by 1 for each item added; button label changes to "Remove".

**Actual Result:**
Cart badge does not change. The button label stays as "Add to Cart". The item is not added to the cart. The remaining 3 products (Backpack, Bike Light, Onesie) work correctly.

**Severity:** Critical
**Reasoning:** 50% of catalogue is unbuyable for any user logging in as `problem_user`; blocks core purchase flow.

**Evidence:**
![Add to Cart non-functional for problem_user](screenshots/bug-005-problem-user-add-to-cart.png)

---

## BUG-002: problem_user — Last Name field on checkout silently drops input, blocking order completion

**Steps to Reproduce:**
1. Log in as `problem_user` / `secret_sauce`
2. Add Sauce Labs Backpack to cart
3. Click the cart icon → click "Checkout"
4. Type "Jane" in First Name, "Doe" in Last Name, "12345" in Zip/Postal Code
5. Click "Continue"

**Expected Result:**
Form accepts all three fields and navigates to Checkout Step 2 (order overview).

**Actual Result:**
Page stays on Checkout Step 1. Error banner displays:
> "Error: Last Name is required"

The Last Name field visually shows "Doe" as typed, but its value is silently discarded by the React state handler — the field's `onChange` does not persist the input. The First Name and Postal Code fields work correctly.

**Severity:** Critical
**Reasoning:** Checkout is entirely blocked for `problem_user`; no workaround without switching user accounts.

**Evidence:**
![Checkout form with Last Name filled in](screenshots/bug-009-problem-user-checkout-form.png)
![Error: Last Name is required banner](screenshots/bug-010-problem-user-checkout-error.png)

---

## BUG-003: problem_user — All 6 product images display the same incorrect broken image

**Steps to Reproduce:**
1. Log in as `problem_user` / `secret_sauce`
2. Observe the product listing page

**Expected Result:**
Each product displays its own distinct product photograph (as shown for `standard_user`).

**Actual Result:**
All 6 products display the same broken placeholder image (`/static/media/sl-404.168b1cce10384b857a6f.jpg`). No product has a unique image. The image path name itself contains "404", indicating this is an error fallback asset being served for every item.

**Severity:** Major
**Reasoning:** Customers cannot visually identify products; significantly reduces purchase confidence and could lead to wrong-item orders.

**Evidence:**
![All 6 products showing broken placeholder image](screenshots/bug-003-problem-user-broken-images.png)

---

## BUG-004: problem_user — Sort dropdown "Name (Z to A)" has no effect on product order

**Steps to Reproduce:**
1. Log in as `problem_user` / `secret_sauce`
2. On the inventory page, open the sort dropdown (top-right)
3. Select "Name (Z to A)"

**Expected Result:**
Products reorder so that "Test.allTheThings() T-Shirt (Red)" appears first and "Sauce Labs Backpack" appears last.

**Actual Result:**
Product order is unchanged — "Sauce Labs Backpack" remains first. Confirmed by comparing the full product name list before and after selecting "Z to A": the lists are identical.

**Note:** The sort options "Name (A to Z)", "Price (low to high)", and "Price (high to low)" were verified as working correctly for `standard_user`.

**Severity:** Major
**Reasoning:** Broken sorting impairs product discovery; customers relying on alphabetical sort get incorrect results without any error indication.

**Evidence:**
![Sort Z to A has no effect on product order](screenshots/bug-004-problem-user-sort-broken.png)

---

## BUG-005: performance_glitch_user — Login takes over 5 seconds

**Steps to Reproduce:**
1. Navigate to https://www.saucedemo.com
2. Enter username `performance_glitch_user`, password `secret_sauce`
3. Click "Login" and observe time to reach the inventory page

**Expected Result:**
Login completes and the inventory page loads in under 1 second (consistent with all other user accounts).

**Actual Result:**
Login took **5,076 ms** (5.1 seconds) as measured from the moment "Login" was clicked to the moment `/inventory.html` was fully loaded. The page appears frozen during this delay — no loading indicator is shown to the user.

**Severity:** Major
**Reasoning:** A 5+ second login with no visual feedback creates a poor user experience and may cause users to believe the site is broken and abandon the session.

**Evidence:**
![5076 ms login delay for performance_glitch_user](screenshots/bug-002-perf-glitch-login.png)

---

## BUG-006: locked_out_user — Error message provides no recovery path

**Steps to Reproduce:**
1. Navigate to https://www.saucedemo.com
2. Enter username `locked_out_user`, password `secret_sauce`
3. Click "Login"

**Expected Result:**
A locked-out user should be shown an error message AND a clear path to recover access (e.g., "Contact support" link or instructions to use a different account).

**Actual Result:**
The error message reads: "Epic sadface: Sorry, this user has been locked out." with no further guidance, no support link, and no self-service recovery option. The user is left with no action to take.

**Severity:** Minor
**Reasoning:** The lockout itself is expected behaviour; however, the absence of any recovery guidance is a UX gap that would frustrate legitimate users who have been mistakenly locked out.

**Evidence:**
![Locked out error with no recovery guidance](screenshots/bug-001-locked-out-user.png)

---

## BUG-007: All users — "About" link in hamburger menu navigates away from the application

**Steps to Reproduce:**
1. Log in as any valid user (e.g., `standard_user`)
2. Click the hamburger menu icon (top-left)
3. Click "About"

**Expected Result:**
Either an in-app "About" page is shown, or the link opens in a new tab so the user's current session is preserved.

**Actual Result:**
The browser navigates to `https://saucelabs.com/` in the same tab, fully replacing the application. The user's cart, current page, and session context are lost without any warning.

**Severity:** Minor
**Reasoning:** Unexpected navigation away from the app mid-session could cause loss of cart contents; a simple `target="_blank"` or in-app page would prevent this.

**Evidence:**
![About link navigating away from app in same tab](screenshots/bug-008-hamburger-menu.png)

---

## What I'd Test Next

Prioritised by risk to real users, highest first.

1. **problem_user regression sweep after bug fixes** — BUG-001 through BUG-004 are all concentrated in `problem_user`. Once those are patched, I would re-run the full inventory → cart → checkout flow for every one of the six products to confirm the fixes didn't silently break the three products that currently work. I'd also cross-check that the sort Z→A and the Last Name field retain correct behaviour after the React state handlers are fixed, because those fixes could have side-effects on other fields or sort options.

2. **Cart and order-total data integrity** — The checkout blockage in BUG-002 suggests the cart-to-checkout data pipeline has state-management issues. With more time I would add multiple different items, remove some, add again, and verify the subtotal, tax, and total are recalculated correctly at every step. I'd specifically test: remove one item from a two-item cart and confirm the badge, subtotal, and tax all update; then proceed to confirmation and verify the receipt total matches the pre-checkout total exactly.

3. **Security basics on input fields** — The First Name, Last Name, and Postal Code fields on checkout accept free text with no visible sanitisation. I would test `<script>alert(1)</script>` and `'; DROP TABLE orders; --` in each field to check for XSS reflection and error leakage. Additionally, the login error messages differ between `locked_out_user` ("Sorry, this user has been locked out") and a completely unknown user ("do not match any user") — this is a form of account enumeration and worth flagging to the security team.

4. **Session state and "Reset App State"** — I would test whether the cart persists across a hard page refresh (F5) and after using the browser back button from the confirmation page. I'd also exercise "Reset App State" from the hamburger menu and verify it actually clears the cart badge, resets all "Remove" buttons back to "Add to Cart", and does not leave ghost items in cart.html. These are common sources of flaky bugs in single-page applications.

5. **Accessibility — keyboard-only and screen-reader flow** — Tab through login → inventory → cart → checkout using only the keyboard (no mouse) and verify focus order is logical, all interactive elements are reachable, and error messages like "Error: First Name is required" are announced by a screen reader via `aria-live` or `role="alert"`. This is both a legal compliance concern and a real usability gap if the tab order skips the error banner.
