import { writeFile, mkdir } from 'node:fs/promises';
import { createHttpTransport } from '../src/core/transport';
import { defaultSettings } from '../src/core/settings';
import { sections } from '../demo/data';
import type { AgentEvent } from '../src/core/types';

const transport = createHttpTransport({ endpoint: 'http://127.0.0.1:4174/api/orfin' });
const cases = [
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
    name: 'retrieval with sources',
    query: 'What is the price of the Studio plan?',
    check: (events: AgentEvent[]) =>
      events.some(
        (event) => event.type === 'sources' && event.sources.some((source) => source.id === 'plan'),
      ),
  },
];
const results = [];
for (const item of cases) {
  const start = performance.now();
  const events: AgentEvent[] = [];
  for await (const event of transport.stream(
    {
      messages: [{ role: 'user', content: item.query }],
      page: {
        url: 'http://127.0.0.1:4173/',
        title: 'Northstar',
        sections: sections.map(({ prompt: _prompt, ...section }) => section),
      },
      features: { ...defaultSettings.features },
      locale: 'en',
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
  '.artifacts/live-report.json',
  JSON.stringify({ date: new Date().toISOString(), provider: 'local llm-gate', results }, null, 2),
);
if (results.some((result) => !result.success)) process.exitCode = 1;
