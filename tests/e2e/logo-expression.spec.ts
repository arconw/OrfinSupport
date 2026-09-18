import { expect, test, type Page } from '@playwright/test';
import { orfinSilhouette, orfinSmile } from '../../src/core/brand';
import { supportedThemes } from '../../src/core/themes';

const root = '[data-orfin-root]';
const mark = `${root} .header .orfin-mark`;

declare global {
  interface Window {
    advanceExpression: () => void;
    expressionChanges: string[];
  }
}

async function mountControlled(page: Page) {
  await page.goto('/fixtures.html');
  await page.evaluate(
    async (modulePath) => {
      window.__orfin!.destroy();
      const { createOrfin } = (await import(modulePath)) as typeof import('../../src/index');
      window.__orfin = createOrfin({
        initiallyOpen: true,
        features: { hoverHelp: false },
        transport: {
          async *stream(request, signal) {
            const advance = () =>
              new Promise<void>((resolve) => {
                const finish = () => {
                  signal.removeEventListener('abort', finish);
                  resolve();
                };
                window.advanceExpression = finish;
                signal.addEventListener('abort', finish, { once: true });
                if (signal.aborted) finish();
              });
            await advance();
            if (signal.aborted) return;
            if (request.messages.at(-1)?.content === 'Fail') throw new Error('Controlled failure');
            yield { type: 'tool', tool: { id: 'operation', name: 'catalog', status: 'running' } };
            await advance();
            if (signal.aborted) return;
            yield { type: 'tool', tool: { id: 'operation', name: 'catalog', status: 'complete' } };
            yield { type: 'delta', text: 'First text.' };
            await advance();
            if (signal.aborted) return;
            yield { type: 'delta', text: ' More text.' };
            await advance();
            if (signal.aborted) return;
            yield { type: 'delta', text: ' Finished.' };
            yield { type: 'done' };
          },
        },
      });
      window.expressionChanges = [];
      const face = document
        .querySelector('[data-orfin-root]')!
        .shadowRoot!.querySelector('.header .orfin-mark')!;
      new MutationObserver((records) => {
        for (const record of records)
          if (record.attributeName === 'data-expression')
            window.expressionChanges.push(face.getAttribute('data-expression')!);
      }).observe(face, { attributes: true });
    },
    `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`,
  );
  await expect(page.locator(`${root} .panel`)).toHaveCSS('opacity', '1');
}

async function sample(page: Page, action: 'send' | 'stop', question = 'Hello') {
  return page.evaluate(
    async ({ action, question }) => {
      const shadow = document.querySelector('[data-orfin-root]')!.shadowRoot!;
      const face = shadow.querySelector('.header .orfin-mark')!;
      const body = face.querySelector('path')!.getAttribute('d');
      const layer = face.querySelector('.orfin-face-busy')!;
      if (action === 'send') void window.__orfin!.send(question);
      else window.__orfin!.stop();
      const opacity: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 520) {
        await new Promise(requestAnimationFrame);
        opacity.push(Number(getComputedStyle(layer).opacity));
      }
      return {
        opacity,
        same: face === shadow.querySelector('.header .orfin-mark'),
        unchangedBody: body === face.querySelector('path')!.getAttribute('d'),
      };
    },
    { action, question },
  );
}

