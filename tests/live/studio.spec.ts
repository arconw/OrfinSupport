import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const root = '[data-orfin-root]';
async function ask(page: Page, query: string, tool: string) {
  const responseReady = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/orfin' && response.request().method() === 'POST',
  );
  await page.locator(`${root} textarea`).fill(query);
  await page.locator(`${root} .send`).click();
  const response = await responseReady;
  expect(response.status()).toBe(200);
  const body = await response.text();
  const events = body
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => JSON.parse(line.slice(6)));
  expect(events.filter((event) => event.type === 'error')).toEqual([]);
  expect(
    events
      .filter((event) => event.type === 'tool' && event.tool.name === tool)
      .map((event) => event.tool.status),
  ).toEqual(['running', 'complete']);
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false', {
    timeout: 90000,
  });
  await expect(page.locator(`${root} textarea`)).toHaveValue('');
  return page.locator(`${root} .message.assistant`).last();
}

test('live tools open a product, persist the visitor cart and support quantity/removal', async ({
  page,
}, testInfo) => {
  test.setTimeout(240000);
  await page.goto('/#/shop');
  await page.getByLabel('Assistant provider').selectOption('live');
  await ask(page, 'Open Luma 27 and add two to my demo cart. Use the actual tools.', 'update_cart');
  await expect(page).toHaveURL(/#\/shop\/luma-27$/);
  await expect(page.getByLabel('Luma 27 quantity', { exact: true })).toHaveText('2');
  await expect(page.locator('.cart-total')).toContainText('$698');
  await ask(page, 'Set the Luma 27 quantity to exactly 1 in my cart.', 'update_cart');
  await expect(page.getByLabel('Luma 27 quantity', { exact: true })).toHaveText('1');
  await expect(page.locator('.cart-total')).toContainText('$349');
  await page.screenshot({ path: testInfo.outputPath('live-cart.png') });
  await ask(page, 'Remove Luma 27 from my cart.', 'update_cart');
  await expect(page.locator('.cart-total')).toContainText('$0');
});

test('live comparison and three-star review in Russian follow the real catalog', async ({
  page,
}, testInfo) => {
  test.setTimeout(240000);
  await page.goto('/');
  await page.getByLabel('Assistant provider').selectOption('live');
  await page.evaluate(() => window.__orfin!.setLocale('ru'));
  const comparison = await ask(
    page,
    'Compare Luma 27 and Luma 32 Pro. Use compare_products, show the result and explain who each is suitable for.',
    'compare_products',
  );
  await expect(page).toHaveURL(/#\/compare$/);
  await expect(comparison).toContainText('250');
  expect(((await comparison.innerText()).match(/[А-Яа-яЁё]/gu) ?? []).length).toBeGreaterThan(40);
  const review = await ask(
    page,
    'Find the 3-star review for the second product, Luma 32 Pro. Use product_reviews, quote a short exact excerpt and explain the reasons without guessing.',
    'product_reviews',
  );
  await expect(page).toHaveURL(/#\/shop\/luma-32-pro$/);
  await expect(review).toContainText(/Maya Chen|Майя Чен/);
  await expect(review).toContainText('140');
  await expect(review).toContainText('90');
  expect(((await review.innerText()).match(/[А-Яа-яЁё]/gu) ?? []).length).toBeGreaterThan(40);
  await expect(page.locator('.cart-total')).toContainText('$0');
  await page.screenshot({ path: testInfo.outputPath('live-review-ru.png') });
});

test('live analytics interprets changes and cites the evidence', async ({ page }, testInfo) => {
  await page.goto('/#/reports');
  await page.getByLabel('Assistant provider').selectOption('live');
  const answer = await ask(
    page,
    'Analyze the delivery report with get_delivery_report. Compare both three-week periods and Brand versus Web. Cite DL-041 and DL-052, distinguish evidence from causal proof, and show the chart.',
    'get_delivery_report',
  );
  for (const value of ['48', '66', '37.5', '50', '25', 'DL-041', 'DL-052'])
    await expect(answer).toContainText(value);
  await expect(page).toHaveURL(/#\/reports$/);
  await expect(page.locator('.report-number')).toContainText('66');
  await page.screenshot({ path: testInfo.outputPath('live-analysis.png') });
});
