import { expect, test } from '@playwright/test';

for (const scenario of [
  {
    path: '/shop',
    command: 'Compare products',
    tool: 'compare_products',
    result: '/compare',
    values: ['250', 'Luma 27', 'Luma 32 Pro'],
  },
  {
    path: '/reports',
    command: 'Analyze delivery',
    tool: 'get_delivery_report',
    result: '/reports',
    values: ['48', '66'],
  },
]) {
  test(`custom ${scenario.command} command calls the actual backend tool`, async ({ page }) => {
    await page.goto(`/#${scenario.path}`);
    await page.getByLabel('Assistant provider').selectOption('live');
    const root = page.locator('[data-orfin-root]');
    const face = root.locator('.header .orfin-mark');
    await expect(face).toHaveAttribute('data-expression', 'idle');
    const originalFace = await face.elementHandle();
    await face.evaluate((element) => {
      element.setAttribute('data-expression-changes', '0');
      new MutationObserver((records) => {
        element.setAttribute(
          'data-expression-changes',
          String(Number(element.getAttribute('data-expression-changes')) + records.length),
        );
      }).observe(element, { attributes: true, attributeFilter: ['data-expression'] });
    });
    await root.locator('textarea').fill('A separate unfinished draft');
    await root.locator('.actions-trigger').click();
    const ready = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/orfin' && response.request().method() === 'POST',
    );
    await page.getByRole('menuitem', { name: scenario.command, exact: true }).click();
    await expect(face).toHaveAttribute('data-expression', 'busy');
    const response = await ready;
    expect(response.status()).toBe(200);
    const events = (await response.text())
      .split('\n')
      .filter((line) => line.startsWith('data: '))
      .map((line) => JSON.parse(line.slice(6)));
    expect(events.filter((event) => event.type === 'error')).toEqual([]);
    expect(
      events
        .filter((event) => event.type === 'tool' && event.tool.name === scenario.tool)
        .map((event) => event.tool.status),
    ).toEqual(['running', 'complete']);
    await expect(root.locator('[role="log"]')).toHaveAttribute('aria-busy', 'false');
    expect(new URL(page.url()).hash).toBe(`#${scenario.result}`);
    for (const value of scenario.values)
      await expect(root.locator('.message.assistant')).toContainText(value);
    await expect(root.locator('textarea')).toHaveValue('A separate unfinished draft');
    await expect(root.locator('.streaming-indicator')).toHaveCount(0);
    await expect(face).toHaveAttribute('data-expression', 'idle');
    await expect(face).toHaveAttribute('data-expression-changes', '2');
    await expect(face.locator('.orfin-face-idle')).toHaveCSS('opacity', '1');
    expect(
      await originalFace!.evaluate(
        (element) =>
          element ===
          document
            .querySelector('[data-orfin-root]')!
            .shadowRoot!.querySelector('.header .orfin-mark'),
      ),
    ).toBe(true);
  });
}
