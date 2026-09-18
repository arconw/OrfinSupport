import { writeFile, mkdir } from 'node:fs/promises';
import { createHttpTransport } from '../src/core/transport';
import { defaultSettings } from '../src/core/settings';
import { sections } from '../demo/data';
import type { AgentEvent, ChatRequest, Locale } from '../src/core/types';

const endpoint = process.env.ORFIN_LIVE_URL ?? 'http://127.0.0.1:4174/api/orfin';
const filter = process.env.ORFIN_LIVE_FILTER?.toLowerCase();
const transport = createHttpTransport({ endpoint });
const replyText = (events: AgentEvent[]) =>
  events
    .filter((event) => event.type === 'delta')
    .map((event) => event.text)
    .join('');
const completedMCP = (events: AgentEvent[]) =>
  events.some(
    (event) =>
      event.type === 'tool' &&
      ['team_capacity', 'workspace_statistics'].includes(event.tool.name) &&
      event.tool.status === 'complete',
  );
const cases: {
  name: string;
  query: string;
  locale?: Locale;
  history?: ChatRequest['messages'];
  check: (events: AgentEvent[]) => boolean;
}[] = [
  {
    name: 'streaming project context',
    query: 'Describe Northstar in two short sentences.',
    check: (events: AgentEvent[]) => events.filter((event) => event.type === 'delta').length > 1,
  },
  {
    name: 'model-directed spotlight',
    query:
      'Show me the active projects section. Use highlight_section with sectionId projects, then briefly explain.',
    check: (events: AgentEvent[]) =>
      events.some(
        (event) =>
          event.type === 'action' &&
          event.action.type === 'highlight' &&
          event.action.sectionId === 'projects',
      ),
  },
  {
    name: 'MCP tool round trip',
    query:
      'What is our team capacity this week? Call team_capacity before answering. Keep the answer short.',
    check: (events: AgentEvent[]) =>
      events.some(
        (event) =>
          event.type === 'tool' &&
          event.tool.name === 'team_capacity' &&
          event.tool.status === 'complete',
      ),
  },
  {
    name: 'MCP workspace completed task count',
    query:
      'Please call the connected MCP workspace statistics tool and tell me the completed task count. Use the tool, not the knowledge documents.',
    check: (events) =>
      events.some(
        (event) =>
          event.type === 'tool' &&
          event.tool.name === 'workspace_statistics' &&
          event.tool.status === 'complete',
      ) && /\b24\b/u.test(replyText(events)),
  },
  {
    name: 'retrieval with sources',
    query: 'What is the price of the Studio plan?',
    check: (events: AgentEvent[]) =>
      events.some(
        (event) => event.type === 'sources' && event.sources.some((source) => source.id === 'plan'),
      ),
  },
  {
    name: 'selected Spanish despite English input',
    locale: 'es-MX',
    query: 'Describe Northstar in one short sentence.',
    check: (events) => /\b(es|equipo|proyectos|espacio|trabajo)\b/iu.test(replyText(events)),
  },
  {
    name: 'selected Japanese despite English input',
    locale: 'ja',
    query: 'Describe Northstar in one short sentence.',
    check: (events) => /[ぁ-んァ-ン一-龯]/u.test(replyText(events)),
  },
  {
    name: 'selected Arabic despite English input',
    locale: 'ar',
    query: 'Describe Northstar in one short sentence.',
    check: (events) => /[\u0600-\u06ff]/u.test(replyText(events)),
  },
  {
    name: 'Russian MCP answer despite English input',
    locale: 'ru',
    query:
      'Use the connected MCP workspace statistics tool. What plan is this workspace on and how many team members are there?',
    check: (events) =>
      completedMCP(events) &&
      (replyText(events).match(/[А-Яа-яЁё]/gu)?.length ?? 0) > 20 &&
      /Studio/u.test(replyText(events)) &&
      /12/u.test(replyText(events)),
  },
  {
    name: 'Russian MCP answer after English conversation history',
    locale: 'ru',
    history: [
      { role: 'user', content: 'Tell me about this workspace.' },
      {
        role: 'assistant',
        content:
          'Northstar is a fictional creative-team workspace. Its Studio plan includes 12 team members.',
      },
    ],
    query:
      'Use the connected MCP workspace statistics tool. What plan is this workspace on and how many team members are there?',
    check: (events) =>
      completedMCP(events) && (replyText(events).match(/[А-Яа-яЁё]/gu)?.length ?? 0) > 20,
  },
  {
    name: 'explicit English request overrides Russian locale after MCP',
    locale: 'ru',
    query:
      'Answer in English. Use the connected MCP workspace statistics tool. What plan is this workspace on and how many team members are there?',
    check: (events) =>
      completedMCP(events) &&
      /Studio/u.test(replyText(events)) &&
      /12/u.test(replyText(events)) &&
      !/[А-Яа-яЁё]/u.test(replyText(events)),
  },
  {
    name: 'English default despite Russian input',
    query: 'Расскажи о Northstar одним коротким предложением.',
    check: (events) => /Northstar/u.test(replyText(events)) && !/[А-Яа-я]/u.test(replyText(events)),
  },
];
const results = [];
for (const item of cases.filter((item) => !filter || item.name.toLowerCase().includes(filter))) {
  const start = performance.now();
  const events: AgentEvent[] = [];
  for await (const event of transport.stream(
    {
      messages: [...(item.history ?? []), { role: 'user', content: item.query }],
      page: {
        url: new URL('/', endpoint).href,
        title: 'Northstar',
        sections: sections.map(
          ({ prompt: _prompt, translations: _translations, ...section }) => section,
        ),
      },
      features: { ...defaultSettings.features },
      locale: item.locale ?? 'en',
    },
    AbortSignal.timeout(120000),
  ))
    events.push(event);
  const success =
    !events.some((event) => event.type === 'error') &&
    item.check(events) &&
    events.at(-1)?.type === 'done';
  const result = {
    name: item.name,
    success,
    durationMs: Math.round(performance.now() - start),
    deltas: events.filter((event) => event.type === 'delta').length,
    tools: events.filter((event) => event.type === 'tool').map((event) => event.tool),
    actions: events.filter((event) => event.type === 'action').map((event) => event.action),
  };
  results.push(result);
  process.stdout.write(
    `${success ? 'PASS' : 'FAIL'} ${item.name} (${result.durationMs}ms, ${result.deltas} deltas)\n`,
  );
}
await mkdir('.artifacts', { recursive: true });
await writeFile(
  filter ? '.artifacts/live-filtered-report.json' : '.artifacts/live-report.json',
  JSON.stringify({ date: new Date().toISOString(), provider: 'local llm-gate', results }, null, 2),
);
if (results.some((result) => !result.success)) process.exitCode = 1;
