# API reference

## Package entry points

| Import                   | Exports                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `orfinsupport`           | `createOrfin`, controller, client options, core types and utilities                        |
| `orfinsupport/core`      | Shared types, settings, HTTP transport, SSE and retrieval helpers                          |
| `orfinsupport/server`    | `createOrfinHandler`, `runAgent`, `createDirectTransport`, providers and retrieval helpers |
| `orfinsupport/providers` | `createOpenAICompatible`, `createAnthropic`, provider contract                             |
| `orfinsupport/mcp`       | `connectMCP`, `toolsFromMCP`                                                               |
| `orfinsupport/react`     | `OrfinSupport`, `OrfinProvider`, `useOrfin`                                                |
| `orfinsupport/vue`       | `OrfinSupport`, `useOrfin` composable                                                      |
| `orfinsupport/angular`   | `provideOrfin`, `ORFIN`, `injectOrfin`                                                     |

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
  highlightOpacity: 0.15,
  highlightTransition: 280,
  motion: 'auto',
  logo: null,
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

`transport` overrides `endpoint`. `title` and `welcome` customize the empty state. `sections` supplies the public catalog. `allowedPaths` restricts navigation; without it, allowed paths come from the section catalog. `navigate` plugs into the host router. `themeVariables` accepts `--orfin-*` CSS custom properties. `styles` supplies trusted application CSS inside Shadow DOM. `nonce` is applied to every injected style element. `onEvent({ type, detail })` observes interaction events without receiving message content.

Mount one controller per page in a browser lifecycle hook. `createOrfin` deliberately throws during SSR; framework adapters handle the lifecycle. Configuration that changes identity, catalog, transport or routing requires a remount. Feature, theme, logo, locale, memory and timing changes use `updateSettings`. Logo images use `{ src, alt? }`, or `null` for Orfin. `highlightOpacity` is clamped to 0–1 and `highlightTransition` to 0–1500 ms; non-finite values preserve the previous setting.

