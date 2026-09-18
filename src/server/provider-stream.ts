import type { AgentOptions, ProviderEvent, ProviderRequest } from '../core/types';
import { ProviderError } from '../providers/errors';

function waitForRetry(delay: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, delay);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function* streamProvider(
  options: AgentOptions,
  request: ProviderRequest,
): AsyncGenerator<ProviderEvent> {
  const retries = Number.isFinite(options.providerRetries)
    ? Math.min(3, Math.max(0, Math.floor(options.providerRetries!)))
    : 2;
  for (let attempt = 0; ; attempt++) {
    let emitted = false;
    try {
      for await (const event of options.provider.stream(request)) {
        request.signal.throwIfAborted();
        if (event.type === 'tool_call' || event.text.length) emitted = true;
        yield event;
      }
      return;
    } catch (error) {
      request.signal.throwIfAborted();
      if (emitted || attempt >= retries || !(error instanceof ProviderError) || !error.retryable)
        throw error;
      const delayMs = Math.max(500 * 2 ** attempt, error.retryAfterMs);
      options.onProviderRetry?.({ attempt: attempt + 1, delayMs, status: error.status });
      await waitForRetry(delayMs, request.signal);
    }
  }
}
