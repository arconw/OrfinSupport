import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { chromium, expect } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifactDir = join(root, '.artifacts/package');
await mkdir(artifactDir, { recursive: true });
const scratch = await mkdtemp(join(tmpdir(), 'orfinsupport-consumers-'));
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NODE_PATH: '' },
  });
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const supplied = process.argv[2];
let tarball;
if (supplied) {
  tarball = resolve(supplied);
} else {
  const [packed] = JSON.parse(
    run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', artifactDir], root),
  );
  for (const file of packed.files) {
    assert(
      /^(dist\/|examples\/standalone\/|README\.md$|LICENSE$|package\.json$)/.test(file.path),
      `Unexpected package file: ${file.path}`,
    );
  }
  tarball = join(artifactDir, packed.filename);
}
const integrity = `sha512-${createHash('sha512')
  .update(await readFile(tarball))
  .digest('base64')}`;
console.log(`Testing ${tarball}\nIsolated consumers: ${scratch}`);
const versions = (kind, version) =>
  kind === 'react'
    ? {
        react: version,
        'react-dom': version,
        '@types/react': version.startsWith('18') ? '18.3.28' : '19.2.14',
      }
    : kind === 'vue'
      ? { vue: version }
      : Object.fromEntries(
          ['core', 'common', 'compiler', 'platform-browser'].map((name) => [
            `@angular/${name}`,
            version,
          ]),
        );
