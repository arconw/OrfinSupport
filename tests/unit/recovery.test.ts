import { describe, expect, it, vi } from 'vitest';
import { createOpenAICompatible } from '../../src/providers/openai';
import { createOrfinHandler } from '../../src/server/handler';
import { runAgent } from '../../src/server/agent';
import { collect, request, streamedResponse } from './helpers';
import type { ProviderRequest } from '../../src/core/types';

const text = (content: string) =>
  streamedResponse([{ choices: [{ delta: { content } }] }, '[DONE]']);
const unavailable = () =>
  streamedResponse([{ error: { type: 'provider_error', message: 'Model at capacity' } }, '[DONE]']);
const provider = (fetcher: typeof fetch) =>
  createOpenAICompatible({
    baseURL: 'https://provider.test/v1',
    model: 'model',
    toolMode: 'prompt',
    fetch: fetcher,
  });

describe('model step recovery', () => {
  it('recovers capacity after a cart action without executing the action twice', async () => {
    const bodies: unknown[] = [];
    const fetcher = vi.fn(async (_input: unknown, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)));
      if (bodies.length === 1)
        return text('<orfin-tool>{"name":"add_to_cart","arguments":{}}</orfin-tool>');
      if (bodies.length === 2) return unavailable();
      return text('Two displays are in your cart.');
    });
    const execute = vi.fn((_args, context) => {
      context.emitAction({ type: 'custom', name: 'cart_changed', payload: { quantity: 2 } });
      return { quantity: 2 };
    });
    const onProviderRetry = vi.fn();
    const events = await collect(
      runAgent(
        {
          provider: provider(fetcher),
          context: 'Shop',
          providerRetries: 1,
          onProviderRetry,
          tools: [
            {
              name: 'add_to_cart',
              description: 'Add displays',
              parameters: { type: 'object' },
              execute,
            },
          ],
        },
        request(),
        new AbortController().signal,
      ),
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(bodies[1]).toEqual(bodies[2]);
    expect(events.filter((event) => event.type === 'action')).toHaveLength(1);
    expect(
      events.filter((event) => event.type === 'tool').map((event) => event.tool.status),
    ).toEqual(['running', 'complete']);
    expect(events.filter((event) => event.type === 'delta')).toEqual([
      { type: 'delta', text: 'Two displays are in your cart.' },
    ]);
    expect(events.at(-1)?.type).toBe('done');
    expect(onProviderRetry).toHaveBeenCalledWith({ attempt: 1, delayMs: 500, status: undefined });
  });

  it('keeps partial output and reports a stream failure without retrying it', async () => {
    const fetcher = vi.fn(async () =>
      streamedResponse([
        { choices: [{ delta: { content: 'Partial reply.' } }] },
        { error: { type: 'provider_error' } },
        '[DONE]',
      ]),
    );
    const handler = createOrfinHandler({ provider: provider(fetcher), context: 'Workspace' });
    const response = await handler(
      new Request('https://host.test/api/orfin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request()),
      }),
    );
    const body = await response.text();
    expect(body.match(/Partial reply\./g)).toHaveLength(1);
    expect(body).toContain('"type":"error"');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([401, 400])(
    'does not retry HTTP %i authorization or request failures',
    async (status) => {
      const fetcher = vi.fn(async () => new Response('', { status }));
      await expect(
        collect(
          runAgent(
            { provider: provider(fetcher), context: 'Workspace' },
            request(),
            new AbortController().signal,
          ),
        ),
      ).rejects.toThrow(`HTTP ${status}`);
      expect(fetcher).toHaveBeenCalledTimes(1);
    },
  );

  it('retries rate limits and server unavailability, within a fixed budget', async () => {
    const fetcher = vi.fn(
      async () => new Response('', { status: 503, headers: { 'Retry-After': '0' } }),
    );
    await expect(
      collect(
        runAgent(
          { provider: provider(fetcher), providerRetries: 1, context: 'Workspace' },
          request(),
          new AbortController().signal,
        ),
      ),
    ).rejects.toThrow('HTTP 503');
    expect(fetcher).toHaveBeenCalledTimes(2);
    const limited = vi.fn(async () =>
      limited.mock.calls.length === 1 ? new Response('', { status: 429 }) : text('Recovered.'),
    );
    const result = await collect(
      runAgent(
        { provider: provider(limited), context: 'Workspace' },
        request(),
        new AbortController().signal,
      ),
    );
    expect(limited).toHaveBeenCalledTimes(2);
    expect(result.at(-1)?.type).toBe('done');
  });

  it('honors cancellation during backoff without another model request', async () => {
    const abort = new AbortController();
    const fetcher = vi.fn(async () => unavailable());
    await expect(
      collect(
        runAgent(
          {
            provider: provider(fetcher),
            context: 'Workspace',
            onProviderRetry: () => abort.abort(new Error('Visitor stopped')),
          },
          request(),
          abort.signal,
        ),
      ),
    ).rejects.toThrow('Visitor stopped');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not retry unknown custom provider failures', async () => {
    const stream = vi.fn(async function* (_input: ProviderRequest) {
      throw new Error('Custom failure');
    });
    await expect(
      collect(
        runAgent(
          { provider: { stream }, context: 'Workspace' },
          request(),
          new AbortController().signal,
        ),
      ),
    ).rejects.toThrow('Custom failure');
    expect(stream).toHaveBeenCalledTimes(1);
  });
});
