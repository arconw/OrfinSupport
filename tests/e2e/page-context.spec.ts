import { expect, test } from '@playwright/test';

const root = '[data-orfin-root]';

test('clears a completed tour section after navigation and explains the current Playground', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(tour.getByRole('heading')).toHaveText('Team pulse');
  await tour.getByRole('button', { name: 'End tour', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('button', { name: 'Playground' })
    .click();
  await page.getByRole('button', { name: 'Ask Orfin', exact: true }).click();
  await expect(page.locator(`${root} .context`)).toHaveCount(0);
  const context = await page.evaluate(() => window.__orfin!.registry.page('sections'));
  expect(context.sections.map((section) => section.id)).toEqual(['settings']);
  await page.locator(`${root} textarea`).fill('What can I configure here?');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  const answer = page.locator(`${root} .message.assistant`);
  await expect(answer).toContainText('Assistant playground');
  await expect(answer).toContainText('theme');
  await expect(answer).not.toContainText('Team pulse');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  const original = await answer.innerText();
  await page.getByLabel('Language', { exact: true }).selectOption('ru');
  await expect(answer).toHaveText(original);
});

test('drops absent section IDs before sending even without a route event', async ({ page }) => {
  let sent: { page: { selectedSectionId?: string; sections: { id: string }[] } } | undefined;
  await page.route('**/api/orfin', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({
      contentType: 'text/event-stream',
      body: 'data: {"type":"delta","text":"Current page."}\n\ndata: {"type":"done"}\n\n',
    });
  });
  await page.goto('/');
  await page.getByLabel('Assistant provider').selectOption('live');
  await page.evaluate(() => {
    const orfin = window.__orfin!;
    orfin.state.selectedSection = orfin.registry
      .discover('sections')
      .find((section) => section.id === 'capacity');
    document.querySelector('[data-orfin-section="capacity"]')!.remove();
    void orfin.send('Explain this page.');
  });
  await expect
    .poll(() => sent?.page.sections.some((section) => section.id === 'capacity'))
    .toBe(false);
  expect(sent!.page.selectedSectionId).toBeUndefined();
  await expect(page.locator(`${root} .context`)).toHaveCount(0);
});

test('updates local page context across history navigation without reviving the old selection', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const orfin = window.__orfin!;
    await orfin.explain(
      orfin.registry.discover('sections').find((section) => section.id === 'projects')!,
    );
    orfin.close();
  });
  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('button', { name: 'Knowledge', exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.__orfin!.state.selectedSection?.id ?? null))
    .toBeNull();
  expect(
    await page.evaluate(() =>
      window.__orfin!.registry.page('sections').sections.map((section) => section.id),
    ),
  ).toEqual(['knowledge']);
  await page.goBack();
  await expect(page.locator('[data-orfin-section="projects"]')).toBeVisible();
  expect(await page.evaluate(() => window.__orfin!.state.selectedSection)).toBeUndefined();
  expect(
    await page.evaluate(() =>
      window
        .__orfin!.registry.page('sections')
        .sections.some((section) => section.id === 'knowledge'),
    ),
  ).toBe(false);
});
