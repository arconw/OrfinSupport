# Validation record

Validated locally on **2026-09-18**, using Node.js 24, TypeScript strict mode, Chromium through Playwright, and the local `llm-gate` Codex endpoint.

Latest localization validation: **51 unit/integration tests, 28 Chromium browser tests, 3 Next.js production tests and 8 live gateway scenarios**.

## Automated coverage

| Suite              | Scope                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit/integration   | SSE fragmentation, CRLF and Unicode; OpenAI native/prompt tools; Anthropic Messages protocol; malformed streams; provider errors; schema validation; tool allowlists and loops; retrieval; request authorization, origins, size limits and cancellation; feature intersections; memory TTL/storage failures |
| MCP                | Official SDK initialization, tool discovery and execution over both in-memory and a real local Streamable HTTP server; allowlists, prefixes and error results                                                                                                                                               |
| Browser            | Streaming chat and citations, tour questions without losing the step, 70% spotlight, selection, hover Yes/No memory, outside dismissal, navigation, themes, Russian UI, runtime feature switches, cancellation, retry and escaped model output                                                              |
| Frameworks         | Real React, Vue and Angular apps plus plain JavaScript; mount, chat, hostile host CSS and unmount cleanup                                                                                                                                                                                                   |
| Navigation/privacy | SPA navigation, destination highlighting after a full document load, disallowed/external paths, private subtree and input exclusion, optional unmarked section discovery                                                                                                                                    |
| Accessibility      | Keyboard section selection, reduced motion, mobile layout and tour controls, automated axe checks against the complete demo overview and assistant                                                                                                                                                          |
| Next.js            | Production build, SSR output, browser hydration from the built package, router navigation while touring, and SSE from the actual server Route Handler                                                                                                                                                       |

Localization checks exercise every built-in locale, regional and custom fallback, translated errors after a language change, localized section extraction, hover/picker content, switching language during a tour, Arabic mobile layout, and two-way React/Vue/Angular state. Next tests build a fresh production application on port 4177 rather than reusing a previously built server.

## Live model checks

The gateway was already running at `http://127.0.0.1:8787/codex/v1`. The checks used `gpt-5.6-sol` and prompt tool mode because this local gateway supports text streaming but does not expose native function calling.

| Scenario                 | Observed behavior                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Project context          | A real response streamed across multiple text deltas                                                                 |
| Model-directed spotlight | The model requested `highlight_section` for `projects`; the server emitted the corresponding browser action          |
| MCP tool round trip      | The model called `team_capacity`; the official SDK client completed the tool call and the model continued its answer |
| Retrieval                | The Studio plan document was returned as a source and used in the streamed response                                  |
| Next.js backend          | The production Route Handler returned a successful SSE reply through the gateway                                     |

Additional live checks verify Spanish, Japanese and Arabic replies to English questions, and English as the default for a Russian question. The first four checks in the latest run completed in approximately 3.1, 7.1, 5.5 and 3.1 seconds respectively. These are observations from one local run, not performance guarantees. `npm run test:live` regenerates a machine-readable local report under `.artifacts/` without saving message contents or credentials.

## Reproducing

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

For actual model checks, keep the gateway running, start `npm run dev`, and run `npm run test:live` in another terminal. For the Next.js integration, build the library, install `examples/next` dependencies, then run `npm run test:next`.

The browser fixtures are served only in development. The production demo build includes the React playground and does not ship Angular’s compiler or the test fixtures. Explicit dependency prebundling prevents lazy framework imports from reloading active test pages.

## Limits of this validation

- Chromium was exercised; Firefox, Safari and real iOS/Android devices were not.
- Anthropic was checked against deterministic protocol fixtures, not a paid live endpoint.
- The vector adapter was checked with embedding/search fixtures. A production vector database was not provisioned.
- Tools and demo workspace data are fictional. The tests cover actual MCP transport behavior, not production permissions of an external service.
- Automated accessibility checks cover the rendered test states, not a manual assistive-technology audit.
- Application authentication and quotas are integration hooks. No production identity system is bundled.

The README GIF and screenshots are generated by `scripts/capture-demo.mjs` from the real static playground. They are not design mockups.
