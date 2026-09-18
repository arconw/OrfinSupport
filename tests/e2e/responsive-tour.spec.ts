import { expect, test } from '@playwright/test';

const root = '[data-orfin-root]';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  test(`completes the visible mobile tour with ordinary clicks at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'Show me around', exact: true }).click();
    const tour = page.getByRole('dialog', { name: 'Guided tour' });
    await expect(tour).toContainText('1 / 3');
    await expect(page.locator(`${root} .launcher`)).toHaveCount(0);
    for (const [index, title] of ['Active projects', 'What’s happening'].entries()) {
      await tour.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 3000 });
      await expect(tour).toContainText(`${index + 2} / 3`);
      await expect(tour.getByRole('heading')).toHaveText(title);
      const box = await page.locator(`${root} .spotlight`).boundingBox();
      expect(box!.width).toBeGreaterThan(100);
      expect(box!.height).toBeGreaterThan(50);
    }
    await tour.getByRole('button', { name: 'Finish', exact: true }).click({ timeout: 3000 });
    await expect(tour).toHaveCount(0);
    await expect(page.locator(`${root} .panel`)).toBeVisible();
    await expect(page.locator(`${root} .launcher`)).toBeVisible();
  });
}

test('reconciles steps and counters across repeated desktop/mobile resizing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tour).toContainText('2 / 3');
  await expect(tour.getByRole('heading')).toHaveText('Active projects');
  await expect(page.locator('[data-orfin-section="projects"]')).toBeInViewport();
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(tour).toContainText('3 / 3');
  await expect(tour.getByRole('heading')).toHaveText('What’s happening');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(tour).toContainText('4 / 4');
  await tour.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(tour.getByRole('heading')).toHaveText('Team pulse');
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(tour).toContainText('3 / 3');
  await expect(tour.getByRole('heading')).toHaveText('What’s happening');
  await expect(page.locator(`${root} .spot-label`)).toHaveText('What’s happening');
  await tour.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(tour).toHaveCount(0);
});

test('updates the section context when the active Ask step becomes hidden', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await tour.getByRole('button', { name: 'Ask', exact: true }).click();
  await page.locator(`${root} textarea`).fill('Keep this question');
  await page.setViewportSize({ width: 390, height: 844 });
  const controls = page.getByRole('navigation', { name: 'Tour controls' });
  await expect(controls).toContainText('3 / 3');
  await expect(page.locator(`${root} .context`)).toContainText('What’s happening');
  await expect(page.locator(`${root} textarea`)).toHaveValue('Keep this question');
  await controls.getByRole('button', { name: 'Return to tour', exact: true }).click();
  await expect(tour).toContainText('3 / 3');
  await expect(tour.getByRole('heading')).toHaveText('What’s happening');
});

test('skips zero-area, hidden and inaccessible section targets', async ({ page }) => {
  await page.goto('/fixtures.html');
  await expect(page.locator(`${root} .panel`)).toBeVisible();
  for (const mode of ['zero', 'hidden', 'opacity', 'aria', 'inert']) {
    await page.evaluate((mode) => {
      const element = document.querySelector<HTMLElement>('[data-orfin-section="fixture-intro"]')!;
      element.removeAttribute('style');
      element.removeAttribute('aria-hidden');
      element.inert = false;
      if (mode === 'zero')
        element.style.cssText = 'width:0;height:0;padding:0;border:0;overflow:hidden';
      if (mode === 'hidden') element.style.visibility = 'hidden';
      if (mode === 'opacity') element.style.opacity = '0';
      if (mode === 'aria') element.setAttribute('aria-hidden', 'true');
      if (mode === 'inert') element.inert = true;
      return window.__orfin!.startTour();
    }, mode);
    const tour = page.getByRole('dialog', { name: 'Guided tour' });
    await expect(tour).toContainText('1 / 1');
    await expect(tour.getByRole('heading')).toHaveText('Fixture tools');
    await expect(page.locator(`${root} .spot-label`)).toHaveText('Fixture tools');
    await tour.getByRole('button', { name: 'End tour', exact: true }).click();
  }
});

test('advances past a removed target and exits if every remaining target disappears', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  await page.locator('[data-orfin-section="welcome"]').evaluate((element) => element.remove());
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await expect(tour.getByRole('heading')).toHaveText('Active projects');
  await expect(tour).toContainText('1 / 3');
  await page.locator('[data-orfin-section]').evaluateAll((elements) => {
    for (const element of elements) element.setAttribute('aria-hidden', 'true');
  });
  await expect(tour).toHaveCount(0);
  await expect(page.locator(`${root} .spotlight`)).toHaveCount(0);
  await expect(page.locator(`${root} .panel`)).toBeVisible();
  await expect(page.locator(`${root} .launcher`)).toBeVisible();
  await expect(page.locator(`${root} .context`)).toHaveCount(0);
});

test('restores a data-only section that becomes visible after the tour starts', async ({
  page,
}) => {
  await page.goto('/fixtures.html');
  await expect(page.locator(`${root} .panel`)).toBeVisible();
  await page
    .locator('[data-orfin-section="fixture-intro"]')
    .evaluate((element) => element.setAttribute('hidden', ''));
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await expect(tour).toContainText('1 / 1');
  await expect(tour.getByRole('heading')).toHaveText('Fixture tools');
  await page
    .locator('[data-orfin-section="fixture-intro"]')
    .evaluate((element) => element.removeAttribute('hidden'));
  await expect(tour).toContainText('2 / 2');
  await expect(tour.getByRole('heading')).toHaveText('Fixture tools');
  await tour.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(tour).toContainText('1 / 2');
  await expect(tour.getByRole('heading')).toHaveText('Fixture introduction');
});

test('keeps the active step when a responsive equivalent replaces its target', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.evaluate(() => {
    const alternate = document.createElement('section');
    alternate.dataset.orfinSection = 'capacity';
    alternate.className = 'mobile-capacity';
    alternate.textContent = 'Team pulse on mobile';
    document.querySelector('main')!.append(alternate);
  });
  await page.addStyleTag({
    content:
      '.mobile-capacity{display:none}@media(max-width:980px){.mobile-capacity{display:block;min-height:180px;padding:24px}}',
  });
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tour).toContainText('3 / 4');
  await expect(tour.getByRole('heading')).toHaveText('Team pulse');
  await expect(page.locator('.mobile-capacity')).toBeInViewport();
  const box = await page.locator(`${root} .spotlight`).boundingBox();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(100);
});
