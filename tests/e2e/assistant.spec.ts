import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
});

test('streams a reply with retrieval sources and clears the conversation', async ({ page }) => {
  await page
    .getByRole('textbox', { name: 'Ask me anything' })
    .fill('What does the Studio plan cost?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText('$24');
  await expect(page.locator('[data-orfin-root] .source')).toHaveText('Your Studio plan');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear conversation' }).click();
  await expect(page.locator('[data-orfin-root] .message')).toHaveCount(0);
});

test('keeps the current tour step when asking a question', async ({ page }) => {
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour', exact: true });
  await expect(tour).toContainText('1 / 4');
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(tour).toContainText('2 / 4');
  await expect(page.locator('[data-orfin-root] .spotlight')).toHaveCSS('box-shadow', /0\.7/);
  await tour.getByRole('button', { name: 'Ask', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Ask me anything' })
    .fill('Which project is closest to done?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText('Brand refresh');
  const controls = page.getByRole('navigation', { name: 'Tour controls', exact: true });
  await expect(tour).toHaveCount(0);
  await expect(controls).toContainText('2 / 4');
  await controls.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(controls).toContainText('3 / 4');
  await controls.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(controls).toContainText('4 / 4');
  await page.keyboard.press('Escape');
  await expect(tour).toHaveCount(0);
  await expect(page.locator('[data-orfin-root] .spotlight')).toHaveCount(0);
});

test('selects a section without activating its underlying project link', async ({ page }) => {
  await page
    .locator('[data-orfin-root] .suggestion')
    .filter({ hasText: 'Ask about a section' })
    .click();
  await page.locator('[data-orfin-section="projects"]').hover({ position: { x: 60, y: 35 } });
  await expect(page.locator('[data-orfin-root] .spotlight')).toBeVisible();
  await page.locator('[data-orfin-section="projects"]').click({ position: { x: 65, y: 37 } });
  await expect(page.locator('[data-orfin-root] .context')).toContainText('Active projects');
  await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText(
    'Active projects',
  );
  await expect(page.locator('.project-modal')).toHaveCount(0);
});

test('offers hover help, remembers No, and closes on outside clicks', async ({ page }) => {
  await page.evaluate(() => {
    window.__orfin!.close();
    window.__orfin!.forget();
    window.__orfin!.updateSettings({ hoverDelay: 350, hoverCooldown: 0 });
  });
  await page.locator('[data-orfin-section="welcome"]').hover();
  const hover = page.getByRole('dialog', { name: 'Need a hand with this section?' });
  await expect(hover).toBeVisible();
  await hover.getByRole('button', { name: 'No, thanks' }).click();
  await page.locator('h1').hover();
  await page.locator('[data-orfin-section="welcome"]').hover();
  await expect(hover).toHaveCount(0);
  expect(await page.evaluate(() => window.__orfin!.memory.has('welcome'))).toBe(true);
  await page.locator('[data-orfin-section="projects"]').hover({ position: { x: 30, y: 20 } });
  await expect(hover).toBeVisible();
  await page.locator('h1').click();
  await expect(hover).toHaveCount(0);
});

test('navigates to a registered page from chat', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Open the knowledge page');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little shared knowledge.' })).toBeVisible();
  await expect(page.locator('[data-orfin-root] .spotlight')).toBeVisible();
});

test('switches presets, disables features and supports Russian', async ({ page }) => {
  await page.evaluate(() => window.__orfin!.close());
  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('button', { name: 'Playground' })
    .click();
  await page.getByRole('button', { name: 'Midnight', exact: true }).click();
  await page.getByRole('switch', { name: 'Section selection' }).click();
  await page.getByLabel('Language', { exact: true }).selectOption('ru');
  await page.getByRole('button', { name: 'Спросить Orfin' }).click();
  await expect(page.locator('[data-orfin-root] .orfin')).toHaveAttribute('data-theme', 'midnight');
  await expect(page.locator('[data-orfin-root] .welcome')).toContainText('Привет, я Orfin.');
  await expect(
    page.locator('[data-orfin-root]').getByRole('button', { name: 'Спросить про секцию' }),
  ).toHaveCount(0);
});

test('cancels a response and can send a subsequent message', async ({ page }) => {
  await page.getByRole('button', { name: 'Explain this page', exact: true }).click();
  await page.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Hello');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[data-orfin-root] .message.assistant').last()).toContainText(
    'Northstar',
  );
});

test('mobile widget fits the viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.locator('[data-orfin-root] .panel').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Guided tour' })).toBeVisible();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await expect(tour).toContainText('1 / 3');
  await tour.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Tour controls' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Tour controls' })
    .getByRole('button', { name: 'Next', exact: true })
    .click();
  await expect(page.locator('[data-orfin-root] .context')).toContainText('Active projects');
});

test('assistant has no serious accessibility violations', async ({ page }) => {
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
  ).toEqual([]);
});