const matrix = [
  { name: 'vanilla', kind: 'vanilla', dependencies: {} },
  { name: 'react-min', kind: 'react', dependencies: versions('react', '18.0.0') },
  {
    name: 'react-current',
    kind: 'react',
    dependencies: versions('react', manifest.devDependencies.react.replace('^', '')),
  },
  { name: 'vue-min', kind: 'vue', dependencies: versions('vue', '3.3.0') },
  {
    name: 'vue-current',
    kind: 'vue',
    dependencies: versions('vue', manifest.devDependencies.vue.replace('^', '')),
  },
  {
    name: 'angular-min',
    kind: 'angular',
    dependencies: { ...versions('angular', '19.0.0'), rxjs: '7.8.2' },
  },
  {
    name: 'angular-current',
    kind: 'angular',
    dependencies: {
      ...versions('angular', manifest.devDependencies['@angular/core'].replace('^', '')),
      rxjs: '7.8.2',
    },
  },
];
const common = `
const options = { initiallyOpen: true, memory: { storage: 'none' }, features: { hoverHelp: false },
  transport: { async *stream() { yield { type: 'delta', text: 'Packaged consumer reply' }; yield { type: 'done' }; } } };
const root = document.getElementById('app');
`;
function source(kind) {
  if (kind === 'vanilla')
    return `import { createOrfin } from 'orfinsupport'; ${common}
    const controller = createOrfin(options); window.dispose = () => controller.destroy(); window.changeLocale = () => controller.setLocale('fr');`;
  if (kind === 'react')
    return `import { createElement } from 'react'; import { createRoot } from 'react-dom/client';
    import { OrfinSupport, useOrfin } from 'orfinsupport/react'; ${common}
    function Controls() { const api = useOrfin(); window.changeLocale = () => api.setLocale('fr'); return createElement('output', {id: 'locale'}, api.locale); }
    const app = createRoot(root); app.render(createElement(OrfinSupport, { options }, createElement(Controls)));
    window.dispose = () => app.unmount();`;
  if (kind === 'vue')
    return `import { createApp, h } from 'vue'; import { useOrfin } from 'orfinsupport/vue'; ${common}
    const app = createApp({ setup() { const api = useOrfin(options); window.changeLocale = () => api.setLocale('fr');
      return () => h('output', {id: 'locale'}, api.locale.value); } }); app.mount(root); window.dispose = () => app.unmount();`;
  return `import '@angular/compiler'; import * as angular from '@angular/core'; import { bootstrapApplication } from '@angular/platform-browser';
    import { provideOrfin, injectOrfin } from 'orfinsupport/angular'; ${common}
    class App { api = injectOrfin(); constructor() { window.changeLocale = () => this.api.setLocale('fr'); } }
    angular.Component({ selector: 'consumer-app', standalone: true, template: '<output id="locale">{{ api.locale() }}</output>' })(App);
    root.innerHTML = '<consumer-app></consumer-app>';
    const zoneless = angular['provideZonelessChangeDetection'] ?? angular['provideExperimentalZonelessChangeDetection'];
    const app = await bootstrapApplication(App, { providers: [zoneless(), provideOrfin(options)] }); window.dispose = () => app.destroy();`;
}
const browser = await chromium.launch();
const results = [];
try {
  for (const item of matrix) {
    console.log(`Checking ${item.name}...`);
    const cwd = join(scratch, item.name);
    await mkdir(cwd);
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify(
        {
          name: `consumer-${item.name}`,
          private: true,
          type: 'module',
          dependencies: { orfinsupport: `file:${tarball}`, ...item.dependencies },
        },
        null,
        2,
      ),
    );
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], cwd);
    run(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "await import('orfinsupport/server'); await import('orfinsupport/core'); await import('orfinsupport/providers');",
      ],
      cwd,
    );
    const installed = JSON.parse(
      await readFile(join(cwd, 'node_modules/orfinsupport/package.json'), 'utf8'),
    );
    assert.equal(installed.version, manifest.version);
    if (item.kind === 'vanilla') {
      const lock = JSON.parse(await readFile(join(cwd, 'package-lock.json'), 'utf8'));
      for (const peer of ['react', 'vue', '@angular/core', '@modelcontextprotocol/sdk'])
        assert(
          !lock.packages[`node_modules/${peer}`],
          `Optional peer unexpectedly installed: ${peer}`,
        );
    }
    if (item.kind === 'react')
      assert(
        (
          await readFile(join(cwd, 'node_modules/orfinsupport/dist/adapters/react.js'), 'utf8')
        ).startsWith("'use client';"),
      );
    const subpath = item.kind === 'vanilla' ? '' : `/${item.kind}`;
    await writeFile(
      join(cwd, 'types.ts'),
      `import * as adapter from 'orfinsupport${subpath}';\nimport { createOrfinHandler } from 'orfinsupport/server';\nimport type { OrfinOptions } from 'orfinsupport';\nconst options: OrfinOptions = { endpoint: '/api/orfin' };\nconsole.log(adapter, createOrfinHandler, options);`,
    );
    run(
      process.execPath,
      [
        join(root, 'node_modules/typescript/bin/tsc'),
        '--noEmit',
        '--strict',
        '--module',
        'NodeNext',
        '--moduleResolution',
        'NodeNext',
        '--target',
        'ES2022',
        '--lib',
        'ES2023,DOM,DOM.Iterable',
        'types.ts',
      ],
      cwd,
    );
    await writeFile(join(cwd, 'main.js'), source(item.kind));
    await build({
      absWorkingDir: cwd,
      entryPoints: ['main.js'],
      bundle: true,
      format: 'esm',
      target: 'es2022',
      outfile: join(cwd, 'bundle.js'),
      logLevel: 'silent',
    });
    const js = await readFile(join(cwd, 'bundle.js'));
    const server = createServer((req, res) => {
      res.setHeader('Content-Type', req.url === '/bundle.js' ? 'text/javascript' : 'text/html');
      res.end(
        req.url === '/bundle.js'
          ? js
          : '<!doctype html><html lang="en"><head><title>Package consumer</title></head><body><div id="app"></div><script type="module" src="/bundle.js"></script></body></html>',
      );
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
      await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Hello');
      await page.getByRole('button', { name: 'Send message', exact: true }).click();
      await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText(
        'Packaged consumer reply',
      );
      await page.evaluate(() => window.changeLocale());
      if (item.kind !== 'vanilla') await expect(page.locator('#locale')).toHaveText('fr');
      await expect(
        page.getByRole('button', { name: 'Préférences de l’assistant', exact: true }),
      ).toBeVisible();
      await page.evaluate(() => window.dispose());
      await expect(page.locator('[data-orfin-root]')).toHaveCount(0);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
      await new Promise((resolve) => server.close(resolve));
    }
    results.push({ name: item.name, dependencies: item.dependencies, passed: true });
    console.log(
      `PASS ${item.name}: installed archive, types, server imports, browser reply, locale, cleanup`,
    );
  }
  // Exercise the actual shipped HTML/configuration files using ordinary script tags.
  const packageRoot = join(scratch, 'vanilla/node_modules/orfinsupport');
  let backendRequests = 0;
  const staticServer = createServer(async (req, res) => {
    try {
      if (req.url === '/api/orfin' && req.method === 'POST') {
        backendRequests++;
        res.setHeader('Content-Type', 'text/event-stream');
        res.end(
          'data: {"type":"delta","text":"Standalone backend reply"}\n\ndata: {"type":"done"}\n\n',
        );
        return;
      }
      const pathname = new URL(req.url, 'http://localhost').pathname;
      const file = resolve(packageRoot, '.' + pathname);
      assert(file.startsWith(packageRoot + '/'));
      res.setHeader(
        'Content-Type',
        file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html',
      );
      res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      res.end('Not found');
    }
  });
  await new Promise((resolve) => staticServer.listen(0, '127.0.0.1', resolve));
  try {
    for (const example of ['index.html', 'backend.html', 'custom-theme.html']) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      try {
        await page.goto(
          `http://127.0.0.1:${staticServer.address().port}/examples/standalone/${example}`,
        );
        await expect(page.locator('[data-orfin-root] .panel')).toBeVisible();
        if (example !== 'custom-theme.html') {
          await page.getByRole('textbox', { name: 'Ask me anything' }).fill('Hello');
          await page.getByRole('button', { name: 'Send message', exact: true }).click();
          await expect(page.locator('[data-orfin-root] .message.assistant')).toContainText(
            example === 'index.html' ? 'entirely in your browser' : 'Standalone backend reply',
          );
        } else {
          await expect(page.locator('[data-orfin-root]')).toHaveAttribute('data-theme', 'none');
          await page.evaluate(() => window.orfin.startTour());
          await expect(page.getByRole('dialog', { name: 'Guided tour' })).toBeVisible();
        }
        await page.evaluate(() => window.orfin.destroy());
        await expect(page.locator('[data-orfin-root]')).toHaveCount(0);
        assert.deepEqual(errors, []);
        results.push({ name: `standalone-${example}`, passed: true });
        console.log(`PASS standalone ${example}`);
      } finally {
        await page.close();
      }
    }
    assert.equal(backendRequests, 1);
  } finally {
    await new Promise((resolve) => staticServer.close(resolve));
  }
  // Copy the real Next application, then install the tarball instead of a repository symlink.
  const next = join(scratch, 'next');
  await cp(join(root, 'examples/next'), next, {
    recursive: true,
    filter: (src) => !/[/\\](node_modules|\.next|next-env\.d\.ts)([/\\]|$)/.test(src),
  });
  const nextPackage = JSON.parse(await readFile(join(next, 'package.json'), 'utf8'));
  nextPackage.dependencies.orfinsupport = `file:${tarball}`;
  await writeFile(join(next, 'package.json'), JSON.stringify(nextPackage, null, 2));
  run('npm', ['install', '--no-audit', '--no-fund'], next);
  // Playwright owns the production server lifecycle; use only offline SSR tests.
  const config = join(root, '.artifacts/package/next.config.mjs');
  await writeFile(
    config,
    `export default { testDir: ${JSON.stringify(join(root, 'tests/next'))}, timeout: 60000, use: { baseURL: 'http://127.0.0.1:4178' }, webServer: { command: 'npm run build && npx next start -p 4178', cwd: ${JSON.stringify(next)}, url: 'http://127.0.0.1:4178', reuseExistingServer: false, timeout: 180000 } };`,
  );
  console.log('Checking Next.js production SSR with installed archive...');
  console.log(
    run(
      process.execPath,
      [join(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config', config, '-g', 'SSR'],
      root,
    ),
  );
  results.push({ name: 'next-production', passed: true });
  await writeFile(
    join(artifactDir, 'verification.json'),
    JSON.stringify(
      {
        tarball,
        integrity,
        version: manifest.version,
        verifiedAt: new Date().toISOString(),
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Verified release archive: ${tarball}\n${integrity}`);
} finally {
  await browser.close();
}
