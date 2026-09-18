import { expect, test } from '@playwright/test';
import { readSSE } from '../../src/core/sse';
import type { AgentEvent, ChatRequest } from '../../src/core/types';

const root = '[data-orfin-root]';
const query =
  'Please call the connected MCP workspace statistics tool and tell me the completed task count. Use the tool, not the knowledge documents.';

for (const scenario of [
  {
    locale: 'en',
    viewport: { width: 1440, height: 1000 },
    done: 'Done',
    answer: /completed|tasks/iu,
  },
  { locale: 'ru', viewport: { width: 390, height: 844 }, done: 'Готово', answer: /задач/iu },
]) {
  test(`calls workspace statistics through the live widget in ${scenario.locale}`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize(scenario.viewport);
    await page.goto('/');
    await page.getByLabel('Assistant provider').selectOption('live');
    if (scenario.locale !== 'en') {
      await page.locator(`${root} .header .icon-button`).first().click();
      await page.locator(`${root} #orfin-language`).selectOption(scenario.locale);
      await page.locator(`${root} .header .icon-button`).first().click();
    }
    const responseReady = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/orfin' && response.request().method() === 'POST',
      { timeout: 90000 },
    );
    const input = page.locator(`${root} textarea`);
    await input.fill(query);
    await page.locator(`${root} .send`).click();
    const response = await responseReady;
    expect(response.status()).toBe(200);
    const sent = response.request().postDataJSON() as ChatRequest;
    expect(sent.locale).toBe(scenario.locale);
    expect(sent.features.tools).toBe(true);
    expect(sent.messages.at(-1)?.content).toBe(query);
    const events: AgentEvent[] = [];
    const body = new Response(await response.text()).body!;
    for await (const event of readSSE(body)) events.push(JSON.parse(event.data) as AgentEvent);
    expect(events.filter((event) => event.type === 'error')).toEqual([]);
    expect(events.at(-1)?.type).toBe('done');
    const calls = events
      .filter((event) => event.type === 'tool')
      .map((event) => event.tool)
      .filter((tool) => tool.name === 'workspace_statistics');
    expect(calls.map((tool) => tool.status)).toEqual(['running', 'complete']);
    expect(calls[0]!.id).toBe(calls[1]!.id);
    await expect(page.locator(`${root} .tool`)).toContainText(
      `workspace statistics · ${scenario.done}`,
    );
    const answer = page.locator(`${root} .message.assistant`);
    await expect(answer).toContainText(/\b24\b/u);
    await expect(answer).toContainText(scenario.answer);
    if (scenario.locale === 'ru')
      expect(((await answer.innerText()).match(/[А-Яа-яЁё]/gu) ?? []).length).toBeGreaterThan(20);
    await expect(input).toHaveValue('');
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath('workspace-statistics.png') });
    await testInfo.attach('request-and-tools', {
      contentType: 'application/json',
      body: JSON.stringify({ locale: sent.locale, toolsEnabled: sent.features.tools, calls }),
    });
  });
}
