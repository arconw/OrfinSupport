import { describe, expect, it, vi } from 'vitest';
import { createOpenAICompatible } from '../../src/providers/openai';
import { createAnthropic } from '../../src/providers/anthropic';
import { readSSE } from '../../src/core/sse';
import { collect, streamedResponse } from './helpers';

const signal = new AbortController().signal;
const input = { messages: [{ role: 'user' as const, content: 'Hello' }], tools: [], signal };

describe('SSE and model providers', () => {
  it('decodes Unicode split inside byte sequences and CRLF boundaries', async () => {
    const response = streamedResponse([{ text: 'Привет 🌟' }, '[DONE]'], 1);
    const frames = await collect(readSSE(response.body!));
    expect(JSON.parse(frames[0]!.data)).toEqual({ text: 'Привет 🌟' });
    expect(frames[1]!.data).toBe('[DONE]');
  });
  it('supports multiline data, comments and an unterminated last frame', async () => {
    const response = new Response(': heartbeat\n\nevent: update\ndata: first\ndata: second');
    expect(await collect(readSSE(response.body!))).toEqual([
      { event: 'update', data: 'first\nsecond' },
    ]);
  });
  it('reassembles fragmented native tool calls without exposing argument deltas', async () => {
    const fetch = vi.fn(async () =>
      streamedResponse([
        {
          choices: [
            {
              delta: {
                tool_calls: [
                  { index: 0, id: 'call-1', function: { name: 'lookup', arguments: '{"id":' } },
                ],
              },
            },
          ],
        },
        { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"a"}' } }] } }] },
        '[DONE]',
      ]),
    );
    const model = createOpenAICompatible({
      baseURL: 'http://example.test/v1/',
      model: 'test',
      fetch,
    });
    expect(await collect(model.stream(input))).toEqual([
      { type: 'tool_call', call: { id: 'call-1', name: 'lookup', arguments: '{"id":"a"}' } },
    ]);
    expect(fetch.mock.calls[0]).toBeDefined();
  });
  it('extracts prompt tools across many chunks for llm-gate', async () => {
    const body = '  <orfin-tool>{"name":"lookup","arguments":{"id":"a"}}</orfin-tool>';
    const model = createOpenAICompatible({
      baseURL: 'http://example.test/v1',
      model: 'test',
      toolMode: 'prompt',
      fetch: async () =>
        streamedResponse(
          [...body]
            .map((content) => ({ choices: [{ delta: { content } }] }))
            .concat([{ choices: [{ delta: { content: '' } }] }], ['[DONE]' as never]),
        ),
    });
    const events = await collect(model.stream(input));
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'tool_call',
      call: { name: 'lookup', arguments: '{"id":"a"}' },
    });
  });
  it('streams ordinary text immediately in prompt mode', async () => {
    const model = createOpenAICompatible({
      baseURL: 'http://example.test/v1',
      model: 'test',
      toolMode: 'prompt',
      fetch: async () =>
        streamedResponse([
          { choices: [{ delta: { content: 'Hello ' } }] },
          { choices: [{ delta: { content: '🌟' } }] },
          '[DONE]',
        ]),
    });
    expect(await collect(model.stream(input))).toEqual([
      { type: 'delta', text: 'Hello ' },
      { type: 'delta', text: '🌟' },
    ]);
  });
  it('does not put native tools in llm-gate requests', async () => {
    let payload: Record<string, unknown> = {};
    const model = createOpenAICompatible({
      baseURL: 'http://example.test',
      model: 'test',
      toolMode: 'prompt',
      fetch: async (_url, init) => {
        payload = JSON.parse(init!.body as string);
        return streamedResponse(['[DONE]']);
      },
    });
    await collect(
      model.stream({
        ...input,
        tools: [{ name: 'lookup', description: 'Look up.', parameters: { type: 'object' } }],
      }),
    );
    expect(payload).not.toHaveProperty('tools');
  });
  it('rejects incomplete streams and malformed tool envelopes', async () => {
    const model = createOpenAICompatible({
      baseURL: 'http://example.test',
      model: 'test',
      fetch: async () => streamedResponse([{ choices: [{ delta: { content: 'Partial' } }] }]),
    });
    await expect(collect(model.stream(input))).rejects.toThrow('unexpectedly');
    const toolModel = createOpenAICompatible({
      baseURL: 'http://example.test',
      model: 'test',
      toolMode: 'prompt',
      fetch: async () =>
        streamedResponse([{ choices: [{ delta: { content: '<orfin-tool>{}' } }] }, '[DONE]']),
    });
    await expect(collect(toolModel.stream(input))).rejects.toThrow('incomplete');
  });
  it('redacts provider errors and propagates abortion', async () => {
    const model = createOpenAICompatible({
      baseURL: 'http://example.test',
      model: 'test',
      fetch: async () => new Response('private upstream diagnostic', { status: 502 }),
    });
    await expect(collect(model.stream(input))).rejects.toThrow('HTTP 502');
    const abort = new AbortController();
    abort.abort();
    await expect(
      collect(readSSE(new Response('data: hello\n\n').body!, abort.signal)),
    ).rejects.toThrow();
  });
  it('streams Anthropic text and assembles tool inputs', async () => {
    const model = createAnthropic({
      apiKey: 'test-placeholder',
      model: 'fixture',
      fetch: async () =>
        streamedResponse([
          {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'text_delta', text: 'Checking.' },
          },
          {
            type: 'content_block_start',
            index: 1,
            content_block: { type: 'tool_use', id: 'call-a', name: 'lookup' },
          },
          {
            type: 'content_block_delta',
            index: 1,
            delta: { type: 'input_json_delta', partial_json: '{"id":"a"}' },
          },
          { type: 'message_stop' },
        ]),
    });
    expect(await collect(model.stream(input))).toEqual([
      { type: 'delta', text: 'Checking.' },
      { type: 'tool_call', call: { id: 'call-a', name: 'lookup', arguments: '{"id":"a"}' } },
    ]);
  });
});
