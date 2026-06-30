const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE   = 'https://www.saucedemo.com';
const PASS   = 'secret_sauce';
const SHOTS  = path.join(__dirname, '..', 'screenshots');

async function login(page, username) {
  await page.goto(BASE);
  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(PASS);
  await page.locator('[data-test="login-button"]').click();
}

async function allProductNames(page) {
  return page.locator('[data-test="inventory-item-name"]').allInnerTexts();
}

async function allPrices(page) {
  return page.locator('[data-test="inventory-item-price"]').allInnerTexts();
}

async function shot(page, filename) {
  await page.screenshot({ path: path.join(SHOTS, filename), fullPage: true });
}

const findings = [];

function log(user, id, title, detail) {
  const msg = `[${user}] BUG-${id}: ${title} — ${detail}`;
  console.log(msg);
  findings.push({ user, id, title, detail });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 1280, height: 800 } });

  // ── locked_out_user ──────────────────────────────────────────────────────────
  {
    const p = await ctx.newPage();
    await login(p, 'locked_out_user');
    const errText = await p.locator('[data-test="error"]').innerText().catch(() => '');
    const stillOnLogin = p.url() === BASE + '/';
    await shot(p, 'bug-001-locked-out-user.png');
    log('locked_out_user', '001',
      'Locked-out user cannot log in',
      `Error: "${errText}" | Stayed on login: ${stillOnLogin}`);
    await p.close();
  }

  // ── performance_glitch_user ───────────────────────────────────────────────────
  {
    const p = await ctx.newPage();
    await p.goto(BASE);
    await p.locator('[data-test="username"]').fill('performance_glitch_user');
    await p.locator('[data-test="password"]').fill(PASS);
    const t0 = Date.now();
    await p.locator('[data-test="login-button"]').click();
    await p.waitForURL(/inventory/, { timeout: 30_000 });
    const loginMs = Date.now() - t0;
    await shot(p, 'bug-002-perf-glitch-login.png');
    log('performance_glitch_user', '002',
      `Login takes ${loginMs} ms instead of <1 s`,
      `Measured: ${loginMs} ms`);
    await p.close();
  }

  // ── problem_user ──────────────────────────────────────────────────────────────
  {
    const p = await ctx.newPage();
    await login(p, 'problem_user');
    await p.waitForURL(/inventory/);

    // BUG: all product images have the same wrong src
    const srcs = await p.locator('.inventory_item img').evaluateAll(
      els => els.map(e => e.getAttribute('src'))
    );
    const unique = [...new Set(srcs)];
    await shot(p, 'bug-003-problem-user-broken-images.png');
    log('problem_user', '003',
      'All product images display the wrong item photo',
      `${srcs.length} products but only ${unique.length} unique src: ${unique[0]}`);

    // BUG: sort Z→A has no effect
    const beforeSort = await allProductNames(p);
    await p.locator('[data-test="product-sort-container"]').selectOption('za');
    await p.waitForTimeout(600);
    const afterSort = await allProductNames(p);
    const sortChanged = JSON.stringify(beforeSort) !== JSON.stringify(afterSort);
    await shot(p, 'bug-004-problem-user-sort-broken.png');
    log('problem_user', '004',
      'Sort (Z → A) has no effect on product order',
      `Order changed: ${sortChanged} | First item before: "${beforeSort[0]}" | after: "${afterSort[0]}"`);

    // BUG: some Add-to-cart buttons are broken
    await p.locator('[data-test="product-sort-container"]').selectOption('az');
    await p.waitForTimeout(400);
    const names = await allProductNames(p);
    const cartResults = [];
    for (const name of names) {
      const id  = `add-to-cart-${name.replace(/\s+/g, '-').toLowerCase()}`;
      const btn = p.locator(`[data-test="${id}"]`);
      const exists = await btn.count() > 0;
      if (exists) {
        const beforeBadge = await p.locator('[data-test="shopping-cart-badge"]').innerText().catch(() => '0');
        await btn.click();
        await p.waitForTimeout(400);
        const afterBadge  = await p.locator('[data-test="shopping-cart-badge"]').innerText().catch(() => '0');
        const worked = afterBadge !== beforeBadge;
        cartResults.push({ name, worked });
      }
    }
    const broken = cartResults.filter(r => !r.worked).map(r => r.name);
    await shot(p, 'bug-005-problem-user-add-to-cart.png');
    if (broken.length > 0) {
      log('problem_user', '005',
        '"Add to Cart" button has no effect for certain products',
        `Broken: ${broken.join(', ')}`);
    }

    // BUG: First Name field on checkout is broken for problem_user
    // Reset cart, add one working item
    await p.goto(BASE + '/inventory.html');
    const workingItem = cartResults.find(r => r.worked);
    if (workingItem) {
      const id = `add-to-cart-${workingItem.name.replace(/\s+/g, '-').toLowerCase()}`;
      await p.locator(`[data-test="${id}"]`).click();
      await p.locator('[data-test="shopping-cart-link"]').click();
      await p.locator('[data-test="checkout"]').click();
      await p.locator('[data-test="firstName"]').fill('Jane');
      await p.locator('[data-test="lastName"]').fill('Doe');
      await p.locator('[data-test="postalCode"]').fill('12345');
      await p.locator('[data-test="continue"]').click();
      await p.waitForTimeout(600);
      const currentUrl = p.url();
      const stuckOnStep1 = /checkout-step-one/.test(currentUrl);
      const errMsg = await p.locator('[data-test="error"]').innerText().catch(() => '');
      await shot(p, 'bug-006-problem-user-checkout-firstname.png');
      if (stuckOnStep1 || errMsg) {
        log('problem_user', '006',
          'Checkout info form rejects valid data or gets stuck on step one',
          `Stuck on step-one: ${stuckOnStep1} | Error: "${errMsg}" | URL: ${currentUrl}`);
      }
    }

    await p.close();
  }

  // ── standard_user ─────────────────────────────────────────────────────────────
  {
    const p = await ctx.newPage();
    await login(p, 'standard_user');
    await p.waitForURL(/inventory/);

    // Footer copyright year
    const footer = await p.locator('.footer_copy').innerText().catch(() => '');
    await shot(p, 'bug-007-footer-copyright.png');
    log('standard_user', '007',
      'Footer copyright year is stale',
      `Footer text: "${footer.trim()}"`);

    // Sort price high→low then verify order is descending
    await p.locator('[data-test="product-sort-container"]').selectOption('hilo');
    await p.waitForTimeout(400);
    const prices = await allPrices(p);
    const nums   = prices.map(p => parseFloat(p.replace('$', '')));
    const desc   = nums.every((v, i) => i === 0 || nums[i - 1] >= v);
    await shot(p, 'bug-008-standard-user-sort-price.png');
    if (!desc) {
      log('standard_user', '008',
        'Sort by Price (high to low) does not produce correct descending order',
        `Prices returned: ${prices.join(', ')}`);
    } else {
      log('standard_user', '008-OK',
        'Sort Price high→low works correctly',
        prices.join(', '));
    }

    // Verify images are all different (should be unlike problem_user)
    const srcs   = await p.locator('.inventory_item img').evaluateAll(
      els => els.map(e => e.getAttribute('src'))
    );
    const unique = [...new Set(srcs)];
    log('standard_user', 'IMG',
      'Product image diversity check',
      `${srcs.length} products, ${unique.length} unique images`);

    // About link in hamburger menu
    await p.locator('#react-burger-menu-btn').click();
    await p.waitForTimeout(300);
    const aboutHref = await p.locator('[data-test="about-sidebar-link"]').getAttribute('href').catch(() => '');
    await shot(p, 'bug-009-hamburger-about-link.png');
    log('standard_user', '009',
      '"About" link in hamburger menu navigates away from the app',
      `href: "${aboutHref}"`);

    await p.close();
  }

  await browser.close();

  console.log('\n══════════════════════════════════════════');
  console.log('EXPLORATION COMPLETE — findings summary:');
  findings.forEach(f => console.log(`  ${f.id}: [${f.user}] ${f.title}`));
  console.log('Screenshots saved to:', SHOTS);
})().catch(err => { console.error(err); process.exit(1); });
