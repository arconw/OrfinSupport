import Ajv from 'ajv';
import type { ChatRequest } from '../core/types';

const string = (maxLength: number) => ({ type: 'string', maxLength });
const featureNames = ['chat', 'tour', 'sectionPicker', 'hoverHelp', 'navigation', 'tools'];
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['messages', 'page', 'features', 'locale'],
  properties: {
    messages: {
      type: 'array',
      minItems: 1,
      maxItems: 40,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['role', 'content'],
        properties: {
          role: { enum: ['user', 'assistant'] },
          content: { ...string(12000), minLength: 1 },
        },
      },
    },
    locale: { enum: ['en', 'ru'] },
    features: {
      type: 'object',
      additionalProperties: false,
      required: [...featureNames, 'pageContext'],
      properties: {
        ...Object.fromEntries(featureNames.map((name) => [name, { type: 'boolean' }])),
        pageContext: { enum: ['sections', 'page'] },
      },
    },
    page: {
      type: 'object',
      additionalProperties: false,
      required: ['url', 'title', 'sections'],
      properties: {
        url: string(2000),
        title: string(300),
        text: string(12000),
        selectedSectionId: string(100),
        sections: {
          type: 'array',
          maxItems: 100,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'title', 'description'],
            properties: {
              id: { ...string(100), pattern: '^[a-zA-Z0-9_-]+$' },
              title: string(200),
              description: string(2000),
              path: string(500),
              tourOrder: { type: 'number' },
            },
          },
        },
      },
    },
  },
};
const validate = new Ajv().compile<ChatRequest>(schema);

export function validateChatRequest(input: unknown): input is ChatRequest {
  return Boolean(validate(input)) && (input as ChatRequest).messages.at(-1)?.role === 'user';
}

export async function readRequestBody(request: Request, maxBytes: number): Promise<unknown> {
  if (Number(request.headers.get('content-length')) > maxBytes)
    throw new RangeError('Request too large.');
  if (!request.body) throw new SyntaxError('Request is empty.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RangeError('Request too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(buffer));
}
