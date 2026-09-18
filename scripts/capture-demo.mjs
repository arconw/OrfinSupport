import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { captureAnimatedDemo } from './capture-gif.mjs';
import { mkdir } from 'node:fs/promises';

await mkdir('docs/assets', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
const baseURL = process.env.ORFIN_CAPTURE_URL ?? 'http://127.0.0.1:4173';
const root = page.locator('[data-orfin-root]');
const captureStill = async (name) => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `docs/assets/${name}.png`, animations: 'disabled' });
};
try {
  await page.goto(baseURL);
  await expect(root.locator('.panel')).toBeVisible();
  await root.locator('textarea').blur();
  await captureStill('playground');
  await root.locator('.actions-trigger').click();
  await captureStill('actions');
  for (const [route, name] of [
    ['reports', 'report'],
    ['shop', 'shop'],
  ]) {
    await page.goto(`${baseURL}/#/${route}`);
    await page.evaluate(() => window.__orfin.close());
    await captureStill(name);
  }
  await page.evaluate(() => window.__orfin.open());
  await root.locator('textarea').fill('Open Luma 27 and add two to my cart.');
  await root.locator('.send').click();
  await expect(root.locator('[role="log"]')).toHaveAttribute('aria-busy', 'false');
  await expect(root.locator('.message.assistant')).not.toBeEmpty();
  await captureStill('commerce');
  const themeImages = [];
  for (const theme of [
    'cloud',
    'iris',
    'lagoon',
    'sand',
    'rose',
    'midnight',
    'graphite',
    'forest',
    'plum',
    'espresso',
  ]) {
    await page.evaluate((theme) => {
      window.__orfin.clear();
      window.__orfin.updateSettings({ theme, logo: null });
      window.__orfin.open();
    }, theme);
    const panel = await root.locator('.panel').screenshot({ animations: 'disabled' });
    themeImages.push(await sharp(panel).resize(189, 310).toBuffer());
  }
  await sharp({ create: { width: 1025, height: 665, channels: 4, background: '#eef2f8' } })
    .composite(
      themeImages.map((input, index) => ({
        input,
        left: 16 + (index % 5) * 202,
        top: 15 + Math.floor(index / 5) * 325,
      })),
    )
    .png()
    .toFile('docs/assets/themes.png');
  await page.goto(`${baseURL}/#/settings`);
  await page.evaluate(() => window.__orfin.close());
  await page.getByRole('button', { name: /Northstar appearance/ }).click();
  await root.locator('.launcher').click();
  await root.locator('textarea').blur();
  await captureStill('host-appearance');
  await page.evaluate(() => {
    window.__orfin.clear();
    window.__orfin.clearHighlight();
    window.__orfin.updateSettings({ theme: 'cloud', logo: null });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await captureStill('mobile');
} finally {
  await context.close();
  await browser.close();
}
await captureAnimatedDemo(baseURL);
process.stdout.write('Saved actual browser recordings to docs/assets.\n');
