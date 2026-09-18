import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = '[data-orfin-root]';
test('new pages have no serious accessibility violations', async ({ page }) => {
  for (const route of ['reports', 'shop', 'shop/luma-32-pro', 'compare', 'settings']) {
    await page.goto(`/#/${route}`);
    await page.evaluate(() => window.__orfin!.close());
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
      route,
    ).toEqual([]);
  }
});
async function ask(page: import('@playwright/test').Page, query: string) {
  await page.evaluate(() => window.__orfin!.open());
  await page.locator(`${root} textarea`).fill(query);
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(`${root} textarea`)).toHaveValue('');
}

test('demo tools open products and actually add, set and remove cart quantities', async ({
  page,
}) => {
  await page.goto('/');
  await ask(page, 'Open Luma 27 and add two to my cart.');
  await expect(page).toHaveURL(/#\/shop\/luma-27$/);
  await expect(page.locator(`${root} .tool`)).toHaveText([
    'open product · Done',
    'update cart · Done',
  ]);
  await expect(page.getByLabel('Luma 27 quantity', { exact: true })).toHaveText('2');
  await expect(page.locator('.cart-total')).toContainText('$698');
  await ask(page, 'Set Luma 27 quantity to 1.');
  await expect(page.getByLabel('Luma 27 quantity', { exact: true })).toHaveText('1');
  await ask(page, 'Remove Luma 27 from my cart.');
  await expect(page.locator('.cart-items')).toHaveCount(0);
  await expect(page.locator('.cart-total')).toContainText('$0');
});

test('comparison and a specific three-star review use catalog evidence without modifying the cart', async ({
  page,
}) => {
  await page.goto('/');
  await ask(page, 'Compare Luma 27 and Luma 32 Pro for a small desk.');
  await expect(page).toHaveURL(/#\/compare$/);
  await expect(page.locator('.comparison-table')).toContainText('65 W');
  await expect(page.locator('.comparison-table')).toContainText('90 W');
  await expect(page.locator(`${root} .message.assistant`).last()).toContainText('$250');
  await ask(page, 'Find the 3-star review for the second product and explain the rating.');
  await expect(page).toHaveURL(/#\/shop\/luma-32-pro$/);
  const answer = page.locator(`${root} .message.assistant`).last();
  await expect(answer).toContainText('Maya Chen');
  await expect(answer).toContainText('140 W');
  await expect(answer).toContainText('28 × 24 cm');
  await expect(page.locator('[data-review-id="l32-2"]')).toContainText(
    'Beautiful color, but my laptop still needs its charger.',
  );
  await expect(page.locator('.cart-total')).toContainText('$0');
});

test('report numbers reconcile and English questions produce answers in the selected language', async ({
  page,
}) => {
  await page.goto('/#/reports');
  await page.evaluate(() => window.__orfin!.setLocale('ru'));
  await ask(page, 'Analyze delivery. Compare Brand and Web and explain the evidence.');
  const answer = page.locator(`${root} .message.assistant`).last();
  await expect(answer).toContainText('48 → 66');
  await expect(answer).toContainText('37,5%');
  await expect(answer).toContainText('причинность не доказана');
  await expect(answer).toContainText('DL-041');
  await expect(answer).toContainText('DL-052');
  await expect(page.locator('.report-number')).toContainText('66');
  await expect(page.locator('.segment-table')).toContainText('50%');
  await ask(page, 'Compare Luma 27 and Luma 32 Pro. Reply in English.');
  await expect(page.locator(`${root} .message.assistant`).last()).toContainText('A sensible fit');
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('lang', 'ru');
});

test('tools disabled cannot mutate the demo cart', async ({ page }) => {
  await page.goto('/#/shop');
  await page.evaluate(() => window.__orfin!.updateSettings({ features: { tools: false } }));
  await ask(page, 'Add Luma 27 to my cart.');
  await expect(page.locator(`${root} .message.assistant`)).toContainText('turned off');
  await expect(page.locator(`${root} .tool`)).toHaveCount(0);
  await expect(page.locator('.cart-total')).toContainText('$0');
});

test('mobile reports, comparison and product pages have no document overflow and working controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const path of ['reports', 'shop', 'compare', 'shop/luma-32-pro']) {
    await page.goto(`/#/${path}`);
    await page.evaluate(() => window.__orfin!.close());
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  }
  await page.getByRole('button', { name: 'Add to demo cart', exact: true }).click();
  await expect(page.getByLabel('Luma 32 Pro quantity', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Increase Luma 32 Pro quantity', exact: true }).click();
  await expect(page.locator('.cart-total')).toContainText('$1,198');
  await page.getByRole('button', { name: 'Remove Luma 32 Pro', exact: true }).click();
  await expect(page.locator('.cart-total')).toContainText('$0');
});
