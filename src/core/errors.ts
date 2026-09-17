export const errorMessages = {
  connection: 'errorConnection',
  rateLimit: 'errorRateLimit',
  unauthorized: 'errorUnauthorized',
  invalidResponse: 'errorInvalidResponse',
  incomplete: 'errorIncomplete',
  timeout: 'errorTimeout',
  reply: 'errorReply',
} as const;

export type OrfinErrorCode = keyof typeof errorMessages;

export function isOrfinErrorCode(code: unknown): code is OrfinErrorCode {
  return typeof code === 'string' && Object.hasOwn(errorMessages, code);
}

export class OrfinError extends Error {
  constructor(
    readonly code: OrfinErrorCode,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'OrfinError';
  }
}
