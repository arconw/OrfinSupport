import { expect, test } from '@playwright/test';
import { supportedThemes, themePresets } from '../../src/core/themes';

const root = '[data-orfin-root]';

test('all ten themes update the panel, controls and preference selection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Assistant preferences', exact: true }).click();
  await expect(page.locator(`${root} .theme`)).toHaveCount(10);
  for (const name of supportedThemes) {
    await page
      .locator(`${root} .theme`)
      .filter({ hasText: new RegExp(`^${name}$`, 'i') })
      .click();
    await expect(page.locator(`${root} .orfin`)).toHaveAttribute('data-theme', name);
    await expect(page.locator(`${root} .orfin`)).toHaveCSS(
      'color-scheme',
      themePresets[name].scheme,
    );
    await expect(page.locator(`${root} .panel`)).toHaveCSS(
      'border-radius',
      themePresets[name].radius,
    );
    await expect(page.locator(`${root} .theme[aria-pressed="true"]`)).toHaveCount(1);
  }
});

test('Playground logo changes every assistant surface and broken images fall back', async ({
  page,
}) => {
  await page.goto('/#/settings');
  await page.evaluate(() => window.__orfin!.close());
  await page.getByLabel('Assistant logo', { exact: true }).selectOption('northstar');
  await expect(page.locator(`${root} .launcher img`)).toHaveAttribute('alt', 'Northstar assistant');
  await page.locator(`${root} .launcher`).click();
  await expect(page.locator(`${root} .header img`)).toHaveAttribute('src', /northstar-mark\.svg$/);
  await expect(page.locator(`${root} .welcome-mark img`)).toHaveAttribute(
    'src',
    /northstar-mark\.svg$/,
  );
  await page.evaluate(() =>
    window.__orfin!.updateSettings({ logo: { src: './studio-mark.svg', alt: 'New studio' } }),
  );
  await expect(page.locator(`${root} .header img`)).toHaveAttribute('alt', 'New studio');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      logo: { src: 'data:image/png;base64,broken', alt: 'Broken logo' },
    }),
  );
  await expect(page.locator(`${root} .orfin-logo img`)).toHaveCount(0);
  await expect(page.locator(`${root} .header .orfin-logo [role="img"]`)).toHaveAttribute(
    'aria-label',
    'Orfin',
  );
  await page.evaluate(() => window.__orfin!.updateSettings({ logo: null }));
  await expect(page.locator(`${root} .header .orfin-logo svg`)).toBeVisible();
});

test('spotlight keeps one mask between targets, supports custom opacity and fades out', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const spotlight = page.locator(`${root} .spotlight`);
  await expect(spotlight).toHaveCSS('opacity', '1');
  await expect(spotlight).toHaveCSS('box-shadow', /0\.15/);
  await spotlight.evaluate((element) => element.setAttribute('data-retained', 'yes'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(spotlight).toHaveAttribute('data-retained', 'yes');
  await expect(spotlight).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.__orfin!.updateSettings({ highlightOpacity: 0.7 }));
  await expect(spotlight).toHaveCSS('box-shadow', /0\.7/);
  await page.getByRole('button', { name: 'End tour', exact: true }).click();
  await expect(spotlight).toHaveCount(0);
});

test('dark presets, custom logo and Arabic preferences fit a compact viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      locale: 'ar',
      theme: 'forest',
      logo: { src: './studio-mark.svg', alt: 'Studio' },
    }),
  );
  await page.locator(`${root} .header .icon-button`).first().click();
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('dir', 'rtl');
  await expect(page.locator(`${root} .theme`)).toHaveCount(10);
  const panel = await page.locator(`${root} .panel`).boundingBox();
  expect(panel!.x).toBeGreaterThanOrEqual(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(320);
  expect(
    await page
      .locator(`${root} .preferences`)
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await page.evaluate(() => window.__orfin!.startTour());
  await expect(page.locator(`${root} .spotlight`)).toHaveCSS('transition-duration', '0s');
});
