import { defaultSettings } from '../../src/core/settings';
import type { ChatRequest, ModelProvider, ProviderEvent } from '../../src/core/types';

export function request(overrides: Partial<ChatRequest> = {}): ChatRequest {
  return {
    messages: [{ role: 'user', content: 'Where are projects?' }],
    page: {
      url: 'https://example.test/',
      title: 'Test',
      sections: [
        { id: 'projects', title: 'Projects', description: 'Manage projects.', path: '/projects' },
      ],
    },
    features: { ...defaultSettings.features },
    locale: 'en',
    ...overrides,
  };
}

export function provider(turns: ProviderEvent[][]): ModelProvider {
  let index = 0;
  return {
    async *stream() {
      yield* turns[index++] ?? [{ type: 'delta', text: 'Complete.' }];
    },
  };
}

export function streamedResponse(frames: unknown[], chunkSize = 7) {
  const bytes = new TextEncoder().encode(
    frames
      .map((frame) => `data: ${typeof frame === 'string' ? frame : JSON.stringify(frame)}\r\n\r\n`)
      .join(''),
  );
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < bytes.length; i += chunkSize)
          controller.enqueue(bytes.slice(i, i + chunkSize));
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  );
}

export async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of iterable) result.push(item);
  return result;
}
