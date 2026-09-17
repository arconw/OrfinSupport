import { createOrfinHandler, createOpenAICompatible } from 'orfinsupport/server';
import { sections } from '../../sections';

export const runtime = 'nodejs';
export const POST = createOrfinHandler({
  provider: createOpenAICompatible({
    baseURL: process.env.ORFIN_API_URL ?? 'http://127.0.0.1:8787/codex/v1',
    model: process.env.ORFIN_MODEL ?? 'gpt-5.6-sol',
    apiKey: process.env.ORFIN_API_KEY,
    toolMode: process.env.ORFIN_TOOL_MODE === 'native' ? 'native' : 'prompt',
  }),
  context:
    'This is a Next.js integration example for OrfinSupport. The assistant is named Orfin. It streams through a server Route Handler and supports tours and client-side navigation.',
  sections,
});
