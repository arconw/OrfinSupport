import { chromium } from '@playwright/test';
import sharp from 'sharp';
import gifenc from 'gifenc';
import { mkdir, writeFile } from 'node:fs/promises';

const { GIFEncoder, quantize, applyPalette } = gifenc;
await mkdir('docs/assets', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
const baseURL = process.env.ORFIN_CAPTURE_URL ?? 'http://127.0.0.1:4173';
await page.goto(baseURL);
await page.waitForLoadState('networkidle');
await page.waitForTimeout(800);
await page.locator('[data-orfin-root] textarea').blur();
await page.screenshot({ path: 'docs/assets/playground.png', animations: 'disabled' });
await page.setViewportSize({ width: 1080, height: 800 });
const gif = GIFEncoder();
const frames = [];
const capture = async (delay) => {
  frames.push({ screenshot: await page.screenshot(), delay });
};
const captureStill = async (path) => {
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path, animations: 'disabled' });
  await page.setViewportSize(viewport);
};
const transition = async (count = 6) => {
  for (let index = 0; index < count; index++) {
    const start = Date.now();
    await capture(70);
    await page.waitForTimeout(Math.max(0, 70 - (Date.now() - start)));
  }
};
await capture(1500);
await page.evaluate(() => window.__orfin.close());
await transition(4);
await capture(350);
await page.evaluate(() => window.__orfin.open());
await transition(9);
await page.locator('[data-orfin-root] .actions-trigger').evaluate((button) => button.click());
await transition();
await captureStill('docs/assets/actions.png');
await capture(1300);
await page.keyboard.press('Escape');
await transition(4);
await page
  .locator('[data-orfin-root] .header .icon-button')
  .first()
  .evaluate((button) => button.click());
await transition();
await capture(800);
await page
  .locator('[data-orfin-root] .header .icon-button')
  .first()
  .evaluate((button) => button.click());
await transition();
await page.getByRole('button', { name: 'Show me around', exact: true }).click();
await page.getByRole('dialog', { name: 'Guided tour' }).waitFor();
await capture(1700);
await page
  .getByRole('dialog', { name: 'Guided tour' })
  .getByRole('button', { name: 'Next', exact: true })
  .click();
await capture(1700);
await page
  .getByRole('dialog', { name: 'Guided tour' })
  .getByRole('button', { name: 'Ask', exact: true })
  .click();
await page
  .getByRole('textbox', { name: 'Ask me anything' })
  .fill('Which project is closest to done?');
await capture(700);
await page.getByRole('button', { name: 'Send message', exact: true }).click();
await transition(5);
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(210);
  await capture(210);
}
await page.getByRole('button', { name: 'Send message', exact: true }).waitFor();
await transition(5);
await capture(1900);
await page
  .getByRole('navigation', { name: 'Tour controls' })
  .getByRole('button', { name: 'Next', exact: true })
  .click();
await capture(1200);
await page
  .getByRole('navigation', { name: 'Tour controls' })
  .getByRole('button', { name: 'Return to tour', exact: true })
  .click();
await page
  .getByRole('dialog', { name: 'Guided tour' })
  .getByRole('button', { name: 'End tour', exact: true })
  .click();
await page.evaluate(() => {
  window.__orfin.clear();
  window.__orfin.pick();
});
await page.locator('[data-orfin-section="capacity"]').hover({ position: { x: 90, y: 80 } });
await capture(1300);
await page.locator('[data-orfin-section="capacity"]').click({ position: { x: 90, y: 80 } });
await page.getByRole('button', { name: 'Send message', exact: true }).waitFor();
await capture(1800);
await page.evaluate(() => {
  window.__orfin.updateSettings({ theme: 'midnight' });
});
await capture(1400);
await page.evaluate(() => {
  window.__orfin.clear();
  window.__orfin.clearHighlight();
  window.__orfin.updateSettings({ theme: 'cloud' });
});
const ask = async (query, command) => {
  await page.evaluate(() => window.__orfin.open());
  if (command) {
    await page.locator('[data-orfin-root] .actions-trigger').click();
    await capture(1100);
    await page.getByRole('menuitem', { name: command, exact: true }).click();
  } else {
    await page.locator('[data-orfin-root] textarea').fill(query);
    await capture(900);
    await page.locator('[data-orfin-root] .send').click();
  }
  await transition(4);
  for (let index = 0; index < 4; index++) {
    await page.waitForTimeout(260);
    await capture(260);
  }
  await page.locator('[data-orfin-root] [role="log"][aria-busy="false"]').waitFor();
  await transition(4);
  await page.locator('[data-orfin-root] textarea').blur();
  await capture(2200);
};
await page.goto(`${baseURL}/#/reports`);
await page.evaluate(() => window.__orfin.close());
await captureStill('docs/assets/report.png');
await capture(1400);
await ask('Analyze delivery. Compare Brand and Web and cite the evidence.');
await page.goto(`${baseURL}/#/shop`);
await page.evaluate(() => window.__orfin.close());
await captureStill('docs/assets/shop.png');
await capture(1400);
await ask('Compare Luma 27 and Luma 32 Pro for a small desk.', 'Compare products');
await ask('Find the 3-star review for the second product. Why that rating?');
await page.evaluate(() => window.__orfin.clear());
await ask('Open Luma 27 and add two to my cart.');
await captureStill('docs/assets/commerce.png');
await page.evaluate(() =>
  window.__orfin.updateSettings({
    theme: 'forest',
    logo: { src: './northstar-mark.svg', alt: 'Northstar assistant' },
  }),
);
await capture(1500);
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
  const panel = await page
    .locator('[data-orfin-root] .panel')
    .screenshot({ animations: 'disabled' });
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
await page.locator('[data-orfin-root] .launcher').click();
await page.locator('[data-orfin-root] textarea').blur();
await captureStill('docs/assets/host-appearance.png');
await capture(2000);
for (const { screenshot, delay } of frames) {
  const { data, info } = await sharp(screenshot)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const palette = quantize(data, 192);
  gif.writeFrame(applyPalette(data, palette), info.width, info.height, { palette, delay });
}
gif.finish();
await writeFile('docs/assets/demo.gif', gif.bytes());
await page.evaluate(() => {
  window.__orfin.clear();
  window.__orfin.clearHighlight();
  window.__orfin.updateSettings({ theme: 'cloud', logo: null });
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'docs/assets/mobile.png', animations: 'disabled' });
await browser.close();
process.stdout.write('Saved actual browser recordings to docs/assets.\n');
