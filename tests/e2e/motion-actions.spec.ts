import { expect, test, type Page } from '@playwright/test';

const root = '[data-orfin-root]';

async function sampleTransition(page: Page, target: 'panel' | 'actions-menu', opening: boolean) {
  return page.evaluate(
    async ({ target, opening }) => {
      const shadow = document.querySelector('[data-orfin-root]')!.shadowRoot!;
      let element = shadow.querySelector(`.${target}`);
      if (target === 'panel') {
        if (opening) window.__orfin!.open();
        else window.__orfin!.close();
      } else shadow.querySelector<HTMLButtonElement>('.actions-trigger')!.click();
      element ??= shadow.querySelector(`.${target}`);
      const values: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 420) {
        await new Promise(requestAnimationFrame);
        if (element?.isConnected) values.push(Number(getComputedStyle(element).opacity));
      }
      return values;
    },
    { target, opening },
  );
}

test('Actions has a visible caption, keyboard navigation and predictable dismissal', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Actions', exact: true });
  await expect(trigger).toHaveText('Actions');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`${root} .panel`)).toHaveCSS('scale', '1');
  expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  const input = page.locator(`${root} textarea`);
  await input.fill('Keep my draft');
  await trigger.focus();
  await trigger.press('ArrowDown');
  const menu = page.getByRole('menu', { name: 'Actions', exact: true });
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('menuitem', { name: 'Show me around' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(menu.getByRole('menuitem', { name: 'Explain this page' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Show me around' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toHaveCount(0);
  await expect(input).toHaveValue('Keep my draft');
  await trigger.press('ArrowUp');
  await expect(menu.getByRole('menuitem', { name: 'Explain this page' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Clear conversation' })).toBeFocused();
  await trigger.click();
  await page.locator(`${root} .heading h2`).click();
  await expect(menu).toHaveCount(0);
  await input.click();
  await expect(input).toBeFocused();
});

test('the menu remains useful after a reply and dispatches page, tour and section actions', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator(`${root} textarea`).fill('Hello');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} .message.assistant`)).toContainText('Northstar');
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Explain this page' }).click();
  await expect(page.locator(`${root} .message.user`)).toHaveCount(2);
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Show me around' }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Tour controls' })).toContainText('1 / 4');
  await page.evaluate(() => window.__orfin!.endTour());
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Ask about a section' }).click();
  await expect(page.locator(`${root} .picker-bar`)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__orfin!.open());
  await expect(page.locator(`${root} .message.user`)).toHaveCount(2);
  await page.evaluate(() =>
    window.__orfin!.updateSettings({ features: { tour: false, sectionPicker: false } }),
  );
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await expect(page.getByRole('menuitem')).toHaveCount(1);
  await expect(page.getByRole('menuitem')).toHaveText('Explain this page');
});

for (const setup of [
  { width: 1440, height: 1000, locale: 'en', theme: 'cloud' },
  { width: 320, height: 568, locale: 'ru', theme: 'espresso' },
  { width: 390, height: 844, locale: 'ar', theme: 'forest' },
  { width: 320, height: 568, locale: 'ar', theme: 'none' },
] as const) {
  test(`panel and Actions animate within ${setup.width}px ${setup.locale} ${setup.theme}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: setup.width, height: setup.height },
      isMobile: setup.width < 600,
      hasTouch: setup.width < 600,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/');
    await page.evaluate((settings) => window.__orfin!.updateSettings(settings), {
      locale: setup.locale,
      theme: setup.theme,
    });
    await expect(page.locator(`${root} .panel`)).toHaveCSS('opacity', '1');
    for (const [target, opening] of [
      ['panel', false],
      ['panel', true],
      ['actions-menu', true],
      ['actions-menu', false],
    ] as const) {
      const frames = await sampleTransition(page, target, opening);
      expect(frames.some((value) => value > 0 && value < 1)).toBe(true);
    }
    const trigger = page.locator(`${root} .actions-trigger`);
    if (setup.width < 600) await trigger.tap();
    else await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toHaveCSS('opacity', '1');
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(setup.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThan(setup.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(setup.width);
    expect(await page.evaluate(() => visualViewport!.width)).toBe(setup.width);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    const close = page.locator(`${root} .header .icon-button`).last();
    if (setup.width < 600) await close.tap();
    else await close.click();
    await expect(page.locator(`${root} .panel`)).toHaveCount(0);
    await context.close();
  });
}

test('rapid reopen preserves the panel, draft and history; motion can stop immediately', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator(`${root} textarea`).fill('Hello');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  await page.locator(`${root} textarea`).fill('An unfinished draft');
  const samePanel = await page.evaluate(async () => {
    const shadow = document.querySelector('[data-orfin-root]')!.shadowRoot!;
    const panel = shadow.querySelector('.panel');
    window.__orfin!.close();
    const inert = panel!.hasAttribute('inert');
    await new Promise(requestAnimationFrame);
    window.__orfin!.open();
    return {
      same: panel === shadow.querySelector('.panel'),
      inert,
      reopened: !panel!.hasAttribute('inert'),
    };
  });
  expect(samePanel).toEqual({ same: true, inert: true, reopened: true });
  await expect(page.locator(`${root} textarea`)).toHaveValue('An unfinished draft');
  await expect(page.locator(`${root} .message`)).toHaveCount(2);
  await page.getByRole('button', { name: 'Assistant preferences', exact: true }).click();
  await page.getByRole('switch', { name: 'Interface animations', exact: true }).click();
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('data-motion', 'none');
  await page.getByRole('button', { name: 'Assistant preferences', exact: true }).click();
  await expect(page.locator(`${root} textarea`)).toHaveValue('An unfinished draft');
  await page.evaluate(() => window.__orfin!.close());
  await expect(page.locator(`${root} .panel`)).toHaveCount(0);
  await page.evaluate(() => window.__orfin!.open());
  await expect(page.locator(`${root} .panel`)).toHaveCSS('transition-duration', '0s');
  await page.evaluate(() => window.__orfin!.updateSettings({ motion: 'auto' }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('data-motion', 'none');
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await expect(page.getByRole('menu')).toHaveCSS('transition-duration', '0s');
  await expect(page.getByRole('menuitem').first()).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator(`${root} .orfin`)).toHaveAttribute('data-motion', 'auto');
  await page.evaluate(() => {
    window.__orfin!.close();
    window.__orfin!.updateSettings({ motion: 'none' });
  });
  await expect(page.locator(`${root} .panel`)).toHaveCount(0);
});

test('streamed messages enter once and tools keep their status through theme and locale changes', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    const shadow = document.querySelector('[data-orfin-root]')!.shadowRoot!;
    shadow.addEventListener('animationstart', (event) => {
      const element = event.target as HTMLElement;
      if (
        element.matches('.message') &&
        (event as AnimationEvent).animationName === 'orfin-content'
      ) {
        element.dataset.entries = String(Number(element.dataset.entries ?? 0) + 1);
      }
    });
  });
  await page.locator(`${root} textarea`).fill('Compare Luma 27 and Luma 32 Pro.');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} .tool[data-status="complete"]`)).toBeVisible();
  await expect(page.locator(`${root} [role="log"]`)).toHaveAttribute('aria-busy', 'false');
  for (const message of await page.locator(`${root} .message`).all())
    await expect(message).toHaveAttribute('data-entries', '1');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      locale: 'fr',
      theme: 'none',
      logo: { src: './studio-mark.svg', alt: 'Studio' },
    }),
  );
  await expect(page.locator(`${root} .actions-trigger`)).toHaveText('Actions');
  await expect(page.locator(`${root} .tool`)).toContainText('Terminé');
  await page.waitForTimeout(350);
  for (const message of await page.locator(`${root} .message`).all())
    await expect(message).toHaveAttribute('data-entries', '1');
  await expect(page.locator(`${root} .header img`)).toHaveAttribute('alt', 'Studio');
});
