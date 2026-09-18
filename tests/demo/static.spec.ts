import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 320, height: 568 },
]) {
  test(`static demo explains local-only Live AI and uses sandbox at ${viewport.width}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    const apiRequests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url());
    });
    await page.setViewportSize(viewport);
    await page.goto('/');
    const provider = page.getByLabel('Assistant provider');
    await expect(provider).toHaveValue('demo');
    const liveOption = provider.locator('option[value="live"]');
    await expect(liveOption).toHaveJSProperty('disabled', true);
    await expect(liveOption).toHaveText('Live AI · setup required');
    await expect(provider).toHaveAccessibleDescription(/Explore Live AI/u);
    await provider.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(provider).toHaveValue('demo');
    const root = page.locator('[data-orfin-root]');
    await root.locator('textarea').fill('What does the Studio plan cost?');
    await root.locator('.send').click();
    await expect(root.locator('.message.assistant')).toContainText('$24');
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
    await expect(root.locator('textarea')).toHaveValue('');
    await root.locator('.header .icon-button').first().click();
    await expect(root.locator('#orfin-language option')).toHaveCount(16);
    await root.locator('#orfin-language').selectOption('fr');
    await expect(root.locator('.preferences h3')).toHaveText('Préférences de l’assistant');
    await root.locator('.header .icon-button').first().click();
    await expect(root.locator('.message.assistant')).toContainText('$24');
    expect(apiRequests).toEqual([]);
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
