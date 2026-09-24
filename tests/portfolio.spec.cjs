const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Tests must never send real email, even if an assertion fails.
  await page.route('https://api.web3forms.com/**', (route) => route.abort());
});

test('production assets, anchors, CSP, and project-relative deployment', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(response.url());
  });
  await page.goto('/Portfolio/');
  await page.waitForTimeout(4000);
  expect(await page.locator('script:not([src])').count()).toBe(0);
  expect(
    await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),
  ).toContain("script-src 'self'");
  expect(
    await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
      return (
        ids.length === new Set(ids).size &&
        [...document.querySelectorAll('a[href^="#"]')].every((a) =>
          document.getElementById(a.hash.slice(1)),
        )
      );
    }),
  ).toBe(true);
  const resume = await page.request.get('/Portfolio/assets/resume.pdf');
  expect(resume.status()).toBe(200);
  expect((await resume.body()).subarray(0, 4).toString()).toBe('%PDF');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(errors).toEqual([]);
});

test('uniform automatic typography and reduced motion', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('utsav-visited', 'true'));
  await page.goto('/');
  await expect(page.locator('#type-line-one')).toHaveText('UTSAV');
  await expect(page.locator('#type-line-one')).toHaveText('ENGINEERING', { timeout: 6500 });
  expect(await page.locator('#type-pause,#type-position,#type-next').count()).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#type-line-one')).toHaveText('UTSAV');
  await page.waitForTimeout(4000);
  await expect(page.locator('#type-line-one')).toHaveText('UTSAV');
});

test('theme persists and particles are lazy and respect reduced motion', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.page-particle').count()).toBe(0);
  await page.click('#u2-theme');
  const theme = await page.locator('html').getAttribute('data-theme');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await page.click('#page-field-toggle');
  expect(await page.locator('.page-particle').count()).toBeGreaterThan(200);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#page-field-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('auction rules, HIP shared state, Plexi XSS handling, and four carousel panels', async ({
  page,
}) => {
  await page.goto('/');
  await page.fill('#u2-amount', '240');
  await page.click('#u2-bidform button');
  await expect(page.locator('#u2-feedback')).toContainText('Not accepted');
  await page.fill('#u2-amount', '300');
  await page.click('#u2-bidform button');
  await expect(page.locator('#u2-price')).toHaveText('$300');
  await page.click('[data-stage="closed"]');
  await page.fill('#u2-amount', '400');
  await page.click('#u2-bidform button');
  await expect(page.locator('#u2-price')).toHaveText('$300');
  await page.click('[data-hip="charge"]');
  await expect(page.locator('#hip-dashboard')).toContainText('No incoming handoff');
  await page.click('[data-hip="ems"]');
  await page.click('[data-action="send"]');
  await page.click('[data-hip="charge"]');
  await page.click('[data-action="assign"]');
  await page.click('[data-action="clean"]');
  await page.click('[data-hip="staff"]');
  await expect(page.locator('#hip-dashboard')).toContainText('Bed 04');
  await expect(page.locator('#hip-dashboard')).toContainText('cleaning assigned to Alex');
  await page.click('[data-role="helper"]');
  await page.click('[data-offer]');
  await page.click('[data-switch]');
  await page.click('[data-role="requester"]');
  await expect(page.locator('#plexi-dashboard')).toContainText('1 offer received');
  const attack = '<img src=x onerror="window.injected=true">';
  await page.fill('[name="task"]', attack);
  await page.click('#plexi-task-form button');
  await expect(page.locator('#plexi-tasks')).toContainText(attack);
  expect(await page.locator('#plexi-tasks img').count()).toBe(0);
  const photos = new Set();
  for (let i = 0; i < 4; i++) {
    const href = await page.locator('#u2-litho-photo').getAttribute('href');
    photos.add(href);
    expect((await page.request.get('/' + href)).status()).toBe(200);
    await page.click('#u2-next');
  }
  expect(photos.size).toBe(4);
  await page.click('#u2-cutaway');
  await expect(page.locator('#u2-inside')).toHaveAttribute('visibility', 'visible');
  await page.click('#u2-lamp');
  await expect(page.locator('#u2-lamp')).toHaveAttribute('aria-pressed', 'false');
});

