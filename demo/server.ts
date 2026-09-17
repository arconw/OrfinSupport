import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import {
  createOrfinHandler,
  createTextRetriever,
  createOpenAICompatible,
} from '../src/server/index';
import { knowledge, projectContext, sections } from './data';
import { createWorkspaceMCP } from './mcp';

const mcp = await createWorkspaceMCP();
const handler = createOrfinHandler({
  provider: createOpenAICompatible({
    baseURL: process.env.ORFIN_API_URL ?? 'http://127.0.0.1:8787/codex/v1',
    model: process.env.ORFIN_MODEL ?? 'gpt-5.6-sol',
    apiKey: process.env.ORFIN_API_KEY,
    toolMode: process.env.ORFIN_TOOL_MODE === 'native' ? 'native' : 'prompt',
    parameters: { reasoning_effort: 'low' },
  }),
  context: projectContext,
  sections,
  retriever: createTextRetriever(knowledge),
  tools: [
    ...mcp.tools,
    {
      name: 'project_status',
      description: 'Get current project status for brand, website or mobile.',
      parameters: {
        type: 'object',
        properties: { project: { type: 'string', enum: ['brand', 'website', 'mobile'] } },
        required: ['project'],
        additionalProperties: false,
      },
      execute: (args) => ({
        project: args.project,
        progress: args.project === 'brand' ? 72 : args.project === 'website' ? 48 : 24,
        source: 'Northstar demo data',
      }),
    },
  ],
  features: { pageContext: 'page' },
  allowedOrigins: ['http://127.0.0.1:4173', 'http://localhost:4173'],
});

const server = createServer(async (incoming, outgoing) => {
  if (incoming.url === '/api/health') {
    outgoing.setHeader('Content-Type', 'application/json');
    outgoing.end(
      JSON.stringify({
        status: 'ok',
        mode: 'live',
        model: process.env.ORFIN_MODEL ?? 'gpt-5.6-sol',
        tools: ['project_status', 'team_capacity (MCP)'],
      }),
    );
    return;
  }
  if (incoming.url !== '/api/orfin') {
    outgoing.writeHead(404).end();
    return;
  }
  const abort = new AbortController();
  outgoing.on('close', () => abort.abort());
  try {
    const request = new Request('http://127.0.0.1:4173/api/orfin', {
      method: incoming.method,
      headers: incoming.headers as HeadersInit,
      ...(incoming.method !== 'GET' && incoming.method !== 'HEAD'
        ? { body: Readable.toWeb(incoming) as ReadableStream<Uint8Array>, duplex: 'half' }
        : {}),
      signal: abort.signal,
    });
    const response = await handler(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body)
      Readable.fromWeb(response.body as import('node:stream/web').ReadableStream).pipe(outgoing);
    else outgoing.end();
  } catch {
    if (!outgoing.headersSent) outgoing.writeHead(500);
    outgoing.end();
  }
});
server.listen(4174, '127.0.0.1', () => {
  process.stdout.write('Orfin demo API: http://127.0.0.1:4174\n');
});
async function shutdown() {
  server.close();
  await mcp.close();
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
