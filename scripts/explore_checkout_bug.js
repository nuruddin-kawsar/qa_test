const { chromium } = require('@playwright/test');
const path = require('path');
const SHOTS = path.join(__dirname, '..', 'screenshots');
const BASE  = 'https://www.saucedemo.com';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p       = await ctx.newPage();

  // problem_user checkout form — firstName field is broken
  await p.goto(BASE);
  await p.locator('[data-test="username"]').fill('problem_user');
  await p.locator('[data-test="password"]').fill('secret_sauce');
  await p.locator('[data-test="login-button"]').click();
  await p.waitForURL(/inventory/);

  // Add Sauce Labs Backpack (works for problem_user)
  await p.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await p.waitForTimeout(300);
  await p.locator('[data-test="shopping-cart-link"]').click();
  await p.waitForURL(/cart/);
  await p.locator('[data-test="checkout"]').click();
  await p.waitForURL(/checkout-step-one/);

  // Read value of firstName before and after fill
  await p.locator('[data-test="firstName"]').fill('Jane');
  const firstNameVal = await p.locator('[data-test="firstName"]').inputValue();
  await p.locator('[data-test="lastName"]').fill('Doe');
  await p.locator('[data-test="postalCode"]').fill('12345');

  await p.screenshot({ path: path.join(SHOTS, 'bug-009-problem-user-checkout-form.png'), fullPage: true });
  console.log('firstName field value after fill("Jane"):', JSON.stringify(firstNameVal));

  await p.locator('[data-test="continue"]').click();
  await p.waitForTimeout(800);

  const urlAfter = p.url();
  const errText  = await p.locator('[data-test="error"]').innerText().catch(() => '');
  await p.screenshot({ path: path.join(SHOTS, 'bug-010-problem-user-checkout-error.png'), fullPage: true });

  console.log('URL after clicking Continue:', urlAfter);
  console.log('Error message:', errText || '(none)');

  const stuck = /checkout-step-one/.test(urlAfter);
  console.log('Stuck on step one:', stuck);
  console.log('firstName was empty (field broken):', firstNameVal === '');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
