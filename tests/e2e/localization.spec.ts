import { expect, test } from '@playwright/test';

const root = '[data-orfin-root]';
const preferences = `${root} .header .icon-button`;

test('switches all built-in languages in widget preferences without losing the conversation', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator(`${root} textarea`).fill('Hello');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} .message.assistant`)).toContainText('Northstar');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeVisible();
  const messageId = await page.evaluate(() => window.__orfin!.state.messages[0]!.id);
  await page.locator(preferences).first().click();
  const languages = {
    en: 'Assistant preferences',
    es: 'Preferencias del asistente',
    fr: 'Préférences de l’assistant',
    de: 'Assistenten-Einstellungen',
    pt: 'Preferências do assistente',
    it: 'Preferenze dell’assistente',
    nl: 'Assistentinstellingen',
    pl: 'Ustawienia asystenta',
    uk: 'Налаштування помічника',
    ru: 'Настройки помощника',
    tr: 'Asistan tercihleri',
    ar: 'إعدادات المساعد',
    hi: 'सहायक की सेटिंग',
    zh: '助手设置',
    ja: 'アシスタントの設定',
    ko: '도우미 설정',
  };
  for (const [code, heading] of Object.entries(languages)) {
    await page.locator(`${root} #orfin-language`).selectOption(code);
    await expect(page.locator(`${root} .preferences h3`)).toHaveText(heading);
    await expect(page.locator(`${root} .orfin`)).toHaveAttribute('lang', code);
    await expect(page.locator(`${root} .orfin`)).toHaveAttribute(
      'dir',
      code === 'ar' ? 'rtl' : 'ltr',
    );
    expect(await page.evaluate(() => window.__orfin!.state.messages[0]!.id)).toBe(messageId);
    await expect(page.locator(root)).toHaveCount(1);
  }
});

test('updates localized tour content and keeps its step when switching languages', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => window.__orfin!.setLocale('fr'));
  await page.getByRole('button', { name: 'Faire le tour du projet', exact: true }).click();
  const tour = page.locator(`${root} .tour-popover`);
  await expect(tour).toHaveAttribute('aria-label', 'Visite guidée');
  await expect(tour).toContainText('Votre espace de travail en un regard');
  await tour.getByRole('button', { name: 'Suivant', exact: true }).click();
  await expect(tour).toContainText('2 / 4');
  await page.evaluate(() => window.__orfin!.setLocale('ja'));
  await expect(tour).toContainText('進行中のプロジェクト');
  await expect(tour).toContainText('2 / 4');
  await tour.getByRole('button', { name: '質問する', exact: true }).click();
  await page.locator(`${root} textarea`).fill('Tell me about the projects');
  await page.getByRole('button', { name: 'メッセージを送信' }).click();
  await expect(page.locator(`${root} .message.assistant`)).toContainText('進行中のプロジェクト');
  await expect(page.locator(`${root} .context`)).toContainText('進行中のプロジェクト');
  const payload = await page.evaluate(() =>
    window.__orfin!.registry.page('sections', undefined, 'ja'),
  );
  expect(payload.sections.find((section) => section.id === 'projects')!.title).toBe(
    '進行中のプロジェクト',
  );
  expect(payload.sections[0]).not.toHaveProperty('translations');
  expect(payload.sections[0]).not.toHaveProperty('prompt');
});

test('localizes hover prompts and section selection', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.__orfin!.setLocale('fr');
    window.__orfin!.updateSettings({ hoverDelay: 300, hoverCooldown: 0 });
    window.__orfin!.forget();
    window.__orfin!.close();
  });
  await page.locator('[data-orfin-section="welcome"]').hover();
  const hover = page.getByRole('dialog', { name: 'Besoin d’aide avec cette section ?' });
  await expect(hover).toBeVisible();
  await hover.getByRole('button', { name: 'Non, merci' }).click();
  await page.evaluate(() => window.__orfin!.pick());
  await expect(page.locator(`${root} .picker-bar`)).toContainText('Choisissez une section');
  await page.locator(`${root} .section-list summary`).click();
  await expect(page.locator(`${root} .section-list`)).toContainText('Projets actifs');
});