for (const setup of [
  { width: 1440, reduced: false, motion: 'auto' as const, locale: 'en' },
  { width: 390, reduced: false, motion: 'auto' as const, locale: 'ar' },
  { width: 320, reduced: true, motion: 'auto' as const, locale: 'ru' },
  { width: 320, reduced: false, motion: 'none' as const, locale: 'en' },
]) {
  test(`reference face follows waiting, tools, text and stop at ${setup.width} ${setup.locale} ${setup.motion}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: setup.width, height: setup.width === 1440 ? 1000 : 844 });
    await page.emulateMedia({ reducedMotion: setup.reduced ? 'reduce' : 'no-preference' });
    await mountControlled(page);
    await page.evaluate(
      ({ locale, motion }) => window.__orfin!.updateSettings({ locale, motion }),
      setup,
    );
    const face = page.locator(mark);
    await expect(face).toHaveAttribute('data-expression', 'idle');
    const entered = await sample(page, 'send');
    expect(entered.same && entered.unchangedBody).toBe(true);
    const animated = !setup.reduced && setup.motion === 'auto';
    expect(entered.opacity.some((value) => value > 0 && value < 1)).toBe(animated);
    await expect(face).toHaveAttribute('data-expression', 'busy');
    await expect(face.locator('.orfin-face-busy')).toHaveCSS('opacity', '1');
    await page.locator(`${root} textarea`).fill('An editable draft');
    await page.evaluate(() => window.advanceExpression());
    await expect(page.locator(`${root} .tool[data-status="running"]`)).toBeVisible();
    await page.evaluate(() => window.advanceExpression());
    await expect(page.locator(`${root} .message.assistant`)).toContainText('First text.');
    const messageFace = await page
      .locator(`${root} .message.assistant .orfin-mark`)
      .elementHandle();
    await page.evaluate(() => window.advanceExpression());
    await expect(page.locator(`${root} .message.assistant`)).toContainText('More text.');
    expect(
      await messageFace!.evaluate(
        (node) =>
          node ===
          document
            .querySelector('[data-orfin-root]')!
            .shadowRoot!.querySelector('.message.assistant .orfin-mark'),
      ),
    ).toBe(true);
    expect(await page.evaluate(() => window.expressionChanges)).toEqual(['busy']);
    await page.evaluate(() => window.advanceExpression());
    await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
    await expect(face.locator('.orfin-face-idle')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => window.expressionChanges)).toEqual(['busy', 'idle']);
    await sample(page, 'send', 'Another question');
    await expect(page.locator(`${root} .message.assistant .orfin-mark`).first()).toHaveAttribute(
      'data-expression',
      'idle',
    );
    await page.evaluate(() => window.advanceExpression());
    await expect(page.locator(`${root} .tool[data-status="running"]`)).toBeVisible();
    const stopped = await sample(page, 'stop');
    expect(stopped.same && stopped.unchangedBody).toBe(true);
    expect(stopped.opacity.some((value) => value > 0 && value < 1)).toBe(animated);
    await expect(face).toHaveAttribute('data-expression', 'idle');
    await expect(page.locator(`${root} .tool[data-status="interrupted"]`)).toBeVisible();
    await expect(page.locator(`${root} textarea`)).toHaveValue('An editable draft');
    const bounds = (await page.locator(`${root} .panel`).boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(setup.width);
  });
}

test('error, rapid restart and runtime motion changes settle the same face', async ({ page }) => {
  await mountControlled(page);
  await sample(page, 'send', 'Fail');
  await page.evaluate(() => window.advanceExpression());
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator(`${mark} .orfin-face-idle`)).toHaveCSS('opacity', '1');
  const face = await page.locator(mark).elementHandle();
  await page.evaluate(async () => {
    for (let index = 0; index < 4; index++) {
      void window.__orfin!.send(`Request ${index}`);
      await new Promise(requestAnimationFrame);
      window.__orfin!.stop();
      await new Promise(requestAnimationFrame);
    }
    void window.__orfin!.send('Keep working');
  });
  await expect(page.locator(`${mark} .orfin-face-busy`)).toHaveCSS('opacity', '1');
  expect(
    await face!.evaluate(
      (node) =>
        node ===
        document
          .querySelector('[data-orfin-root]')!
          .shadowRoot!.querySelector('.header .orfin-mark'),
    ),
  ).toBe(true);
  await page.evaluate(() => window.__orfin!.close());
  await expect(page.locator(`${root} .launcher .orfin-mark`)).toHaveAttribute(
    'data-expression',
    'busy',
  );
  await page.locator(`${root} .launcher`).click();
  await page.evaluate(() => {
    window.__orfin!.stop();
    window.__orfin!.updateSettings({ motion: 'none' });
  });
  await expect(page.locator(`${mark} .orfin-face-idle`)).toHaveCSS('transition-duration', '0s');
  await expect(page.locator(`${mark} .orfin-face-idle`)).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.__orfin!.updateSettings({ motion: 'auto' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await sample(page, 'send');
  await expect(page.locator(`${mark} .orfin-face-busy`)).toHaveCSS('transition-duration', '0s');
  await page.evaluate(() => window.__orfin!.clear());
  await expect(page.locator(`${root} .welcome-mark .orfin-mark`)).toHaveAttribute(
    'data-expression',
    'idle',
  );
});

test('all themes, external face styling, supplied images and fallback preserve state', async ({
  page,
}) => {
  await mountControlled(page);
  await sample(page, 'send');
  for (const theme of supportedThemes) {
    await page.evaluate((theme) => window.__orfin!.updateSettings({ theme }), theme);
    await expect(page.locator(mark)).toHaveAttribute('data-expression', 'busy');
    const colors = await page.locator(mark).evaluate((svg) => ({
      body: getComputedStyle(svg.querySelector('[part="logo-body"]')!).fill,
      face: getComputedStyle(svg.querySelector('[part="logo-face"]')!).stroke,
    }));
    expect(colors.body).not.toBe(colors.face);
  }
  await page.evaluate(() => {
    window.__orfin!.updateSettings({ theme: 'none', styles: '', locale: 'ar' });
    const style = document.createElement('style');
    style.textContent =
      '[data-orfin-root]::part(logo-body){fill:rgb(22,78,51)}[data-orfin-root]::part(logo-face){stroke:rgb(250,242,218)}';
    document.head.append(style);
  });
  await expect(page.locator(`${mark} [part="logo-body"]`)).toHaveCSS('fill', 'rgb(22, 78, 51)');
  await expect(page.locator(`${mark} [part="logo-face"]`)).toHaveCSS(
    'stroke',
    'rgb(250, 242, 218)',
  );
  await expect(page.locator(`${root} style[data-orfin-style="preset"]`)).toHaveText('');
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('dir', 'rtl');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({ logo: { src: '/studio-mark.svg', alt: 'Project mark' } }),
  );
  await expect(page.locator(`${root} .header img`)).toHaveAttribute('alt', 'Project mark');
  await expect(page.locator(`${root} .orfin-mark`)).toHaveCount(0);
  const image = await page.locator(`${root} .header img`).elementHandle();
  await page.evaluate(() => window.advanceExpression());
  await expect(page.locator(`${root} .tool[data-status="running"]`)).toBeVisible();
  expect(
    await image!.evaluate(
      (node) =>
        node ===
        document.querySelector('[data-orfin-root]')!.shadowRoot!.querySelector('.header img'),
    ),
  ).toBe(true);
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      logo: { src: 'data:image/png;base64,broken', alt: 'Unavailable mark' },
    }),
  );
  await expect(page.locator(mark)).toHaveAttribute('data-expression', 'busy');
  await page.evaluate(() => window.__orfin!.stop());
  await expect(page.locator(mark)).toHaveAttribute('data-expression', 'idle');
});

test('static vector assets and idle surfaces share the reference geometry', async ({
  page,
  request,
}) => {
  await page.goto('/');
  for (const surface of ['.header', '.welcome-mark']) {
    await expect(page.locator(`${root} ${surface} [part="logo-body"]`)).toHaveAttribute(
      'd',
      orfinSilhouette,
    );
    await expect(page.locator(`${root} ${surface} .orfin-face-idle circle`)).toHaveCount(2);
    await expect(page.locator(`${root} ${surface} .orfin-face-idle path`)).toHaveAttribute(
      'd',
      orfinSmile,
    );
  }
  const staticSVG = await (await request.get('/orfin.svg')).text();
  expect(staticSVG).toContain(orfinSilhouette);
  expect(staticSVG).toContain(orfinSmile);
  expect(staticSVG).not.toMatch(/<image|<script|foreignObject|face-busy/);
  await expect(page.locator('.brand-mark svg circle')).toHaveCount(2);
  await expect(page.locator('.brand-mark svg > path')).toHaveAttribute('d', orfinSilhouette);
});