async function fillContact(page) {
  await page.goto('/');
  await page.fill('[name="name"]', 'Test Visitor');
  await page.fill('[name="email"]', 'visitor@example.com');
  await page.fill('[name="message"]', 'A test message that must not be delivered.');
}

test('contact success payload and duplicate suppression', async ({ page }) => {
  let requests = 0;
  await page.route('https://api.web3forms.com/submit', async (route) => {
    requests++;
    const data = route.request().postDataJSON();
    expect(data.access_key).toMatch(/^[0-9a-f-]{36}$/);
    expect(data.replyto).toBe('visitor@example.com');
    expect(data.subject).toBe('Portfolio inquiry from Test Visitor | Utsavdotcom');
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ json: { success: true } });
  });
  await fillContact(page);
  await page.click('#contact-send');
  await page
    .locator('#contact-form-new')
    .evaluate((form) => form.dispatchEvent(new Event('submit', { cancelable: true })));
  await expect(page.locator('#contact-status')).toContainText('has been sent');
  expect(requests).toBe(1);
  await expect(page.locator('[name="message"]')).toHaveValue('');
});

for (const failure of ['server', 'network', 'invalid-json', 'missing-key', 'honeypot']) {
  test(`contact ${failure} preserves message`, async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', async (route) => {
      if (failure === 'network') return route.abort();
      if (['missing-key', 'honeypot'].includes(failure))
        throw new Error('Unexpected email request');
      return route.fulfill({
        status: failure === 'server' ? 500 : 200,
        body: failure === 'invalid-json' ? 'not json' : '{"success":false}',
      });
    });
    await fillContact(page);
    if (failure === 'missing-key')
      await page.evaluate(() => {
        window.PORTFOLIO_CONFIG = {};
      });
    if (failure === 'honeypot')
      await page.locator('[name="botcheck"]').evaluate((el) => {
        el.checked = true;
      });
    await page.click('#contact-send');
    if (failure !== 'honeypot') await expect(page.locator('#contact-status')).not.toHaveText('');
    await expect(page.locator('#contact-send')).toBeEnabled();
    await expect(page.locator('[name="message"]')).toHaveValue(
      'A test message that must not be delivered.',
    );
  });
}

test('no-JavaScript form cannot leak message in URL', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8766/');
  await expect(page.locator('#contact-send')).toBeDisabled();
  await expect(page.locator('noscript p')).toBeVisible();
  await expect(page.locator('#contact-form-new')).toHaveAttribute('method', 'post');
  await context.close();
});

test('contact keeps edits made during delivery', async ({ page }) => {
  let release;
  await page.route('https://api.web3forms.com/submit', async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: { success: true } });
  });
  await fillContact(page);
  await page.click('#contact-send');
  await expect.poll(() => Boolean(release)).toBe(true);
  await page.fill('[name="message"]', 'Newer draft');
  release();
  await expect(page.locator('#contact-status')).toContainText('newer edits have been kept');
  await expect(page.locator('[name="message"]')).toHaveValue('Newer draft');
});

test('contact timeout preserves the draft and restores submission', async ({ page }) => {
  await page.clock.install();
  await page.route('https://api.web3forms.com/submit', () => {});
  await fillContact(page);
  await page.click('#contact-send');
  await page.clock.fastForward(21000);
  await expect(page.locator('#contact-status')).toContainText("couldn't confirm delivery");
  await expect(page.locator('#contact-send')).toBeEnabled();
  await expect(page.locator('[name="message"]')).toHaveValue(
    'A test message that must not be delivered.',
  );
});
