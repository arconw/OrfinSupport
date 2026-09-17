import { readSSE } from './sse';
import { OrfinError } from './errors';
import type { AgentEvent, ChatTransport } from './types';

export interface HttpTransportOptions {
  endpoint: string;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  credentials?: RequestCredentials;
  fetch?: typeof globalThis.fetch;
}

export function createHttpTransport(options: HttpTransportOptions): ChatTransport {
  return {
    async *stream(request, signal) {
      const headers = new Headers(
        typeof options.headers === 'function' ? await options.headers() : options.headers,
      );
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'text/event-stream');
      const response = await (options.fetch ?? fetch)(options.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal,
        credentials: options.credentials ?? 'same-origin',
      });
      if (!response.ok)
        throw new OrfinError(
          response.status === 429
            ? 'rateLimit'
            : [401, 403].includes(response.status)
              ? 'unauthorized'
              : 'connection',
          response.status === 429
            ? 'Too many requests. Try again in a moment.'
            : `The assistant could not connect (${response.status}). Please try again.`,
          response.status,
        );
      if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream'))
        throw new OrfinError(
          'invalidResponse',
          'The assistant endpoint must return an event stream.',
        );
      let completed = false;
      for await (const frame of readSSE(response.body, signal)) {
        const event = JSON.parse(frame.data) as AgentEvent;
        if (event.type === 'done') completed = true;
        yield event;
      }
      if (!completed)
        throw new OrfinError(
          'incomplete',
          'The connection ended before the reply was complete. Please retry.',
        );
    },
  };
}
