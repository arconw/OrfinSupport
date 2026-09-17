# Contributing

OrfinSupport is a TypeScript library with a demo application. Keep framework adapters thin; behavior belongs in the shared browser controller or server agent.

## Local development

Use Node.js 20.19+ and npm. Install with `npm ci`, then run `npm run dev`. The demo works with sample replies. Live mode expects a local `llm-gate` on port 8787, or the server-side `ORFIN_API_URL`, `ORFIN_MODEL`, `ORFIN_API_KEY` and `ORFIN_TOOL_MODE` environment variables configured by you. No environment files are committed or required for sample mode.

Run `npm run check` and `npm run test:e2e` before submitting changes. For changes to the packaged React adapter, also install the example dependencies and run `npm run test:next`. Its live route test requires the gateway. Format changed sources with Prettier. Browser fixtures cover vanilla JavaScript, React, Vue and Angular.

Add tests for behavior and boundaries, particularly streaming, cancellation, navigation, tool execution and framework cleanup. Keep product interface text focused on visitors. Avoid adding comments in source code; prefer clear names and focused modules.

## Releases

`npm pack --dry-run` previews the package. Only `dist`, `README.md`, `LICENSE` and npm’s required metadata belong in the archive. Verify the tarball in a consuming application. Publishing is a manual maintainer action; CI never publishes to npm.

The `main` branch holds the library and demo source. The `demo` branch contains the built `dist-demo` contents and is served directly by GitHub Pages. Build with `npm run build:demo`, then publish those artifacts to `demo` using a separate checkout. Ready-to-enable CI templates are in `.github/workflow-templates`; enabling them requires a GitHub credential with workflow permissions. The deployment template builds from `main`; switch Pages to GitHub Actions when enabling it. `npm run capture:demo` records the running demo into `docs/assets` for the README.
