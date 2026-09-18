import { expect, test } from '@playwright/test';
import { supportedThemes, themePresets } from '../../src/core/themes';

const root = '[data-orfin-root]';

test('all ten themes update the panel, controls and preference selection', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Assistant preferences', exact: true }).click();
  await expect(page.locator(`${root} .theme:not(.external-theme)`)).toHaveCount(10);
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
  await expect(page.locator(`${root} .theme:not(.external-theme)`)).toHaveCount(10);
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

for (const width of [320, 390]) {
  test(`mobile ${width} Playground fits the device and the spotlight fades`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/#/settings');
    await expect(page.locator(`${root} .panel`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.locator(`${root} .header .icon-button`).last().tap();
    await page.getByRole('button', { name: 'Espresso', exact: true }).tap();
    await page.locator(`${root} .launcher`).tap();
    await expect(page.locator(`${root} .panel`)).toHaveCSS('background-color', 'rgb(52, 44, 40)');
    await page.goto('http://127.0.0.1:4173/');
    await page.getByRole('button', { name: 'Show me around', exact: true }).tap();
    await expect(page.locator(`${root} .spotlight`)).toHaveCSS('opacity', '1');
    const frames = await page.evaluate(async () => {
      const mask = document
        .querySelector('[data-orfin-root]')!
        .shadowRoot!.querySelector('.spotlight')!;
      window.__orfin!.endTour();
      const values: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 400) {
        await new Promise(requestAnimationFrame);
        if (mask.isConnected) values.push(Number(getComputedStyle(mask).opacity));
      }
      return values;
    });
    expect(frames.some((opacity) => opacity > 0 && opacity < 1)).toBe(true);
    await context.close();
  });
}

test('host appearance removes preset CSS and supports reactive external styling without losing history', async ({
  page,
}) => {
  await page.goto('/#/settings');
  await page.evaluate(() => window.__orfin!.close());
  await page.getByRole('button', { name: /Northstar appearance/ }).click();
  await page.locator(`${root} .launcher`).click();
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('data-theme', 'none');
  expect(
    await page
      .locator(`${root}`)
      .evaluate(
        (host) => host.shadowRoot!.querySelector('[data-orfin-style="preset"]')!.textContent,
      ),
  ).toBe('');
  await expect(page.locator(`${root} .panel`)).toHaveCSS('background-color', 'rgb(255, 254, 248)');
  await page.locator(`${root} textarea`).fill('Compare Luma 27 and Luma 32 Pro.');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(`${root} .tool`)).toContainText('Done');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      styles: '.orfin { color: #112233; } .panel { background: #f0f8ff; border-radius: 0; }',
      logo: { src: './studio-mark.svg', alt: 'Host mark' },
    }),
  );
  await expect(page.locator(`${root} .panel`)).toHaveCSS('background-color', 'rgb(240, 248, 255)');
  await page.addStyleTag({
    content: '[data-orfin-root]::part(header) { border-bottom: 5px solid rgb(12, 80, 50); }',
  });
  await expect(page.locator(`${root} .header`)).toHaveCSS('border-bottom-width', '5px');
  await page.evaluate(() => window.__orfin!.updateSettings({ styles: '', theme: 'forest' }));
  await expect(page.locator(`${root} .panel`)).toHaveCSS('background-color', 'rgb(32, 51, 45)');
  await expect(page.locator(`${root} .message`)).toHaveCount(2);
  await expect(page.locator(`${root} .header img`)).toHaveAttribute('alt', 'Host mark');
});
