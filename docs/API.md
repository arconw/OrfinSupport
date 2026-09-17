# API reference

## Package entry points

| Import                   | Exports                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `orfinsupport`           | `createOrfin`, controller, client options, core types and utilities                        |
| `orfinsupport/core`      | Shared types, settings, HTTP transport, SSE and retrieval helpers                          |
| `orfinsupport/server`    | `createOrfinHandler`, `runAgent`, `createDirectTransport`, providers and retrieval helpers |
| `orfinsupport/providers` | `createOpenAICompatible`, `createAnthropic`, provider contract                             |
| `orfinsupport/mcp`       | `connectMCP`, `toolsFromMCP`                                                               |
| `orfinsupport/react`     | `OrfinSupport` client component                                                            |
| `orfinsupport/vue`       | `OrfinSupport` Vue component                                                               |
| `orfinsupport/angular`   | `provideOrfin`, `ORFIN` injection token                                                    |

The package ships ESM and TypeScript declarations. Frameworks and the MCP SDK are optional peers. Import only the adapters you use.

## Client options

```ts
import { createOrfin } from 'orfinsupport';

const orfin = createOrfin({
  endpoint: '/api/orfin',
  initiallyOpen: false,
  theme: 'cloud',
  locale: 'en',
  hoverDelay: 2200,
  hoverCooldown: 30000,
  highlightDuration: 2000,
  features: {
    chat: true,
    tour: true,
    sectionPicker: true,
    hoverHelp: true,
    navigation: true,
    tools: true,
    pageContext: 'sections',
  },
  memory: {
    storage: 'session',
    rememberVisited: true,
    rememberDismissed: true,
    ttlMs: 86400000,
    key: 'orfin:my-product:v1',
  },
});
```

`transport` overrides `endpoint`. `title` and `welcome` customize the empty state. `sections` supplies the public catalog. `allowedPaths` restricts navigation; without it, allowed paths come from the section catalog. `navigate` plugs into the host router. `themeVariables` accepts `--orfin-*` CSS custom properties. `nonce` is applied to the injected style element. `onEvent({ type, detail })` observes interaction events without receiving message content.

Mount one controller per page in a browser lifecycle hook. `createOrfin` deliberately throws during SSR; framework adapters handle the lifecycle. Configuration that changes identity, catalog, transport or routing requires a remount. Feature, theme, locale, memory and timing changes use `updateSettings`.

## Controller

| Method                                        | Purpose                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `open()`, `close()`, `toggle()`               | Control chat visibility                                                                                |
| `send(text)`                                  | Stream a new reply; ignores empty input and concurrent sends                                           |
| `stop()`                                      | Abort the current response                                                                             |
| `retry()`                                     | Replace the latest user/reply pair with a fresh attempt                                                |
| `clear()`                                     | Abort and clear the conversation                                                                       |
| `startTour()`, `tourStep(index)`, `endTour()` | Control the tour                                                                                       |
| `askDuringTour()`                             | Open the chat with the current step still active                                                       |
| `pick()`, `cancelPick()`                      | Enter or leave section selection                                                                       |
| `explain(section)`                            | Highlight and ask about a section                                                                      |
| `highlight(sectionId, persistent?)`           | Scroll and spotlight a catalog section                                                                 |
| `navigate(path, sectionId?)`                  | Navigate to an allowed same-origin path                                                                |
| `updateSettings(partial)`                     | Merge runtime preferences                                                                              |
| `forget()`                                    | Clear persisted and in-memory section choices                                                          |
| `subscribe(listener)`                         | Observe state updates; returns an unsubscribe function                                                 |
| `destroy()`                                   | Abort work, disconnect observers, remove listeners, clean generated annotations and unmount the widget |

`state` includes messages, busy status, current section, hover, spotlight, picker and tour state. Prefer methods to direct mutation. `settings` contains resolved preferences. Interaction event types include `open`, `close`, `message`, `reply`, `settings`, `highlight`, `navigate`, `hover`, `pick-start`, `tour-step`, `tour-end`, `clear`, and `memory-cleared`.

## Sections

```ts
interface Section {
  id: string;
  title: string;
  description: string;
  path?: string;
  prompt?: string;
  tourOrder?: number;
}
```