`motion` accepts `'auto'` (default) or `'none'`. Auto respects the operating system's reduced-motion preference; none removes animation immediately, including spotlight transitions. It updates through configuration, widget preferences and all adapters' reactive settings APIs. Exiting surfaces become inert immediately and remain only for their configured fade; rapid reopening preserves their content. The motion layer also works without a preset. See [motion styling](STYLING.md#motion-and-actions).

## Localization

`locale` defaults to `en`. There are 16 complete built-in catalogs, with regional fallback, additional custom languages and Arabic RTL layout. `translations` accepts a locale-keyed map of partial `TranslationMessages` overrides and can be replaced through `updateSettings`. `supportedLocales` and `resolveTranslations` are exported for host integrations. See [localization](LOCALIZATION.md) for hooks, composables, signals, section translations and response-language behavior.

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
| `setLocale(locale)`                           | Change the UI and the language of subsequent model replies without remounting                          |
| `forget()`                                    | Clear persisted and in-memory section choices                                                          |
| `subscribe(listener)`                         | Observe state updates; returns an unsubscribe function                                                 |
| `destroy()`                                   | Abort work, disconnect observers, remove listeners, clean generated annotations and unmount the widget |

`state.error` is a stable `OrfinErrorCode`; `errorMessage` exposes the current localized text and `state.errorStatus` optionally contains an HTTP status. `state` also includes messages, busy status, current section, hover, spotlight, picker and tour state. Prefer methods to direct mutation. `settings` contains resolved preferences. Interaction event types include `open`, `close`, `message`, `reply`, `settings`, `highlight`, `navigate`, `hover`, `pick-start`, `tour-step`, `tour-end`, `clear`, and `memory-cleared`.

`highlight()` resolves to `true` when a target is shown and `false` when it is unavailable or the operation is cancelled. Navigation failures reject the promise.

## Sections

```ts
interface Section {
  id: string;
  title: string;
  description: string;
  path?: string;
  prompt?: string;
  tourOrder?: number;
  translations?: Record<string, Partial<Pick<Section, 'title' | 'description'>>>;
}
```

Use unique IDs with letters, digits, underscores and hyphens, up to 100 characters. Catalog IDs match `data-orfin-section`. Tours sort by `tourOrder`; when no ordered targets are available at the start, the visible marked sections are used. Hidden sections are skipped. Provide a server catalog when navigation or section instructions must be controlled by trusted configuration. `prompt` is intended for that server catalog and is stripped from the browser request.

Tour steps and counters update when the layout or section visibility changes. The current section stays selected while it remains available. Otherwise, Orfin advances to the next available section, or the previous section when there is no next one. If every target becomes unavailable, the tour ends and the chat opens. Targets with no rendered area, hidden styles, `aria-hidden`, or `inert` are skipped. Offscreen sections remain eligible and are scrolled into view. Responsive alternatives may share a section ID when only one is available at a time. The launcher stays hidden during a tour; Ask and the inline chat controls remain available.

| Attribute                    | Meaning                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `data-orfin-section="id"`    | Register an interactive section                                |
| `data-orfin-title="…"`       | Public title; defaults to the first section heading            |
| `data-orfin-description="…"` | Public explanation; otherwise visible text is extracted        |
| `data-orfin-order="0"`       | Position in the guided tour                                    |
| `data-orfin-private`         | Exclude this subtree from DOM extraction and section selection |

In `pageContext: 'page'` mode, visible text under `main` is included and section/article/region elements can be selected without manual annotations. When no `main` exists, visible body text is used. Form controls, editable regions, scripts, styles and hidden/private areas are omitted. Automatic section annotations are removed when leaving this mode or destroying the controller. Page queries are omitted from the transmitted URL. This is a context convenience, not an authorization boundary; only render data the visitor may access.

Each request includes only the available sections of the current document. A selected section is cleared when its target disappears or becomes unavailable, including after host-router navigation and browser history changes. It is checked again before sending. Conversation history stays intact. Keep the complete trusted catalog on the server to support navigation to sections on other pages.

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
| `--orfin-radius`  | Preset radius                           |
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

See the [styling guide](STYLING.md) for a complete explanation of no-preset mode, external CSS, component states and restoring a built-in theme. Ordinary host selectors do not cross Shadow DOM.

The ten `ThemePreset` values are `cloud`, `iris`, `lagoon`, `sand`, `rose`, `midnight`, `graphite`, `forest`, `plum` and `espresso`. `themePresets` exports their tokens; `supportedThemes` exports the names. The first five are light and the last five are dark. `--orfin-shadow` overrides the preset panel shadow.

`Theme` also accepts `'none'`. This completely omits the preset stylesheet and inline preset tokens. The structural layout stylesheet remains for positioning, scroll containment, controls, responsive geometry and motion. Supply visual styling through `styles` (default `''`) or external `::part()` rules. CSS custom properties are inherited; your stylesheet maps them to your design system. Visual defaults in the token table apply to presets only.

`styles` can be changed through `updateSettings({ styles })` and all framework reactive settings APIs. It is set as stylesheet text, never as HTML and never included in a chat request. This is trusted developer configuration. Reset with `styles: ''`. It applies after the preset, so scope rules to `:host([data-theme='none'])` if they should stop applying when a preset is chosen. The host exposes `data-theme` for external selectors too.

Parts include `orfin`, `panel`, `header`, `heading`, `avatar`, `logo`, `logo-image`, `conversation`, `welcome`, `welcome-mark`, `suggestion`, `message`, `user`, `assistant`, `message-label`, `tool`, `tool-icon`, `source`, `composer`, `input-wrap`, `input`, `send`, `mini`, `actions`, `actions-trigger`, `action-chevron`, `actions-menu`, `action-item`, `action-icon`, `action-label`, `footer`, `launcher`, `preferences`, `language`, `theme`, `toggle`, `motion-hint`, `error`, `retry`, `popover`, `tour-popover`, `popover-top`, `tour-copy`, `primary`, `secondary`, `icon-button`, `tour-inline`, `picker-bar`, `section-list`, `spotlight` and `spot-label`. Use trusted `styles` for descendants and state selectors such as `.theme[aria-pressed='true']`. See the complete [Northstar host stylesheet](../demo/host-theme.css).

```css
[data-orfin-root][data-theme='none']::part(orfin) {
  font-family: var(--app-font);
  color: var(--app-text);
}
[data-orfin-root][data-theme='none']::part(panel) {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 4px;
}
```

The same `logo` appears throughout the widget. Use meaningful alternative text. Missing/failed images fall back to Orfin; `logo: null` restores the default. This setting updates through every framework’s existing reactive settings API.

## HTTP transport

`createHttpTransport({ endpoint, headers?, credentials?, fetch? })` posts the typed request and consumes SSE. `headers` can be a callback to supply session headers. Cookies use `same-origin` credentials by default. Custom transports implement:

```ts
interface ChatTransport {
  stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<AgentEvent>;
}
```

The protocol consists of JSON SSE frames with `type` equal to `delta`, `sources`, `tool`, `action`, `error` or `done`. Actions are `highlight`, `navigate`, `tour`, or `custom` with a registered name and data payload; arbitrary JavaScript and selectors are never part of the action protocol. `actions: Record<string, (payload, { signal, controller }) => void | Promise<void>>` registers project handlers. Unregistered or invalid custom actions fail with a localized error. The `tools` feature gates custom actions. Validate each payload in host code. A successful stream ends with `done`. Provider errors become safe, recoverable errors without upstream diagnostics. Cancellation propagates to the provider, custom tools and MCP calls.

## Handler options

`createOrfinHandler` accepts `provider`, `context`, optional `systemPrompt`, `sections`, `tools`, `retriever`, `features`, `allowedPaths`, `authorize`, `allowedOrigins`, `onError` and the following limits:

| Setting               | Default                                                        |
| --------------------- | -------------------------------------------------------------- |
| `maxBodyBytes`        | 131,072 actual received bytes                                  |
| `timeoutMs`           | 120,000 ms                                                     |
| `maxToolRounds`       | 5; clamped to 1–12                                             |
| `providerRetries`     | 2 per model step; integer clamped to 0–3                       |
| `maxOutputCharacters` | 40,000                                                         |
| Accepted conversation | Up to 40 user/assistant messages, each up to 12,000 characters |
| Accepted page content | Up to 12,000 characters                                        |
| Accepted sections     | Up to 100                                                      |
| Retrieved context     | Up to 8 sources, each up to 6,000 characters                   |
| Tool result context   | Up to 16,000 serialized characters per result                  |

Client feature preferences are intersected with server features. A disabled server capability cannot be enabled by a client request. Tool arguments are validated against their JSON Schema. Unknown tools, invalid arguments, repeated calls and failures return tool errors to the model rather than executing unchecked actions. Tool definitions must have unique names.

Transient provider failures are retried only before the current model step emits nonempty text or a tool call. OpenAI-compatible and Anthropic adapters classify HTTP 408/409/429/5xx, network connection failures and supported upstream overload/error events. Authentication, invalid-request, explicit quota and unknown custom errors are not treated as transient stream events. Backoff starts at 500 ms, doubles per attempt and honors `Retry-After` up to 5 seconds. The overall handler timeout still applies, and cancellation interrupts the wait. Previously executed tools and their results remain in the same agent loop; neither their side effects nor their browser actions are replayed. Once output has started, a failure remains visible with the partial reply.

`onProviderRetry({ attempt, delayMs, status? })` observes recovery without receiving message content, credentials or upstream error text. A custom `ModelProvider` opts in by throwing `new ProviderError('Temporarily unavailable', { retryable: true, retryAfterMs: 1000 })`, imported from `orfinsupport/providers` or `orfinsupport/server`. A bare custom error is not retried. `providerRetries: 0` disables recovery. This policy applies inside `runAgent`, `createDirectTransport` and the HTTP handler; calling a provider’s `stream()` directly performs one attempt.

`authorize(request)` returns `false` or `{ identity }`. The latter becomes `ToolContext.identity` for both tools and retrieval. Same-origin validation is enabled by default for requests that supply `Origin`. To support a separate backend, configure allowed origins and provide CORS/OPTIONS handling in the host application. Server-to-server requests without an Origin still require application authentication where appropriate.

## Tool-driven interface updates

Within `Tool.execute`, `context.emitAction?.(action)` queues an action for the current stream. The agent sends at most 16 actions per tool, only after the tool succeeds and only when its corresponding capability is enabled. The callback is valid only during that execution. Exceptions or cancellation discard queued actions; they do not undo server-side changes already performed by your tool.

Built-in navigation still passes through the browser path allowlist. A custom action looks like `{ type: 'custom', name: 'cart_changed', payload: { cart } }`; only an own property in the mount-time `actions` map can handle it. The handler receives the response abort signal and controller. It should validate the payload, update authorized host state, and honor cancellation. Failure ends the reply with a localized error and marks pending tool activities as failed.

This stream is one-way. The model receives the server tool result, not a browser acknowledgement. Return committed server facts, and use navigation results such as “requested” rather than claiming the browser necessarily completed them. Production hosts own session isolation, transactional updates, idempotency and retry policy. See the main README’s cart example.
