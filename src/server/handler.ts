import { encodeSSE } from '../core/sse';
import type { AgentOptions } from '../core/types';
import { runAgent } from './agent';
import { readRequestBody, validateChatRequest } from './validation';

export interface HandlerOptions extends AgentOptions {
  authorize?: (
    request: Request,
  ) => Promise<false | { identity?: unknown }> | false | { identity?: unknown };
  allowedOrigins?: string[];
  maxBodyBytes?: number;
  timeoutMs?: number;
  onError?: (error: unknown) => void;
}

export function createOrfinHandler(
  options: HandlerOptions,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const jsonError = (message: string, status: number) =>
      Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
    if (request.method !== 'POST') return jsonError('Use POST.', 405);
    if (!request.headers.get('content-type')?.includes('application/json'))
      return jsonError('Send application/json.', 415);
    const origin = request.headers.get('origin');
    if (origin && !(options.allowedOrigins ?? [new URL(request.url).origin]).includes(origin))
      return jsonError('Origin is not allowed.', 403);
    let access: false | { identity?: unknown } = {};
    try {
      access = (await options.authorize?.(request)) ?? {};
    } catch {
      return jsonError('Authorization failed.', 401);
    }
    if (access === false) return jsonError('Unauthorized.', 401);
    let body: unknown;
    try {
      body = await readRequestBody(request, options.maxBodyBytes ?? 131072);
    } catch (error) {
      return jsonError(
        error instanceof RangeError ? 'Request too large.' : 'Invalid JSON.',
        error instanceof RangeError ? 413 : 400,
      );
    }
    if (!validateChatRequest(body)) return jsonError('Invalid assistant request.', 400);
    if (options.features?.chat === false || !body.features.chat)
      return jsonError('Chat is disabled.', 403);
    const abort = new AbortController();
    const signal = AbortSignal.any([
      request.signal,
      abort.signal,
      AbortSignal.timeout(options.timeoutMs ?? 120000),
    ]);
    const iterator = runAgent(options, body, signal, access.identity);
    let ended = false;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        if (ended) return;
        try {
          const result = await iterator.next();
          if (signal.aborted) {
            ended = true;
            controller.close();
            return;
          }
          if (result.done) {
            ended = true;
            controller.close();
          } else controller.enqueue(encodeSSE(result.value));
        } catch (error) {
          if (ended) return;
          ended = true;
          options.onError?.(error);
          if (!abort.signal.aborted && !request.signal.aborted) {
            controller.enqueue(
              encodeSSE({
                type: 'error',
                code: signal.aborted ? 'timeout' : 'reply',
                message: signal.aborted
                  ? 'The response timed out. Please try again.'
                  : 'The assistant could not complete this reply. Please try again.',
              }),
            );
            controller.enqueue(encodeSSE({ type: 'done' }));
            controller.close();
          }
        }
      },
      async cancel() {
        ended = true;
        abort.abort();
        await iterator.return(undefined);
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  };
}
