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
  reducedMotion: 'reduce',
});
const page = await context.newPage();
await page.goto(process.env.ORFIN_CAPTURE_URL ?? 'http://127.0.0.1:4173');
await page.waitForLoadState('networkidle');
await page.locator('[data-orfin-root] textarea').blur();
await page.screenshot({ path: 'docs/assets/playground.png', animations: 'disabled' });
const gif = GIFEncoder();
const capture = async (delay) => {
  const screenshot = await page.screenshot({ animations: 'disabled' });
  const { data, info } = await sharp(screenshot)
    .resize(1080, 750)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const palette = quantize(data, 192);
  gif.writeFrame(applyPalette(data, palette), info.width, info.height, { palette, delay });
};
await capture(1500);
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
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(210);
  await capture(210);
}
await page.getByRole('button', { name: 'Send message', exact: true }).waitFor();
await capture(1900);
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
gif.finish();
await writeFile('docs/assets/demo.gif', gif.bytes());
await page.evaluate(() => {
  window.__orfin.clear();
  window.__orfin.clearHighlight();
  window.__orfin.updateSettings({ theme: 'cloud' });
});
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'docs/assets/mobile.png', animations: 'disabled' });
await browser.close();
process.stdout.write('Saved actual browser recordings to docs/assets.\n');
