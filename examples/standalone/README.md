# Plain HTML / script-tag examples

No React, Vue, Angular, npm install or bundler is required by the consuming site.
The standalone IIFE exposes `window.OrfinSupport` and bundles its browser
dependencies and widget styles. It targets modern browsers (not Internet Explorer).

## Try the downloaded archive

Keep `dist/standalone/` and `examples/standalone/` in their existing relative
positions. Open `examples/standalone/index.html` in your browser. The offline demo
and custom-theme example need no backend. To test the backend example, serve the
files over HTTP from the same origin as `/api/orfin`.

## Add it to your own site

Copy `dist/standalone/` to `/assets/orfin/`, keeping its license files. Copy and
edit `backend.config.js`, then place these tags **at the end of `<body>`**:

```html
<script src="/assets/orfin/orfinsupport.min.js"></script>
<script src="/assets/orfin/backend.config.js"></script>
```

Or use the version-pinned CDN file after this version is published:

```html
<script src="https://cdn.jsdelivr.net/npm/orfinsupport@0.1.0/dist/standalone/orfinsupport.min.js"></script>
<script>
  const assistant = OrfinSupport.createOrfin({
    endpoint: '/api/orfin',
    locale: 'en',
    theme: 'cloud',
  });
</script>
```

Do not use `async` with a following configuration script: initialization must run
after the library and page markup. For scripts in `<head>`, use `defer` on both
external scripts in the same order. No separate widget stylesheet is required.
`dist/standalone/integrity.json` contains the SHA-384 value for optional SRI;
with a CDN, pair `integrity` with `crossorigin="anonymous"`.

## Configurations

| File                     | Purpose                                              | Backend required |
| ------------------------ | ---------------------------------------------------- | ---------------- |
| `demo.config.js`         | Fixed replies and page tours                         | No               |
| `backend.config.js`      | Real AI via your `/api/orfin` handler                | Yes              |
| `custom-theme.config.js` | Own styles, tours and section picking, chat disabled | No               |

Mark relevant sections with `data-orfin-section`, `data-orfin-title` and
`data-orfin-description`. Never put confidential instructions or provider keys in
HTML or browser configuration. Server authentication, quotas and permissions are
owned by the host application. For SPA pages, call `orfin.destroy()` when removing
the integration; `orfin.updateSettings({ locale: 'fr' })` updates it in place.

The backend uses the same `orfinsupport/server` handler documented in the main
README. Script-tag delivery changes the frontend installation only, not the
server protocol. Use your existing implementation of that protocol if your backend
is not JavaScript.
