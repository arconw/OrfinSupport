# Publishing OrfinSupport

## Compatibility

OrfinSupport is an ESM library with TypeScript declarations. CommonJS `require()`
and React Native are not supported entry points. The server baseline is Node.js
20.19+, subject to the host framework's own requirements. For development and
publishing use Node.js 24 (`nvm use`; the exact tested version is in `.nvmrc`).

`npm run test:package` installs the actual release `.tgz` into independent
directories outside this repository. It checks TypeScript with `skipLibCheck`
disabled, server imports, browser mounting, streamed replies, reactive locale
changes and cleanup. The matrix covers:

| Consumer                            | Minimum         | Current development version |
| ----------------------------------- | --------------- | --------------------------- |
| React                               | 18.0.0          | 19.3.0                      |
| Vue                                 | 3.3.0           | 3.5.43                      |
| Angular                             | 19.0.0          | 22.1.7                      |
| Next.js production SSR              | —               | 16.3.5 with React 19.3.0    |
| Plain JS and standalone script tags | Modern Chromium | Same release archive        |

The standalone test loads the shipped HTML/configuration files, checks offline
sample replies and tours, and verifies the backend example against a local SSE
fixture. It does not call a paid model. Next.js checks use the copied example
installed from the archive, including production build, hydration, routing and
reactive locale. The broader browser suite covers source integration, visual
behavior and accessibility. This is not a claim that every future framework or
browser release has been tested.

## Before publishing

```bash
nvm use
npm ci
npx playwright install chromium
npm run check
npm run test:e2e
npm run test:demo
npm run test:package
```

The final command builds both ESM and standalone distributions, creates
`.artifacts/package/orfinsupport-VERSION.tgz`, tests it, and saves its SHA-512
integrity in `.artifacts/package/verification.json`. Consumer directories remain
in the operating system temporary directory for debugging.

`prepublishOnly` runs `check` and `test:package` when publishing the repository
directory. npm does not run that directory lifecycle when publishing an existing
tarball, so use the verified-archive helper below. Do not rebuild or replace the
archive after its tests pass; the helper rejects a changed archive.

## First manual publication

Create an npm account, verify its email, enable 2FA, then authenticate inside WSL:

```bash
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
node scripts/publish-verified.mjs --dry-run
node scripts/publish-verified.mjs
```

The second helper invocation publishes the exact tested tarball to the public
npm registry and may ask for browser/2FA confirmation. A published name/version
cannot be overwritten. For subsequent releases update `package.json` and the
lockfile together with `npm version patch --no-git-tag-version` (or the intended
minor/major version), update version-pinned examples, commit and retest.

## GitHub Actions

`ci.yml` verifies pushes to `main` and pull requests. `publish.yml` runs only on
manual dispatch, verifies the release, and publishes the tested archive using
OIDC provenance. Configure an npm Trusted Publisher for:

- GitHub user: `arconw`
- Repository: `OrfinSupport`
- Workflow filename: `publish.yml`
- Environment: leave blank (none is configured in this workflow)
- Allow direct `npm publish` for this workflow.

The npm setting must be configured after the package exists. A workflow file alone
does not establish that trust. Do not store a long-lived npm token in GitHub.
The workflow installs npm 11, which supports trusted publishing. Release jobs
have `id-token: write`; ordinary verification jobs have only `contents: read`.
Dispatch the workflow from `main` only after changing the version; rerunning an
already published version fails rather than replacing it.

## Standalone distribution

`npm run build` creates `dist/standalone/orfinsupport.min.js`, source map,
dependency notices, full licenses and SRI metadata. It is an IIFE with no external
imports and includes its browser dependencies. Keep `dist/standalone/` and
`examples/standalone/` together when preparing a downloadable ZIP. Users can open
the offline example directly or copy the bundle to any HTTP-served website.
The backend example requires a same-origin `/api/orfin` implementation.
