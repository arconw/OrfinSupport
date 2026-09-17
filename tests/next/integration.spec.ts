import { expect, test } from '@playwright/test';

test('SSR page hydrates with the packaged React adapter and follows the Next router', async ({
  page,
  request,
}) => {
  const response = await request.get('/');
  expect(await response.text()).toContain('Orfin, at home in Next.js.');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Show me around', exact: true }).click();
  const tour = page.getByRole('dialog', { name: 'Guided tour' });
  await expect(tour).toContainText('1 / 2');
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForURL('**/projects');
  await expect(tour).toContainText('2 / 2');
  await expect(page.locator('[data-orfin-root] .spot-label')).toHaveText('Your projects');
  expect(errors).toEqual([]);
});

test('server route returns an event stream without requiring browser credentials', async ({
  request,
}) => {
  const response = await request.post('/api/orfin', {
    data: {
      messages: [
        {
          role: 'user',
          content: 'Say hello and name the framework used by this example in one short sentence.',
        },
      ],
      page: { url: 'http://127.0.0.1:4177/', title: 'Next example', sections: [] },
      features: {
        chat: true,
        tour: true,
        sectionPicker: true,
        hoverHelp: false,
        navigation: true,
        tools: false,
        pageContext: 'sections',
      },
      locale: 'en',
    },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/event-stream');
  const text = await response.text();
  expect(text).toContain('"type":"delta"');
  expect(text).toContain('"type":"done"');
  expect(text).not.toContain('"type":"error"');
});

test('SSR locale hook remains reactive after hydration', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('Example language');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
  await page.getByLabel('Example language').selectOption('fr');
  await expect(page.locator('[data-orfin-root] .welcome h3')).toHaveText('Bonjour, je suis Orfin.');
  await page.getByRole('button', { name: 'Préférences de l’assistant', exact: true }).click();
  await page.locator('[data-orfin-root] #orfin-language').selectOption('ja');
  await expect(page.getByLabel('Example language')).toHaveValue('ja');
  expect(errors).toEqual([]);
});
