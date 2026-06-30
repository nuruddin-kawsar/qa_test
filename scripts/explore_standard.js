const { chromium } = require('@playwright/test');
const path = require('path');
const SHOTS = path.join(__dirname, '..', 'screenshots');
const BASE  = 'https://www.saucedemo.com';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p       = await ctx.newPage();

  // Standard user — login
  await p.goto(BASE);
  await p.locator('[data-test="username"]').fill('standard_user');
  await p.locator('[data-test="password"]').fill('secret_sauce');
  await p.locator('[data-test="login-button"]').click();
  await p.waitForURL(/inventory/);

  // Footer copyright
  const footer = await p.locator('.footer_copy').innerText().catch(() => '');
  await p.screenshot({ path: path.join(SHOTS, 'bug-006-footer-copyright.png'), fullPage: true });
  console.log('Footer text:', footer.trim());

  // Sort price high-to-low
  await p.locator('[data-test="product-sort-container"]').selectOption('hilo');
  await p.waitForTimeout(500);
  const prices = await p.locator('[data-test="inventory-item-price"]').allInnerTexts();
  await p.screenshot({ path: path.join(SHOTS, 'bug-007-sort-price-hilo.png'), fullPage: true });
  const nums = prices.map(s => parseFloat(s.replace('$', '')));
  const isDesc = nums.every((v, i) => i === 0 || nums[i - 1] >= v);
  console.log('Prices high-to-low:', prices.join(', '));
  console.log('Correctly sorted descending:', isDesc);

  // Sort Name Z to A
  await p.locator('[data-test="product-sort-container"]').selectOption('za');
  await p.waitForTimeout(500);
  const namesZA = await p.locator('[data-test="inventory-item-name"]').allInnerTexts();
  console.log('Names Z-to-A first item:', namesZA[0], 'last item:', namesZA[namesZA.length - 1]);
  const correctZA = namesZA[0] > namesZA[namesZA.length - 1];
  console.log('Z-to-A sort correct:', correctZA);

  // Hamburger menu — About link
  await p.locator('#react-burger-menu-btn').click();
  await p.waitForTimeout(500);
  const aboutHref = await p.locator('[data-test="about-sidebar-link"]').getAttribute('href').catch(() => '');
  await p.screenshot({ path: path.join(SHOTS, 'bug-008-hamburger-menu.png'), fullPage: true });
  console.log('About link href:', aboutHref);

  // Product detail page — back button goes back correctly
  await p.locator('#react-burger-menu-btn').click();
  await p.waitForTimeout(300);
  await p.locator('[data-test="inventory-item-name"]').first().click();
  await p.waitForURL(/inventory-item/);
  const backBtn = p.locator('[data-test="back-to-products"]');
  await backBtn.click();
  await p.waitForURL(/inventory\.html/);
  console.log('Back button works:', p.url().includes('inventory.html'));

  // problem_user: checkout form firstName bug
  await p.goto(BASE);
  await p.locator('[data-test="username"]').fill('problem_user');
  await p.locator('[data-test="password"]').fill('secret_sauce');
  await p.locator('[data-test="login-button"]').click();
  await p.waitForURL(/inventory/);

  // Only Sauce Labs Backpack and Bike Light and Onesie work for problem_user
  // Try backpack add-to-cart via direct URL on detail page
  await p.goto(BASE + '/inventory-item.html?id=4');
  await p.waitForTimeout(500);
  const addBtn = p.locator('[data-test="add-to-cart"]');
  const addExists = await addBtn.count();
  console.log('problem_user: detail page add-to-cart button exists:', addExists > 0);
  if (addExists) {
    await addBtn.click();
    await p.waitForTimeout(400);
    const badge = await p.locator('[data-test="shopping-cart-badge"]').innerText().catch(() => '0');
    console.log('problem_user: cart badge after add from detail page:', badge);
  }

  await p.locator('[data-test="shopping-cart-link"]').click();
  await p.waitForURL(/cart/);
  await p.locator('[data-test="checkout"]').click();
  await p.waitForURL(/checkout-step-one/);
  await p.locator('[data-test="firstName"]').fill('Jane');
  await p.locator('[data-test="lastName"]').fill('Doe');
  await p.locator('[data-test="postalCode"]').fill('12345');
  await p.locator('[data-test="continue"]').click();
  await p.waitForTimeout(800);
  const url = p.url();
  const errMsg = await p.locator('[data-test="error"]').innerText().catch(() => '');
  await p.screenshot({ path: path.join(SHOTS, 'bug-009-problem-user-checkout.png'), fullPage: true });
  console.log('problem_user checkout after valid form submit:', url);
  console.log('problem_user checkout error message:', errMsg || '(none)');

  await browser.close();
  console.log('\nDone. Screenshots in:', SHOTS);
})().catch(e => { console.error(e); process.exit(1); });
