# Integration recipes

## Framework recipes

### React and Next.js

```tsx
'use client';

import { OrfinSupport } from 'orfinsupport/react';
import { useRouter } from 'next/navigation';
import { sections } from './sections';

export function Assistant() {
  const router = useRouter();
  return (
    <OrfinSupport
      options={{
        endpoint: '/api/orfin',
        sections,
        navigate: (path) => router.push(path),
        allowedPaths: ['/', '/projects'],
      }}
      onReady={(orfin) => orfin.updateSettings({ hoverDelay: 3000 })}
    />
  );
}
```

Mount this once in your layout. The adapter cleans up through React effects, including development Strict Mode remounts. The [Next example](../examples/next) demonstrates actual SSR, client hydration, routing and a server handler. To run it from a checkout:

```bash
npm ci
npm run build
npm install --prefix examples/next
npm run dev --prefix examples/next
```

### Vue

```vue
<script setup lang="ts">
import { OrfinSupport } from 'orfinsupport/vue';
import { useRouter } from 'vue-router';
import { sections } from './sections';

const router = useRouter();
const options = {
  endpoint: '/api/orfin',
  sections,
  navigate: async (path: string) => {
    await router.push(path);
  },
};
</script>

<template>
  <OrfinSupport :options="options" />
</template>
```

The component emits `ready` with the controller and exposes `getController()`. Unmounting destroys the widget. Vue watches option changes for runtime settings; recreate the component for a new transport or catalog.

### Angular

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideOrfin } from 'orfinsupport/angular';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [provideOrfin({ endpoint: '/api/orfin', theme: 'cloud' })],
});
```

Inject `ORFIN` to access the controller. It is `null` during SSR. The environment provider registers cleanup with `DestroyRef`. For Angular Router integration, pass a router-backed callback from your application’s composition layer. The [Angular browser fixture](../demo/fixtures.tsx) runs an actual Angular application against the same library.

### Plain JavaScript and other frameworks

Import `createOrfin` in a browser mount callback and call `destroy()` during cleanup. The widget uses native DOM APIs and Lit templates; it does not depend on React. Web frameworks that provide a mount/unmount lifecycle can use the same API.

## Reactive language settings

Language can be supplied in `options.locale`, changed in widget preferences, or controlled at runtime. React provides `OrfinProvider` and `useOrfin()`; Vue provides a `useOrfin()` composable with a writable locale ref; Angular provides `injectOrfin()` with signals and a reactive options getter. These APIs stay synchronized with widget changes and preserve the active tour and conversation. See the [complete localization recipes](LOCALIZATION.md).

## Providers

### OpenAI-compatible API

```ts
import { createOpenAICompatible } from 'orfinsupport/providers';

const provider = createOpenAICompatible({
  baseURL: process.env.ORFIN_API_URL!,
  model: process.env.ORFIN_MODEL!,
  apiKey: process.env.ORFIN_API_KEY,
  toolMode: 'native',
});
```

`baseURL` is the base ending before `/chat/completions`, usually `/v1`. Optional `headers`, `parameters` and `fetch` support gateways and application middleware. Core request fields are managed by the provider. SSE parsing handles CRLF, multiline frames and Unicode split across network chunks. Native tool name/argument fragments are reassembled before execution.

### Local development provider

The included demo defaults to the development endpoint used during validation. Override `ORFIN_API_URL`, `ORFIN_MODEL`, `ORFIN_API_KEY` (if required) and `ORFIN_TOOL_MODE` to use your own service. Credentials stay in the server environment.

For local `llm-gate`, use `baseURL: 'http://127.0.0.1:8787/codex/v1'`, an installed model ID, and `toolMode: 'prompt'`. The local gateway used in validation does not require a key. Set `toolMode: 'none'` for text-only model deployments that should never request tools.

### Anthropic

```ts
import { createAnthropic } from 'orfinsupport/providers';

const provider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: process.env.ANTHROPIC_MODEL!,
  maxTokens: 2048,
});
```

This adapter supports Messages API text and tool-use streams. It is covered by protocol fixtures; a paid Anthropic endpoint was not used for live validation.

### Direct streaming

A backend is recommended for private credentials. For a local, unauthenticated model server or an application-owned ephemeral browser credential, the same agent loop can run directly:

```ts
import { createOrfin } from 'orfinsupport';
import { createDirectTransport, createOpenAICompatible } from 'orfinsupport/server';

