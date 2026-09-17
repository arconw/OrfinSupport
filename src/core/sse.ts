export interface ServerSentEvent {
  event: string;
  data: string;
}

export async function* readSSE(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<ServerSentEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const abort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener('abort', abort, { once: true });
  const parse = (frame: string): ServerSentEvent | undefined => {
    let event = 'message';
    const data: string[] = [];
    for (const line of frame.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    return data.length ? { event, data: data.join('\n') } : undefined;
  };
  try {
    while (true) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 1048576) throw new Error('Stream frame exceeds the size limit.');
      let match: RegExpMatchArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        const index = match.index ?? 0;
        const frame = parse(buffer.slice(0, index));
        buffer = buffer.slice(index + match[0].length);
        if (frame) yield frame;
      }
      if (done) {
        signal?.throwIfAborted();
        const frame = parse(buffer);
        if (frame) yield frame;
        break;
      }
    }
  } finally {
    signal?.removeEventListener('abort', abort);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export function encodeSSE(value: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);
}
