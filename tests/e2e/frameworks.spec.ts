import { expect, test } from '@playwright/test';

for (const framework of ['vanilla', 'react', 'vue', 'angular']) {
  test(`${framework}: mounts, isolates styles, answers, and cleans up`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/fixtures.html?framework=${framework}`);
    await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
    await expect(page.locator('[data-orfin-root] .send')).toHaveCSS('border-width', '0px');
    await expect(page.locator('[data-orfin-root] textarea')).toHaveCSS('font-size', '12px');
    await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Hello from this framework');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText('Northstar');
    await page.locator('#unmount').click();
    await expect(page.locator('[data-orfin-root]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('full-page extraction excludes inputs and private regions', async ({ page }) => {
  await page.goto('/fixtures.html');
  await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
  const content = await page.evaluate(() => window.__orfin!.registry.page('page'));
  expect(content.text).toContain('Public fixture information');
  expect(content.text).not.toContain('PRIVATE_INPUT_SENTINEL');
  expect(content.text).not.toContain('PRIVATE_SECTION_SENTINEL');
  expect(content.sections.some((section) => section.title === 'Unmarked area')).toBe(true);
  const limited = await page.evaluate(() => window.__orfin!.registry.page('sections'));
  expect(limited.text).toBeUndefined();
  expect(limited.sections.some((section) => section.title === 'Unmarked area')).toBe(false);
});

test('opens a new document and restores its section highlight', async ({ page }) => {
  await page.goto('/fixtures.html');
  await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
  await page.evaluate(() => {
    void window.__orfin!.highlight('remote');
  });
  await page.waitForURL('**/destination.html');
  await expect(page.locator('[data-orfin-root] .spotlight')).toBeVisible();
  await expect(page.locator('[data-orfin-root] .spot-label')).toHaveText('Destination section');
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test('blocks unregistered and external navigation', async ({ page }) => {
  await page.goto('/fixtures.html');
  await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
  const results = await page.evaluate(async () => {
    const outcomes: boolean[] = [];
    for (const path of ['https://evil.test', 'javascript:alert(1)', '/unregistered']) {
      try {
        await window.__orfin!.navigate(path);
        outcomes.push(false);
      } catch {
        outcomes.push(true);
      }
    }
    return outcomes;
  });
  expect(results).toEqual([true, true, true]);
});

test('supports keyboard section selection and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/fixtures.html');
  await page
    .locator('[data-orfin-root] .suggestion')
    .filter({ hasText: 'Ask about a section' })
    .click();
  await page.locator('[data-orfin-root] .section-list summary').focus();
  await page.keyboard.press('Enter');
  await page
    .locator('[data-orfin-root] .section-list')
    .getByRole('button', { name: 'Fixture tools' })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-orfin-root] .context')).toContainText('Fixture tools');
  await expect(page.locator('[data-orfin-root] .panel')).toHaveCSS('animation-name', 'none');
});
