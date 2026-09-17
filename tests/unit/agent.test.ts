import { describe, expect, it, vi } from 'vitest';
import { runAgent } from '../../src/server/agent';
import { createTextRetriever, createVectorRetriever } from '../../src/core/retrieval';
import type { ModelMessage, Tool, ToolContext } from '../../src/core/types';
import { collect, provider, request } from './helpers';

const signal = new AbortController().signal;
const call = (name: string, args: unknown, id = 'call-1') => ({
  type: 'tool_call' as const,
  call: { id, name, arguments: JSON.stringify(args) },
});

describe('agent execution boundaries', () => {
  it('executes a schema-validated custom tool and continues the answer', async () => {
    const execute = vi.fn(() => ({ count: 3 }));
    const tool: Tool = {
      name: 'count',
      description: 'Count',
      parameters: {
        type: 'object',
        properties: { group: { enum: ['a'] } },
        required: ['group'],
        additionalProperties: false,
      },
      execute,
    };
    const events = await collect(
      runAgent(
        {
          context: 'Test',
          provider: provider([
            [call('count', { group: 'a' })],
            [{ type: 'delta', text: '3 items.' }],
          ]),
          tools: [tool],
        },
        request(),
        signal,
      ),
    );
    expect(execute).toHaveBeenCalledOnce();
    expect(events).toContainEqual({ type: 'delta', text: '3 items.' });
    expect(events.at(-1)).toEqual({ type: 'done' });
  });
  it.each([{ group: 'wrong' }, { group: 'a', extra: true }, null])(
    'rejects invalid arguments %j without executing',
    async (args) => {
      const execute = vi.fn();
      const events = await collect(
        runAgent(
          {
            context: 'Test',
            provider: provider([[call('count', args)]]),
            tools: [
              {
                name: 'count',
                description: 'Count',
                parameters: {
                  type: 'object',
                  properties: { group: { enum: ['a'] } },
                  required: ['group'],
                  additionalProperties: false,
                },
                execute,
              },
            ],
          },
          request(),
          signal,
        ),
      );
      expect(execute).not.toHaveBeenCalled();
      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'tool',
          tool: expect.objectContaining({ status: 'error' }),
        }),
      );
    },
  );
  it('server-disabled capabilities cannot be re-enabled by a client', async () => {
    const execute = vi.fn();
    const events = await collect(
      runAgent(
        {
          context: 'Test',
          features: { tools: false, navigation: false, sectionPicker: false },
          provider: provider([
            [
              call('danger', {}),
              call('navigate', { path: '/projects' }, 'call-2'),
              call('highlight_section', { sectionId: 'projects' }, 'call-3'),
            ],
          ]),
          tools: [{ name: 'danger', description: '', parameters: { type: 'object' }, execute }],
        },
        request(),
        signal,
      ),
    );
    expect(execute).not.toHaveBeenCalled();
    expect(events.filter((event) => event.type === 'action')).toHaveLength(0);
  });
  it('validates built-in navigation against the server allowlist', async () => {
    const events = await collect(
      runAgent(
        {
          context: 'Test',
          allowedPaths: ['/projects'],
          provider: provider([[call('navigate', { path: 'https://evil.test' })]]),
        },
        request(),
        signal,
      ),
    );
    expect(events.filter((event) => event.type === 'action')).toHaveLength(0);
  });
  it('emits a validated highlight action', async () => {
    const events = await collect(
      runAgent(
        {
          context: 'Test',
          provider: provider([[call('highlight_section', { sectionId: 'projects' })]]),
        },
        request(),
        signal,
      ),
    );
    expect(events).toContainEqual({
      type: 'action',
      action: { type: 'highlight', sectionId: 'projects' },
    });
  });
  it('bounds repeated tools and loop depth', async () => {
    const execute = vi.fn(() => 'ok');
    const options = {
      context: 'Test',
      tools: [{ name: 'lookup', description: '', parameters: { type: 'object' }, execute }],
      maxToolRounds: 2,
      provider: provider([[call('lookup', {})], [call('lookup', {})], [call('lookup', {})]]),
    };
    await expect(collect(runAgent(options, request(), signal))).rejects.toThrow('tool limit');
    expect(execute).toHaveBeenCalledOnce();
  });
  it('does not include whole-page text without server opt-in', async () => {
    let messages: ModelMessage[] = [];
    const data = request();
    data.page.text = 'PRIVATE_PAGE_SENTINEL';
    data.features.pageContext = 'page';
    await collect(
      runAgent(
        {
          context: 'Test',
          provider: {
            async *stream(input) {
              messages = input.messages;
              yield { type: 'delta', text: 'ok' };
            },
          },
        },
        data,
        signal,
      ),
    );
    expect(JSON.stringify(messages)).not.toContain('PRIVATE_PAGE_SENTINEL');
  });
  it('uses trusted section prompts and ignores client section instructions', async () => {
    let messages: ModelMessage[] = [];
    const data = request();
    data.page.sections[0]!.prompt = 'CLIENT_INSTRUCTION';
    await collect(
      runAgent(
        {
          context: 'Test',
          sections: [
            {
              id: 'projects',
              title: 'Projects',
              description: 'Trusted',
              prompt: 'TRUSTED_INSTRUCTION',
            },
          ],
          provider: {
            async *stream(input) {
              messages = input.messages;
              yield { type: 'delta', text: 'ok' };
            },
          },
        },
        data,
        signal,
      ),
    );
    expect(messages[0]!.content).toContain('TRUSTED_INSTRUCTION');
  });
  it('includes retrieval sources and propagates identity to the retriever', async () => {
    const retrieve = vi.fn(async (_query: string, _context: ToolContext) => [
      { id: '1', title: 'Reference', content: 'The answer.' },
    ]);
    const events = await collect(
      runAgent(
        { context: 'Test', provider: provider([]), retriever: { retrieve } },
        request(),
        signal,
        { userId: 'test' },
      ),
    );
    expect(events[0]).toMatchObject({ type: 'sources' });
    expect(retrieve.mock.calls[0]?.[1]).toMatchObject({ identity: { userId: 'test' } });
  });
});

describe('retrieval adapters', () => {
  it('ranks text documents and omits irrelevant results', async () => {
    const retriever = createTextRetriever([
      { id: '1', title: 'Billing', content: 'Studio plan pricing' },
      { id: '2', title: 'Docs', content: 'Create a project' },
    ]);
    expect(
      (await retriever.retrieve('studio pricing', { signal, request: request() })).map(
        (doc) => doc.id,
      ),
    ).toEqual(['1']);
  });
  it('passes embedded vectors to the host search and applies score thresholds', async () => {
    const search = vi.fn(async (_vector: number[]) => [
      { id: '1', title: 'Good', content: 'a', score: 0.9 },
      { id: '2', title: 'Bad', content: 'b', score: 0.1 },
    ]);
    const retriever = createVectorRetriever({
      embed: async () => [1, 2, 3],
      search,
      minScore: 0.5,
    });
    expect(await retriever.retrieve('test', { signal, request: request() })).toHaveLength(1);
    expect(search.mock.calls[0]?.[0]).toEqual([1, 2, 3]);
  });
});