const orfin = createOrfin({
  transport: createDirectTransport({
    provider: createOpenAICompatible({
      baseURL: 'http://localhost:1234/v1',
      model: 'your-local-model',
    }),
    context: 'A public guide to our product.',
    allowedPaths: ['/projects'],
  }),
});
```

This transport uses Web APIs and can be bundled in the browser; it adds the agent and JSON Schema validator to that bundle. The upstream server must permit your origin through CORS. Direct browser integration makes all included configuration available to the visitor. Never put a private provider key there.

## Retrieval and vector databases

`createTextRetriever` supplies simple lexical ranking for small knowledge collections. `createVectorRetriever` leaves embedding, database access and tenant filtering to the host:

```ts
import { createVectorRetriever } from 'orfinsupport/server';

const retriever = createVectorRetriever({
  async embed(query, { signal }) {
    return embeddings.embed(query, { signal });
  },
  async search(vector, { identity, signal }) {
    const matches = await vectorDatabase.search({
      vector,
      filter: { workspaceId: requireWorkspace(identity).id },
      signal,
    });
    return matches.map((match) => ({
      id: match.id,
      title: match.title,
      content: match.text,
      url: match.url,
      score: match.score,
    }));
  },
  minScore: 0.7,
  limit: 4,
});
```

`embeddings`, `vectorDatabase` and `requireWorkspace` above represent your application services. There is no database-specific dependency in OrfinSupport. Custom retrievers can implement `retrieve(query, context)` directly. The browser receives the selected source records, so return only material that visitor is authorized to read.

## MCP

```bash
npm install @modelcontextprotocol/sdk
```

```ts
import { connectMCP } from 'orfinsupport/mcp';
import { createOrfinHandler } from 'orfinsupport/server';

const connection = await connectMCP({
  url: process.env.WORKSPACE_MCP_URL!,
  allow: ['project_status'],
});

const handler = createOrfinHandler({
  provider,
  context: 'A guide to our workspace.',
  tools: connection.tools,
  authorize,
});
```

Create a connection with the right authentication scope, share it only across requests with that same scope, and call `close()` during shutdown. A globally shared connection is appropriate only when all callers are allowed the same tool identity. For per-user authorization, create or pool connections per user/workspace and select the corresponding handler after authentication. Never reuse a privileged connection across unrelated tenants.

`toolsFromMCP(existingClient, { allow, prefix })` also supports SDK clients connected through stdio or another SDK transport. The bridge follows discovery cursors, forwards `AbortSignal`, rejects `isError` results and keeps remote tool names separate from model-visible prefixes. Pin the optional SDK peer to the compatible 1.x release line used by this package.

The demo automatically connects `workspace_statistics` and `team_capacity` using the official SDK over an in-memory transport: it performs MCP initialization, discovery and calls. `workspace_statistics` returns the current plan, member count, active projects, completed tasks this week and on-time delivery rate. `team_capacity` returns available and planned working days, utilization and remaining capacity. The data are fictional fixtures shared with the demo overview; the calls go through the actual protocol. Production HTTP transport creation is available through `connectMCP`.

Select **Live AI** and leave **Connected tools** enabled in the demo Playground. Ask “Please call the connected MCP workspace statistics tool and tell me the completed task count. Use the tool, not the knowledge documents.” The widget sends the request to `/api/orfin`, displays the running tool and then **workspace statistics · Done**, and streams an answer with **24 completed tasks this week**. No additional MCP setup is needed for this local example. Demo replies do not call MCP. The live browser suite exercises this complete path without response interception on both desktop and mobile.

## Server boundaries

The handler implements request shape/size validation, same-origin checks, tool argument validation, feature allowlists, loop/output limits and safe client errors. It intentionally does not invent an identity system or public rate limiter for your application.

```ts
const handler = createOrfinHandler({
  provider,
  context: 'Your project context.',
  async authorize(request) {
    const session = await sessions.read(request);
    if (!session || !(await quotas.allow(session.userId))) return false;
    return { identity: { userId: session.userId, workspaceId: session.workspaceId } };
  },
  tools,
  retriever,
});
```

These are application services, not OrfinSupport exports. Enforce permissions inside every data-access tool and retriever as well. Any mutating tool should implement the confirmation and idempotency policy appropriate to that operation. Model prompts and frontend switches cannot replace those checks.

For a reverse proxy, preserve the public URL on the `Request` or explicitly configure `allowedOrigins`. Keep response buffering disabled for SSE. `onError` receives server errors; apply your own redaction before writing logs. Client-visible errors never include the provider’s raw response body.

## Reference protocols

- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [OpenAI streaming](https://developers.openai.com/api/docs/guides/streaming-responses)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
