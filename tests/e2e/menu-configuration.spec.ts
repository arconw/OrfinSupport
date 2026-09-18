import { expect, test } from '@playwright/test';

const root = '[data-orfin-root]';

test('page commands use real demo tools and survive routing, locale and history changes', async ({
  page,
}) => {
  await page.goto('/#/shop');
  await page.locator(`${root} .actions-trigger`).click();
  await expect(page.getByRole('menuitem').first()).toHaveText('Compare products');
  await page.getByRole('menuitem', { name: 'Compare products', exact: true }).click();
  await expect(page).toHaveURL(/#\/compare$/);
  await expect(page.locator(`${root} .tool[data-status="complete"]`)).toContainText(
    'compare products',
  );
  await expect(page.locator(`${root} .message.assistant`)).toContainText('$250');
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await page.locator(`${root} textarea`).fill('Keep my draft');
  await page.locator(`${root} .actions-trigger`).click();
  await page.evaluate(() => {
    location.hash = '/reports';
  });
  await expect(page.getByRole('menuitem').first()).toHaveText('Analyze delivery');
  await expect(page.getByRole('menuitem').first()).toBeFocused();
  await expect(page.getByRole('menuitem', { name: 'Compare products', exact: true })).toHaveCount(
    0,
  );
  await page.evaluate(() => window.__orfin!.setLocale('ru'));
  await expect(page.getByRole('menuitem').first()).toHaveText('Проанализировать результаты');
  await page.getByRole('menuitem', { name: 'Проанализировать результаты', exact: true }).click();
  await expect(page.locator(`${root} .message.assistant`).last()).toContainText('37,5%');
  await expect(page.locator(`${root} .message.user`)).toHaveCount(2);
  await expect(page.locator(`${root} .message.user`).last()).toContainText('Проанализируй');
  await expect(page.locator(`${root} .message.user`).last()).not.toContainText(
    'get_delivery_report',
  );
  await expect(page.locator(`${root} textarea`)).toHaveValue('Keep my draft');
  await page.locator(`${root} .actions-trigger`).click();
  await page.evaluate(() => window.__orfin!.updateSettings({ features: { tools: false } }));
  await expect(
    page.getByRole('menuitem', { name: 'Проанализировать результаты', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('Copy configuration provides reusable command arrays, route rules and real project CSS', async ({
  page,
}) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/settings');
  await page.evaluate(() => window.__orfin!.close());
  const copy = async () => {
    await page.getByRole('button', { name: 'Copy configuration', exact: true }).click();
    return JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  };
  const contextual = await copy();
  expect(Array.isArray(contextual.menuActions)).toBe(true);
  expect(contextual.menuActions[0]).toMatchObject({
    id: 'compare-products',
    visibleOn: ['/shop', '/shop/*', '/compare'],
  });
  expect(contextual.menuActions[0].prompt).not.toContain('compare_products');
  await page.getByRole('button', { name: /Northstar appearance/ }).click();
  const unthemed = await copy();
  expect(unthemed.theme).toBe('none');
  expect(unthemed.styles).toContain(':host(');
  await page.evaluate((config) => {
    window.__orfin!.updateSettings({ menuActions: config.menuActions });
    location.hash = '/shop';
    window.__orfin!.open();
  }, contextual);
  await page.locator(`${root} .actions-trigger`).click();
  await expect(page.getByRole('menuitem').first()).toHaveText('Compare products');
  await page.goto('/#/settings');
  await page.evaluate(() => window.__orfin!.close());
  await page.getByRole('combobox', { name: 'Actions menu', exact: true }).selectOption('none');
  expect((await copy()).menuActions).toEqual([]);
  await page.getByRole('combobox', { name: 'Actions menu', exact: true }).selectOption('default');
  expect((await copy()).menuActions).toBeNull();
});

test('runtime replacement, empty lists and history-only navigation preserve focus and state', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({ menuActions: ['page', 'pick', 'tour'] }),
  );
  await page.locator(`${root} textarea`).fill('Draft');
  await page.locator(`${root} .actions-trigger`).click();
  await expect(page.getByRole('menuitem')).toHaveText([
    'Explain this page',
    'Ask about a section',
    'Show me around',
  ]);
  await page.evaluate(() => window.__orfin!.updateSettings({ menuActions: ['tour', 'page'] }));
  await expect(
    page.getByRole('menuitem', { name: 'Explain this page', exact: true }),
  ).toBeFocused();
  await page.evaluate(() => window.__orfin!.updateSettings({ menuActions: [] }));
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.locator(`${root} .actions-trigger`)).toHaveCount(0);
  await expect(page.locator(`${root} textarea`)).toBeFocused();
  await expect(page.locator(`${root} textarea`)).toHaveValue('Draft');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      menuActions: [
        {
          id: 'path-only',
          label: 'Current project command',
          prompt: 'Explain this page',
          visible: ({ url }) => new URL(url).searchParams.has('commands'),
        },
      ],
    }),
  );
  await expect(page.locator(`${root} .actions-trigger`)).toHaveCount(0);
  await page.evaluate(() => {
    history.pushState({}, '', '?commands=1');
    window.__orfin!.refreshPage();
  });
  await page.locator(`${root} .actions-trigger`).click();
  await expect(page.getByRole('menuitem')).toHaveText('Current project command');
  await page.evaluate(() => window.__orfin!.updateSettings({ menuActions: null }));
  await expect(page.getByRole('menuitem')).toHaveCount(3);
  await expect(page.getByRole('menuitem').first()).toBeFocused();
});

