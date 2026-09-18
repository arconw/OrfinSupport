# Validation record

Validated locally on **2026-09-18**, using Node.js 24, TypeScript strict mode, Chromium through Playwright, and the local `llm-gate` Codex endpoint.

Expansion validation: **70 unit/integration tests, 60 Chromium browser tests, 2 static production demo tests, 3 Next.js production tests, 12 live gateway scenarios and 6 live browser workflows**. The live browser workflows cover MCP in English and Russian, cart mutations, Russian comparison/review retrieval and numeric analysis through the actual gateway. The browser suite additionally checks mobile fade frames, a host stylesheet with the preset disabled, preserved conversation and current report filters.

## Automated coverage

| Suite              | Scope                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/integration   | SSE fragmentation, CRLF and Unicode; OpenAI native/prompt tools; Anthropic Messages protocol; malformed streams; provider errors; schema validation; tool allowlists and loops; retrieval; request authorization, origins, size limits and cancellation; feature intersections; memory TTL/storage failures |
| MCP                | Official SDK initialization, tool discovery and execution over both in-memory and a real local Streamable HTTP server; allowlists, prefixes and error results                                                                                                                                               |
| Browser            | Streaming chat and citations, tour questions without losing the step, soft 15% spotlight with configurable opacity, selection, hover Yes/No memory, outside dismissal, navigation, themes, Russian UI, runtime feature switches, cancellation, retry and escaped model output                               |
| Frameworks         | Real React, Vue and Angular apps plus plain JavaScript; mount, chat, hostile host CSS and unmount cleanup                                                                                                                                                                                                   |
| Navigation/privacy | SPA navigation, destination highlighting after a full document load, disallowed/external paths, private subtree and input exclusion, optional unmarked section discovery                                                                                                                                    |
| Accessibility      | Keyboard section selection, reduced motion, mobile layout and tour controls, automated axe checks against the complete demo overview and assistant                                                                                                                                                          |
| Next.js            | Production build, SSR output, browser hydration from the built package, router navigation while touring, and SSE from the actual server Route Handler                                                                                                                                                       |

Localization checks exercise every built-in locale, regional and custom fallback, translated errors after a language change, localized section extraction, hover/picker content, switching language during a tour, Arabic mobile layout, and two-way React/Vue/Angular state. Next tests build a fresh production application on port 4177 rather than reusing a previously built server.

Acceptance regressions cover Ask → reply → Next at 1440×1000 and 390×844, returning to the same tour step, clearing submissions from both Enter and the Send button, and preserving a new draft through response updates. The composer regression failed against the previous implementation before the fix. A separate layout check verified the inline tour controls in all 16 languages at widths of 320, 390 and 1440 pixels.

Responsive tour regressions complete the tour with ordinary clicks at 390×844, 320×568 and 844×390. They also cover repeated desktop/mobile resizing, context updates while Ask is open, zero-area and inaccessible targets, DOM removal, all targets becoming unavailable, restoring data-only sections, and switching to a responsive equivalent. The initial eight responsive cases failed before the fixes. Next.js production tests were rerun after the tour changes to verify routing and hydration from the rebuilt package.

Page-context regressions cover ending the tour on Team pulse and navigating to Playground, sending immediately after a target is removed, browser history, and preserving existing messages during a locale change. All three cases failed before the fixes. Native and prompt-tool protocol tests verify that response-language instructions survive a complete tool round trip with English history.

Compact welcome checks use Iris and Russian at 320×568 and 390×844. Opening, reopening, resizing and clearing a completed conversation leave the greeting at `scrollTop=0` with its icon inside the log. Before the fix, clearing a long reply retained a scroll offset and clipped the greeting. Automatic following applies to the message log; it does not scroll assistant preferences.

Static production tests build the actual demo with Live AI disabled, then use Chromium at 1440×1000 and 320×568. They verify the disabled local-only option, its accessible explanation, keyboard selection, a complete sample reply without API requests, all 16 language choices, a French language change preserving history, and no horizontal overflow or browser errors. The local production preview explicitly enables Live AI when it builds its frontend alongside the API.

## Expanded demo coverage

The expanded workspace shares catalog, cart and delivery-ledger data between UI and tools. Tests reconcile chart and segment totals, enforce stock/quantity limits, isolate server-side visitor carts, discard stale cart snapshots, and verify successful tool events before interface updates. Browser scenarios open a product and add two items, change quantity, remove an item, compare the displays, retrieve the actual three-star review, analyze the ledger with evidence references, and verify an explicit language override.

Appearance checks cover ten presets (five light/five dark), token contrast, widget and Playground selection, custom logo replacement/failure fallback, Arabic at 320×568, reduced motion and retention of one spotlight mask between tour steps. The new report, shop, product, comparison and settings pages are also scanned with axe; contrast and review-star semantics were corrected based on those results. New pages fit a 320-pixel viewport; dense report tables scroll within their container.

