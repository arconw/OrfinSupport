import { describe, expect, it, vi } from 'vitest';
import { createOrfinHandler } from '../../src/server/handler';
import { createHttpTransport } from '../../src/core/transport';
import { collect, provider, request } from './helpers';

const makeRequest = (body: unknown = request(), headers: Record<string, string> = {}) =>
  new Request('https://example.test/api/orfin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
const options = () => ({
  provider: provider([[{ type: 'delta' as const, text: 'Hello from Orfin.' }]]),
  context: 'Test workspace',
});

describe('server handler', () => {
  it('streams a complete server-to-browser conversation', async () => {
    const handler = createOrfinHandler(options());
    const transport = createHttpTransport({
      endpoint: 'https://example.test/api/orfin',
      fetch: async (_url, init) => handler(new Request('https://example.test/api/orfin', init)),
    });
    expect(await collect(transport.stream(request(), new AbortController().signal))).toEqual([
      { type: 'delta', text: 'Hello from Orfin.' },
      { type: 'done' },
    ]);
  });
  it.each([
    [{ ...request(), messages: [{ role: 'system', content: 'Untrusted override' }] }, 400],
    [{ ...request(), messages: [] }, 400],
    [{ ...request(), messages: [{ role: 'assistant', content: 'not a visitor' }] }, 400],
    [{ ...request(), extra: 'unexpected' }, 400],
    [{ ...request(), messages: [{ role: 'user', content: 'x'.repeat(12001) }] }, 400],
  ])('rejects malformed conversation %j', async (body, status) => {
    const response = await createOrfinHandler(options())(makeRequest(body));
    expect(response.status).toBe(status);
  });
  it('rejects cross-origin requests and non-JSON content', async () => {
    const handler = createOrfinHandler(options());
    expect((await handler(makeRequest(request(), { Origin: 'https://other.test' }))).status).toBe(
      403,
    );
    expect((await handler(makeRequest(request(), { 'Content-Type': 'text/plain' }))).status).toBe(
      415,
    );
  });
  it('enforces authorization before parsing or contacting the provider', async () => {
    const stream = vi.fn();
    const handler = createOrfinHandler({
      ...options(),
      provider: { stream },
      authorize: () => false,
    });
    expect((await handler(makeRequest())).status).toBe(401);
    expect(stream).not.toHaveBeenCalled();
  });
  it('enforces the actual body limit even without content-length', async () => {
    expect(
      (await createOrfinHandler({ ...options(), maxBodyBytes: 20 })(makeRequest())).status,
    ).toBe(413);
  });
  it('returns safe error events after a provider failure', async () => {
    const handler = createOrfinHandler({
      ...options(),
      provider: {
        async *stream() {
          yield { type: 'delta', text: 'Partial.' };
          throw new Error('SENSITIVE_DIAGNOSTIC');
        },
      },
    });
    const response = await handler(makeRequest());
    const text = await response.text();
    expect(text).toContain('could not complete');
    expect(text).not.toContain('SENSITIVE_DIAGNOSTIC');
    expect(text).toContain('"type":"done"');
  });
  it('aborts provider work when the response reader cancels', async () => {
    let signal: AbortSignal | undefined;
    const handler = createOrfinHandler({
      ...options(),
      provider: {
        async *stream(input) {
          signal = input.signal;
          yield { type: 'delta', text: 'Start' };
          await new Promise<void>((resolve) =>
            input.signal.addEventListener('abort', () => resolve(), { once: true }),
          );
          input.signal.throwIfAborted();
        },
      },
    });
    const response = await handler(makeRequest());
    const reader = response.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(signal?.aborted).toBe(true);
  });
  it('blocks chat disabled in server configuration', async () => {
    expect(
      (await createOrfinHandler({ ...options(), features: { chat: false } })(makeRequest())).status,
    ).toBe(403);
  });
});
