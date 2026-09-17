import { expect, test } from '@playwright/test';

test('renders model HTML as text and refuses executable links', async ({ page }) => {
  await page.route('**/api/orfin', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: `data: ${JSON.stringify({ type: 'delta', text: '<img src=x onerror=alert(1)> [bad](javascript:alert(1)) **Safe bold**' })}\n\ndata: {"type":"done"}\n\n`,
    }),
  );
  await page.goto('/');
  await page.getByLabel('Assistant provider').selectOption('live');
  await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Test rendering');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText('<img src=x');
  await expect(page.locator('[data-orfin-root] .message.assistant img')).toHaveCount(0);
  await expect(page.locator('[data-orfin-root] a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator('[data-orfin-root] strong')).toHaveText('Safe bold');
});

test('recovers from an HTTP failure using Retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/orfin', (route) => {
    attempts++;
    return attempts === 1
      ? route.fulfill({ status: 503, body: 'Private upstream diagnostic' })
      : route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: 'data: {"type":"delta","text":"Connection restored."}\n\ndata: {"type":"done"}\n\n',
        });
  });
  await page.goto('/');
  await page.getByLabel('Assistant provider').selectOption('live');
  await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Hello');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-orfin-root] [role="alert"]')).toContainText('503');
  await expect(page.locator('[data-orfin-root]')).not.toContainText('Private upstream diagnostic');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('[data-orfin-root] .message.assistant')).toHaveText(
    'Orfin Connection restored.',
  );
  expect(attempts).toBe(2);
});