Mobile Playground regressions also enter a long custom logo URL, edit its alternative text and adjust dimming. They compare document and visual viewport widths with the configured 320/390-pixel device width and check control bounds. Before the fix, the configuration preview's minimum grid width expanded the page; long JSON lines now scroll inside that preview.

An external-only consumer loads its scheme from an ordinary project CSS file with both preset and injected custom styles empty. Removing that file removes the appearance; no inline preset palette remains. Desktop and mobile RTL checks retain the conversation and custom logo through preset→none→preset. The external `::part(input):focus-visible` regression failed before removing an unconditional important outline reset from structural CSS; the preset now owns that visual reset, while no-preset mode retains overridable keyboard focus indicators.

## Live model checks

The gateway was already running at `http://127.0.0.1:8787/codex/v1`. The checks used `gpt-5.6-sol` and prompt tool mode because this local gateway supports text streaming but does not expose native function calling.

| Scenario                 | Observed behavior                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Project context          | A real response streamed across multiple text deltas                                                                 |
| Model-directed spotlight | The model requested `highlight_section` for `projects`; the server emitted the corresponding browser action          |
| MCP tool round trip      | The model called `team_capacity`; the official SDK client completed the tool call and the model continued its answer |
| Workspace statistics     | The model called `workspace_statistics` and reported 24 completed tasks this week from the MCP result                |
| Retrieval                | The Studio plan document was returned as a source and used in the streamed response                                  |
| Next.js backend          | The production Route Handler returned a successful SSE reply through the gateway                                     |

Additional live checks verify Spanish, Japanese and Arabic replies to English questions, and English as the default for a Russian question. Russian checks require an actual completed MCP call and a Russian answer to the acceptance question about the Studio plan and 12 members, both with and without English history. A separate case explicitly requests English while the UI locale is Russian. `npm run test:live` regenerates a machine-readable local report under `.artifacts/` without saving message contents or credentials.

The live browser suite submits the exact acceptance question about completed tasks through the public widget, with English at 1440×1000 and Russian at 390×844. It verifies the real `/api/orfin` request, enabled tools, MCP running/complete events with the same call ID, the rendered Done card, the correct task count and answer language, an empty composer, and no browser exceptions. It does not intercept requests or replace model replies. This regression failed on the previous preview: the demo offered only `team_capacity`, whose result did not include completed tasks. The new `workspace_statistics` tool shares the overview's weekly statistics fixture.

## Reproducing

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:demo
```

For actual model checks, keep the gateway running, start `npm run dev`, and run `npm run test:live` in another terminal. For the Next.js integration, build the library, install `examples/next` dependencies, then run `npm run test:next`.

For uninterrupted browser acceptance, use `npm run preview:demo` at `http://127.0.0.1:4189`. Frontend assets and the API are bundled into an isolated `.runtime/preview-*` directory and served without HMR or a file watcher. Both modes work from the same origin. Run live checks against it with `ORFIN_LIVE_URL=http://127.0.0.1:4189/api/orfin npm run test:live`; use `ORFIN_LIVE_FILTER=Russian` to select the language scenarios. To keep an existing review stable, start subsequent snapshots with a different `--port`.

Run the complete widget → backend → MCP → model check against that preview:

```bash
ORFIN_LIVE_BROWSER_URL=http://127.0.0.1:4189 npm run test:live:browser
```

The default browser target is the development demo on port 4173. This suite requires the backend and gateway to be running and intentionally does not reuse mocked CI responses. Screenshots, call metadata and the JSON result are saved under `.artifacts/live-browser*`. Use `-- --repeat-each=2` for two independent runs per locale.

The browser fixtures are served only in development. The production demo build includes the React playground and does not ship Angular’s compiler or the test fixtures. Explicit dependency prebundling prevents lazy framework imports from reloading active test pages.

`npm run test:demo` builds and serves the static demo on port 4194, with no API or gateway dependency. The live suites remain separate and require the local backend.

## Limits of this validation

- Chromium was exercised; Firefox, Safari and real iOS/Android devices were not.
- Anthropic was checked against deterministic protocol fixtures, not a paid live endpoint.
- The vector adapter was checked with embedding/search fixtures. A production vector database was not provisioned.
- Tools and demo workspace data are fictional. The tests cover actual MCP transport behavior, not production permissions of an external service.
- Automated accessibility checks cover the rendered test states, not a manual assistive-technology audit.
- Application authentication and quotas are integration hooks. No production identity system is bundled.

The README GIF and screenshots are generated by `scripts/capture-demo.mjs` from the real static playground. They are not design mockups.

## Provider capacity recovery

During expansion acceptance, the local model service reported four capacity errors (2026-09-18, 06:01–06:05 UTC), including failures after a completed tool. The agent now retries only a transient, still-unpublished model step with a bounded budget. A fault test injects the same SSE provider-error class after a committed cart action and verifies one mutation, one browser action, identical model-step history and a completed answer. Further tests cover partial text, permanent HTTP failures, retry exhaustion, rate limits, cancellation and unknown custom errors. Live checks remain separate and use the actual model service.