test('long custom labels remain keyboard reachable in a compact Arabic project menu', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/#/shop');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      locale: 'ar',
      theme: 'none',
      menuActions: Array.from({ length: 9 }, (_, i) => ({
        id: `custom-${i}`,
        label: `Project action ${i}`,
        translations: { ar: { label: `إجراء مخصص طويل للمشروع رقم ${i}` } },
        prompt: 'Hello',
      })),
    }),
  );
  await page.locator(`${root} .actions-trigger`).tap();
  await page.keyboard.press('End');
  const last = page.getByRole('menuitem').last();
  await expect(last).toBeFocused();
  const menu = (await page.getByRole('menu').boundingBox())!;
  const item = (await last.boundingBox())!;
  expect(item.y + item.height).toBeLessThanOrEqual(menu.y + menu.height + 1);
  expect(item.x + item.width).toBeLessThanOrEqual(320);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.keyboard.press('Home');
  await expect(page.getByRole('menuitem').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator(`${root} .actions-trigger`)).toBeFocused();
  await context.close();
});

test('waiting, typing, interrupted tools and retry reflect the actual response lifecycle', async ({
  page,
}) => {
  await page.goto('/fixtures.html');
  await page.evaluate(
    async (modulePath) => {
      window.__orfin!.destroy();
      const { createOrfin } = (await import(modulePath)) as typeof import('../../src/index');
      let count = 0;
      window.__orfin = createOrfin({
        initiallyOpen: true,
        features: { hoverHelp: false },
        transport: {
          async *stream(_request, signal) {
            const attempt = ++count;
            const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
            const waitForStop = () =>
              signal.aborted
                ? Promise.resolve()
                : new Promise((resolve) =>
                    signal.addEventListener('abort', resolve, { once: true }),
                  );
            await wait(150);
            yield {
              type: 'tool',
              tool: { id: 'work', name: 'project_operation', status: 'running' },
            };
            if (attempt === 1) {
              await waitForStop();
              return;
            }
            await wait(800);
            if (signal.aborted) return;
            if (attempt === 3) throw new Error('Controlled transport failure');
            yield {
              type: 'tool',
              tool: { id: 'work', name: 'project_operation', status: 'complete' },
            };
            yield { type: 'delta', text: 'A partial reply' };
            if (attempt === 2) {
              await waitForStop();
              return;
            }
            await wait(800);
            if (signal.aborted) return;
            yield { type: 'delta', text: ' is finished.' };
            yield { type: 'done' };
          },
        },
      });
    },
    `/@fs${new URL('../../src/index.ts', import.meta.url).pathname}`,
  );
  const ask = async () => {
    await page.locator(`${root} textarea`).fill('Test lifecycle');
    await page.locator(`${root} .send`).click();
  };
  await ask();
  await expect(page.locator(`${root} .thinking`)).toBeVisible();
  await expect(page.locator(`${root} .tool[data-status="running"] .tool-icon`)).toHaveCSS(
    'animation-name',
    'orfin-tool',
  );
  await page.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(page.locator(`${root} .tool[data-status="interrupted"]`)).toContainText(
    'Interrupted',
  );
  await expect(page.locator(`${root} .tool-icon`)).toHaveCSS('animation-name', 'none');
  await expect(page.locator(`${root} .thinking`)).toHaveCount(0);
  await ask();
  await expect(page.locator(`${root} .streaming-indicator`)).toBeVisible();
  await expect(page.locator(`${root} .status`)).toContainText('Replying');
  await page.locator(`${root} .actions-trigger`).click();
  await expect(page.getByRole('menuitem', { name: 'Explain this page' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Stop response', exact: true }).click();
  await expect(page.locator(`${root} .streaming-indicator`)).toHaveCount(0);
  await expect(page.locator(`${root} .message.assistant`).last()).toContainText('A partial reply');
  await ask();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator(`${root} .tool[data-status="error"] .tool-icon`)).toHaveCSS(
    'animation-name',
    'none',
  );
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator(`${root} .message.assistant`).last()).toContainText(
    'A partial reply is finished.',
  );
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator(`${root} .streaming-indicator`)).toHaveCount(0);
});