test('localizes HTTP errors, supports live overrides, and sends the selected locale', async ({
  page,
}) => {
  let locale: string | undefined;
  await page.route('**/api/orfin', (route) => {
    locale = route.request().postDataJSON().locale;
    return route.fulfill({ status: 503, body: 'Private upstream diagnostic' });
  });
  await page.goto('/');
  await page.getByLabel('Assistant provider').selectOption('live');
  await page.evaluate(() => window.__orfin!.setLocale('de'));
  await page.locator(`${root} textarea`).fill('Hello');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} [role="alert"]`)).toContainText('Verbindung zum Assistenten');
  expect(locale).toBe('de');
  await page.evaluate(() => window.__orfin!.setLocale('ja'));
  await expect(page.locator(`${root} [role="alert"]`)).toContainText(
    'アシスタントに接続できませんでした',
  );
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      translations: { ja: { errorConnection: '接続を確認してください。' } },
    }),
  );
  await expect(page.locator(`${root} [role="alert"]`)).toContainText('接続を確認してください。');
  await expect(page.locator(root)).not.toContainText('Private upstream diagnostic');
});

test('supports regional, custom and fallback locales without remounting', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() =>
    window.__orfin!.updateSettings({
      locale: 'fr-CA',
      translations: { 'fr-CA': { title: 'Bienvenue au studio' }, sv: { title: 'Hej från Orfin' } },
    }),
  );
  await expect(page.locator(`${root} .welcome h3`)).toHaveText('Bienvenue au studio');
  await expect(page.locator(`${root} .send`)).toHaveAttribute('aria-label', 'Envoyer le message');
  await page.evaluate(() => window.__orfin!.setLocale('sv'));
  await expect(page.locator(`${root} .welcome h3`)).toHaveText('Hej från Orfin');
  await expect(page.locator(`${root} .send`)).toHaveAttribute('aria-label', 'Send message');
  await page.evaluate(() => window.__orfin!.setLocale('xx'));
  await expect(page.locator(`${root} .welcome h3`)).toHaveText('Hey, I’m Orfin.');
});

test('fits Arabic on a mobile screen and streams a localized sample reply', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.__orfin!.setLocale('ar'));
  await expect(page.locator(`${root} .orfin`)).toHaveCSS('direction', 'rtl');
  await page.locator(`${root} textarea`).fill('Hello');
  await page.locator(`${root} .send`).click();
  await expect(page.locator(`${root} .message.assistant`)).toContainText('مرحباً');
  await expect(page.locator(`${root} .message.assistant`)).toHaveAttribute('dir', 'rtl');
  await page.evaluate(() => window.__orfin!.setLocale('en'));
  await expect(page.locator(`${root} .message.assistant`)).toHaveAttribute('dir', 'rtl');
  const box = await page.locator(`${root} .panel`).boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

for (const framework of ['react', 'vue-composable', 'angular']) {
  test(`${framework}: reactive API changes the language in both directions`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/fixtures.html?framework=${framework}`);
    await expect(page.locator(`${root} .panel`)).toBeVisible();
    await expect(page.locator('#host-locale')).toHaveText('en');
    await page.locator('#set-french').click();
    await expect(page.locator(`${root} .welcome h3`)).toHaveText('Bonjour, je suis Orfin.');
    await expect(page.locator('#host-locale')).toHaveText('fr');
    await page.locator(preferences).first().click();
    await page.locator(`${root} #orfin-language`).selectOption('ja');
    await expect(page.locator('#host-locale')).toHaveText('ja');
    if (framework === 'angular') {
      await page.locator('#set-polish').click();
      await expect(page.locator('#host-locale')).toHaveText('pl');
      await expect(page.locator(`${root} .preferences h3`)).toHaveText('Ustawienia asystenta');
    }
    await page.locator('#unmount').click();
    await expect(page.locator(root)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