Use unique IDs with letters, digits, underscores and hyphens, up to 100 characters. Catalog IDs match `data-orfin-section`. Tours sort by `tourOrder`; if none are ordered, the visible marked sections are used. Hidden sections are skipped. Provide a server catalog when navigation or section instructions must be controlled by trusted configuration. `prompt` is intended for that server catalog and is stripped from the browser request.

| Attribute                    | Meaning                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `data-orfin-section="id"`    | Register an interactive section                                |
| `data-orfin-title="…"`       | Public title; defaults to the first section heading            |
| `data-orfin-description="…"` | Public explanation; otherwise visible text is extracted        |
| `data-orfin-order="0"`       | Position in the guided tour                                    |
| `data-orfin-private`         | Exclude this subtree from DOM extraction and section selection |

In `pageContext: 'page'` mode, visible text under `main` is included and section/article/region elements can be selected without manual annotations. When no `main` exists, visible body text is used. Form controls, editable regions, scripts, styles and hidden/private areas are omitted. Automatic section annotations are removed when leaving this mode or destroying the controller. Page queries are omitted from the transmitted URL. This is a context convenience, not an authorization boundary; only render data the visitor may access.

## Style tokens

| Property          | Default                                 |
| ----------------- | --------------------------------------- |
| `--orfin-accent`  | Preset accent                           |
| `--orfin-surface` | Preset panel surface                    |
| `--orfin-soft`    | Preset inset background                 |
| `--orfin-text`    | Preset primary text                     |
| `--orfin-muted`   | Preset secondary text                   |
| `--orfin-border`  | Preset border                           |
| `--orfin-font`    | DM Sans if present, otherwise system UI |
| `--orfin-width`   | `378px`                                 |
| `--orfin-radius`  | `22px`                                  |
| `--orfin-offset`  | `24px`                                  |

```css
[data-orfin-root] {
  --orfin-accent: #6951ad;
}

[data-orfin-root]::part(panel) {
  border-radius: 18px;
}
```

External CSS needs to target the host or exposed shadow parts. The widget does not load remote fonts. Mobile rules fit the viewport, use dynamic viewport height and respect safe-area insets. Motion respects `prefers-reduced-motion`.

## HTTP transport

`createHttpTransport({ endpoint, headers?, credentials?, fetch? })` posts the typed request and consumes SSE. `headers` can be a callback to supply session headers. Cookies use `same-origin` credentials by default. Custom transports implement:

```ts
interface ChatTransport {
  stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<AgentEvent>;
}
```

The protocol consists of JSON SSE frames with `type` equal to `delta`, `sources`, `tool`, `action`, `error` or `done`. Actions are `highlight`, `navigate`, or `tour`; arbitrary JavaScript and selectors are never part of the action protocol. A successful stream ends with `done`. Provider errors become safe, recoverable errors without upstream diagnostics. Cancellation propagates to the provider, custom tools and MCP calls.

## Handler options

`createOrfinHandler` accepts `provider`, `context`, optional `systemPrompt`, `sections`, `tools`, `retriever`, `features`, `allowedPaths`, `authorize`, `allowedOrigins`, `onError` and the following limits:

| Setting               | Default                                                        |
| --------------------- | -------------------------------------------------------------- |
| `maxBodyBytes`        | 131,072 actual received bytes                                  |
| `timeoutMs`           | 120,000 ms                                                     |
| `maxToolRounds`       | 5; clamped to 1–12                                             |
| `maxOutputCharacters` | 40,000                                                         |
| Accepted conversation | Up to 40 user/assistant messages, each up to 12,000 characters |
| Accepted page content | Up to 12,000 characters                                        |
| Accepted sections     | Up to 100                                                      |
| Retrieved context     | Up to 8 sources, each up to 6,000 characters                   |
| Tool result context   | Up to 16,000 serialized characters per result                  |

Client feature preferences are intersected with server features. A disabled server capability cannot be enabled by a client request. Tool arguments are validated against their JSON Schema. Unknown tools, invalid arguments, repeated calls and failures return tool errors to the model rather than executing unchecked actions. Tool definitions must have unique names.

`authorize(request)` returns `false` or `{ identity }`. The latter becomes `ToolContext.identity` for both tools and retrieval. Same-origin validation is enabled by default for requests that supply `Origin`. To support a separate backend, configure allowed origins and provide CORS/OPTIONS handling in the host application. Server-to-server requests without an Origin still require application authentication where appropriate.
