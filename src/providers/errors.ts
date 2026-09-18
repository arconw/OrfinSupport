export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly status?: number;
  readonly retryAfterMs: number;

  constructor(
    message: string,
    options: { retryable?: boolean; status?: number; retryAfterMs?: number } = {},
  ) {
    super(message);
    this.name = 'ProviderError';
    this.retryable = options.retryable ?? false;
    this.status = options.status;
    this.retryAfterMs = Number.isFinite(options.retryAfterMs)
      ? Math.max(0, Math.min(5000, options.retryAfterMs!))
      : 0;
  }
}

export function providerHttpError(response: Response): ProviderError {
  const retryAfter = response.headers.get('retry-after');
  const delay = retryAfter
    ? /^\d+(\.\d+)?$/.test(retryAfter)
      ? Number(retryAfter) * 1000
      : Date.parse(retryAfter) - Date.now()
    : 0;
  return new ProviderError(`Model provider returned HTTP ${response.status}.`, {
    status: response.status,
    retryable: [408, 409, 429].includes(response.status) || response.status >= 500,
    retryAfterMs: delay,
  });
}

export function providerStreamError(error: unknown): ProviderError {
  const details = error && typeof error === 'object' ? (error as Record<string, unknown>) : {};
  return new ProviderError('Model provider reported a streaming error.', {
    retryable:
      [
        'provider_error',
        'api_error',
        'overloaded_error',
        'rate_limit_error',
        'server_error',
      ].includes(String(details.type)) &&
      !['insufficient_quota', 'usage_limit_exceeded'].includes(String(details.code)),
  });
}

export async function providerFetch(
  input: string,
  init: RequestInit,
  fetcher: typeof fetch,
): Promise<Response> {
  try {
    return await fetcher(input, init);
  } catch (error) {
    init.signal?.throwIfAborted();
    if (error instanceof TypeError)
      throw new ProviderError('Model provider could not connect.', { retryable: true });
    throw error;
  }
}
