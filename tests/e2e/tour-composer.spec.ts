import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`tour Ask keeps Next accessible at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'Show me around', exact: true }).click();
    const tour = page.getByRole('dialog', { name: 'Guided tour', exact: true });
    await tour.getByRole('button', { name: 'Ask', exact: true }).click();
    await page.locator('[data-orfin-root] textarea').fill('What can I do in this section?');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText('Northstar');
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
    const controls = page.getByRole('navigation', { name: 'Tour controls', exact: true });
    const total = viewport.width <= 600 ? 3 : 4;
    await expect(controls).toContainText(`1 / ${total}`);
    await expect(tour).toHaveCount(0);
    await controls.getByRole('button', { name: 'Next', exact: true }).click({ timeout: 3000 });
    await expect(controls).toContainText(`2 / ${total}`);
    await expect(page.locator('[data-orfin-root] .context')).toContainText('Active projects');
    await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
    await expect(page.locator('[data-orfin-root] .spotlight')).toHaveCSS('box-shadow', /0\.15/);
    await controls.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(controls).toContainText(`1 / ${total}`);
    await controls.getByRole('button', { name: 'Return to tour', exact: true }).click();
    await expect(tour).toBeVisible();
    await expect(tour).toContainText(`1 / ${total}`);
  });
}

for (const method of ['button', 'Enter']) {
  test(`${method}: clears a submitted message and preserves a new draft through the reply`, async ({
    page,
  }) => {
    let finishReply = () => {};
    const responseReady = new Promise<void>((resolve) => {
      finishReply = resolve;
    });
    const requests: string[] = [];
    await page.route('**/api/orfin', async (route) => {
      requests.push(route.request().postDataJSON().messages.at(-1).content);
      await responseReady;
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"type":"delta","text":"Reply complete."}\n\ndata: {"type":"done"}\n\n',
      });
    });
    try {
      await page.goto('/');
      await page.getByLabel('Assistant provider').selectOption('live');
      const input = page.locator('[data-orfin-root] textarea');
      await input.fill('First question');
      const submit = async () => {
        if (method === 'button')
          await page.getByRole('button', { name: 'Send message', exact: true }).click();
        else await input.press('Enter');
      };
      await submit();
      await expect(page.getByRole('button', { name: 'Stop response', exact: true })).toBeVisible();
      await expect(input).toHaveValue('');
      await input.fill('A new draft written while waiting');
      await page.evaluate(() => window.__orfin!.updateSettings({ theme: 'iris' }));
      await expect(input).toHaveValue('A new draft written while waiting');
      finishReply();
      await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText(
        'Reply complete.',
      );
      await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
      await expect(input).toHaveValue('A new draft written while waiting');
      await submit();
      await expect(input).toHaveValue('');
      await expect
        .poll(() => requests)
        .toEqual(['First question', 'A new draft written while waiting']);
      await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
      await input.press('Enter');
      await expect(page.locator('[data-orfin-root] .message.user')).toHaveCount(2);
    } finally {
      finishReply();
    }
  });
}
