import { expect, test, type Page } from '@playwright/test';

const root = '[data-orfin-root]';

async function expectWelcomeAtTop(page: Page) {
  const log = page.locator(`${root} [role="log"]`);
  await expect(page.locator(`${root} .message`)).toHaveCount(0);
  await expect.poll(() => log.evaluate((element) => element.scrollTop)).toBe(0);
  const bounds = await log.boundingBox();
  const mark = await page.locator(`${root} .welcome-mark`).boundingBox();
  expect(mark!.y).toBeGreaterThanOrEqual(bounds!.y);
  expect(mark!.y + mark!.height).toBeLessThanOrEqual(bounds!.y + bounds!.height);
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
]) {
  test(`Iris Russian welcome starts at the top after open, resize and clear at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const preferences = page.locator(`${root} .header .icon-button`).first();
    await preferences.click();
    await page.locator(`${root} #orfin-language`).selectOption('ru');
    await page.getByRole('button', { name: 'Ирис', exact: true }).click();
    await preferences.click();
    await expectWelcomeAtTop(page);
    await page.locator(`${root} .header .icon-button`).last().click();
    await page.locator(`${root} .launcher`).click();
    await expectWelcomeAtTop(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectWelcomeAtTop(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await expectWelcomeAtTop(page);
    await page.setViewportSize(viewport);
    await expectWelcomeAtTop(page);
    await page.locator(`${root} textarea`).fill('What is this page about?');
    await page.locator(`${root} .send`).click();
    await expect(page.locator(`${root} .message.assistant`)).toContainText('Northstar');
    await expect(page.locator(`${root} .send`)).toHaveAttribute('aria-label', 'Отправить');
    const log = page.locator(`${root} [role="log"]`);
    await expect.poll(() => log.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Очистить чат', exact: true }).click();
    await expectWelcomeAtTop(page);
  });
}
