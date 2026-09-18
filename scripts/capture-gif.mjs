import { chromium, expect } from '@playwright/test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export async function captureAnimatedDemo(baseURL) {
  const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
  execFileSync(ffmpeg, ['-version'], { stdio: 'ignore' });
  await mkdir('.artifacts', { recursive: true });
  await mkdir('docs/assets', { recursive: true });
  const recording = await mkdtemp('.artifacts/demo-recording-');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const session = await context.newCDPSession(page);
  const frames = [];
  const writes = [];
  session.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    void session.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    if (frames.length && metadata.timestamp - frames.at(-1).timestamp < 0.035) return;
    const path = resolve(recording, `frame-${String(frames.length).padStart(5, '0')}.png`);
    frames.push({ path, timestamp: metadata.timestamp });
    writes.push(writeFile(path, Buffer.from(data, 'base64')));
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const marks = [];
  const started = Date.now();
  const mark = (name) => marks.push({ name, time: (Date.now() - started) / 1000 });
  const pause = (duration = 800) => page.waitForTimeout(duration);
  const root = page.locator('[data-orfin-root]');
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  const reply = async () => {
    await expect(root.locator('[role="log"]')).toHaveAttribute('aria-busy', 'false');
    await expect(root.locator('.message.assistant').last()).not.toBeEmpty();
    await pause(1400);
  };
  try {
    await page.goto(baseURL);
    await page.evaluate(() => document.fonts.ready);
    await expect(root.locator('.panel')).toBeVisible();
    await root.locator('textarea').blur();
    await session.send('Page.startScreencast', {
      format: 'png',
      maxWidth: 1080,
      maxHeight: 800,
      everyNthFrame: 1,
    });
    await pause();
    mark('Welcome');
    await pause(1000);
    await root.locator('.actions-trigger').click();
    await pause();
    await page.keyboard.press('Escape');
    await pause(400);
    mark('Tour appearance');
    await page.getByRole('button', { name: 'Show me around', exact: true }).click();
    await expect(tour).toBeVisible();
    await pause(1100);
    mark('Tour next section');
    await tour.getByRole('button', { name: 'Next', exact: true }).click();
    await pause(1300);
    mark('Ask during tour');
    await tour.getByRole('button', { name: 'Ask', exact: true }).click();
    await pause(400);
    await root
      .locator('textarea')
      .pressSequentially('Which project is closest to done?', { delay: 25 });
    await pause(400);
    await root.locator('.send').click();
    await reply();
    await page
      .getByRole('navigation', { name: 'Tour controls' })
      .getByRole('button', { name: 'Return to tour', exact: true })
      .click();
    await pause(400);
    await tour.getByRole('button', { name: 'End tour', exact: true }).click();
    await pause(400);
    mark('Pick a section');
    await page.evaluate(() => {
      window.__orfin.clear();
      window.__orfin.pick();
    });
    await page.locator('[data-orfin-section="capacity"]').hover({ position: { x: 90, y: 80 } });
    await pause(900);
    await page.locator('[data-orfin-section="capacity"]').click({ position: { x: 90, y: 80 } });
    await reply();
    mark('Equipment');
    await page.evaluate(() => {
      window.__orfin.clear();
      window.__orfin.close();
      location.hash = '/shop';
    });
    await pause(1000);
    await page.evaluate(() => window.__orfin.open());
    await pause(500);
    await root.locator('.actions-trigger').click();
    await pause(800);
    mark('Compare products');
    await page.getByRole('menuitem', { name: 'Compare products', exact: true }).click();
    await reply();
    await expect(page).toHaveURL(/compare/);
    await expect(root.locator('.message.assistant').last()).toContainText('$250');
    await pause(1600);
    expect(errors).toEqual([]);
  } finally {
    await session.send('Page.stopScreencast');
    await Promise.all(writes);
    await context.close();
    await browser.close();
  }
  const end = Date.now() / 1000;
  const sequence = frames
    .map((frame, index) => {
      const duration = Math.max(0.04, (frames[index + 1]?.timestamp ?? end) - frame.timestamp);
      return `file '${frame.path.replaceAll("'", "'\\''")}'\nduration ${duration}`;
    })
    .join('\n');
  const manifest = resolve(recording, 'frames.txt');
  await writeFile(manifest, `${sequence}\nfile '${frames.at(-1).path}'\n`);
  execFileSync(
    ffmpeg,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      manifest,
      '-filter_complex',
      'fps=25,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
      '-loop',
      '0',
      'docs/assets/demo.gif',
    ],
    { stdio: 'inherit' },
  );
  await writeFile(
    `${recording}/recording.json`,
    JSON.stringify({ manifest, frames: frames.length, fps: 25, marks, errors }, null, 2),
  );
  process.stdout.write(`Continuous browser recording saved: ${recording}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await captureAnimatedDemo(process.env.ORFIN_CAPTURE_URL ?? 'http://127.0.0.1:4173');
}
