import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { createOrfinHandler, createOpenAICompatible } from '../src/server/index';
import { projectContext, sections } from './data';
import { demoRetriever } from './retrieval';
import { createWorkspaceMCP } from './mcp';
import { createStaticHandler } from './static';
import { createStudioTools } from './tools';
import { createDemoSessions } from './sessions';
import { readRequestBody } from '../src/server/validation';

const port = Number(process.env.ORFIN_DEMO_PORT ?? 4174);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid demo port.');
const origin = `http://127.0.0.1:${port}`;
const serveStatic = process.env.ORFIN_DEMO_STATIC_DIR
  ? createStaticHandler(process.env.ORFIN_DEMO_STATIC_DIR)
  : undefined;
const mcp = await createWorkspaceMCP();
const sessions = createDemoSessions();
const studioTools = createStudioTools(sessions.carts);
const handler = createOrfinHandler({
  provider: createOpenAICompatible({
    baseURL: process.env.ORFIN_API_URL ?? 'http://127.0.0.1:8787/codex/v1',
    model: process.env.ORFIN_MODEL ?? 'gpt-5.6-sol',
    apiKey: process.env.ORFIN_API_KEY,
    toolMode: process.env.ORFIN_TOOL_MODE === 'native' ? 'native' : 'prompt',
    parameters: { reasoning_effort: 'low' },
  }),
  context: projectContext,
  authorize: (request) => ({ identity: sessions.identify(request.headers.get('cookie') ?? '').id }),
  sections,
  retriever: demoRetriever,
  tools: [
    ...mcp.tools,
    ...studioTools,
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
  onProviderRetry({ attempt, delayMs, status }) {
    console.info(
      `[Orfin demo] Model retry ${attempt}, delay ${delayMs}ms, status ${status ?? 'stream'}`,
    );
  },
  onError(error) {
    const message = error instanceof Error ? error.message : '';
    const reason =
      error instanceof SyntaxError
        ? 'Invalid provider JSON'
        : /^(Model provider|Model stream|The model returned|Tool response|The assistant reached|The response exceeded|Too many tool)/.test(
              message,
            )
          ? message
          : 'Transport or request failure';
    console.error(`[Orfin demo] ${reason}`);
  },
  allowedOrigins: [
    'http://127.0.0.1:4173',
    'http://localhost:4173',
    origin,
    `http://localhost:${port}`,
  ],
});

const server = createServer(async (incoming, outgoing) => {
  if (incoming.url === '/api/health') {
    outgoing.setHeader('Content-Type', 'application/json');
    outgoing.end(
      JSON.stringify({
        status: 'ok',
        mode: 'live',
        model: process.env.ORFIN_MODEL ?? 'gpt-5.6-sol',
        tools: [
          'project_status',
          ...mcp.tools.map((tool) => `${tool.name} (MCP)`),
          ...studioTools.map((tool) => tool.name),
        ],
        preview: !!serveStatic,
        revision: process.env.ORFIN_DEMO_REVISION,
      }),
    );
    return;
  }
  if (incoming.url !== '/api/orfin' && incoming.url !== '/api/cart') {
    if (serveStatic) await serveStatic(incoming, outgoing);
    else outgoing.writeHead(404).end();
    return;
  }
  const abort = new AbortController();
  outgoing.on('close', () => abort.abort());
  try {
    const visitor = sessions.identify(incoming.headers.cookie);
    if (visitor.cookie) outgoing.setHeader('Set-Cookie', visitor.cookie);
    const headers = new Headers(incoming.headers as HeadersInit);
    headers.set('cookie', `orfin_demo=${visitor.id}`);
    const request = new Request(`${origin}${incoming.url}`, {
      method: incoming.method,
      headers,
      ...(incoming.method !== 'GET' && incoming.method !== 'HEAD'
        ? { body: Readable.toWeb(incoming) as ReadableStream<Uint8Array>, duplex: 'half' }
        : {}),
      signal: abort.signal,
    });
    let response: Response;
    if (incoming.url === '/api/cart') {
      const requestOrigin = request.headers.get('origin');
      if (
        requestOrigin &&
        ![
          origin,
          `http://localhost:${port}`,
          'http://127.0.0.1:4173',
          'http://localhost:4173',
        ].includes(requestOrigin)
      ) {
        response = Response.json({ error: 'Origin not allowed.' }, { status: 403 });
      } else if (request.method === 'GET') response = Response.json(sessions.read(visitor.id));
      else if (request.method === 'PATCH') {
        try {
          if (!request.headers.get('content-type')?.includes('application/json'))
            throw new Error('JSON required.');
          response = Response.json(
            sessions.change(visitor.id, await readRequestBody(request, 4096)),
          );
        } catch {
          response = Response.json({ error: 'Invalid cart update.' }, { status: 400 });
        }
      } else response = Response.json({ error: 'Use GET or PATCH.' }, { status: 405 });
      response.headers.set('Cache-Control', 'no-store');
    } else response = await handler(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body)
      Readable.fromWeb(response.body as import('node:stream/web').ReadableStream).pipe(outgoing);
    else outgoing.end();
  } catch {
    if (!outgoing.headersSent) outgoing.writeHead(500);
    outgoing.end();
  }
});
server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Orfin ${serveStatic ? 'production preview' : 'demo API'}: ${origin}\n`);
});
async function shutdown() {
  server.close();
  await mcp.close();
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
