import { spawn, execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'tsup';

const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
const args = process.argv.slice(2);
const port =
  args.length === 0 ? 4189 : args[0] === '--port' && args.length === 2 ? Number(args[1]) : NaN;
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error('Usage: npm run preview:demo -- --port 4189');

await mkdir('.runtime', { recursive: true });
const snapshot = await mkdtemp(resolve('.runtime', 'preview-'));
const web = resolve(snapshot, 'web');
const api = resolve(snapshot, 'api');
const revision = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
const changes = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
const version = `${revision}${changes ? '-working' : ''}`;

await new Promise((accept, reject) => {
  const builder = spawn('npm', ['run', 'build:demo', '--', '--outDir', web], { stdio: 'inherit' });
  builder.on('error', reject);
  builder.on('exit', (code) => (code === 0 ? accept() : reject(new Error('Demo build failed.'))));
});
await build({
  entry: { server: 'demo/server.ts' },
  outDir: api,
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  config: false,
  dts: false,
  splitting: false,
  skipNodeModulesBundle: true,
  silent: true,
});
await writeFile(
  resolve(snapshot, 'manifest.json'),
  JSON.stringify({ revision: version, port, builtAt: new Date().toISOString() }, null, 2),
);
const server = spawn(process.execPath, [resolve(api, 'server.js')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ORFIN_DEMO_PORT: String(port),
    ORFIN_DEMO_STATIC_DIR: web,
    ORFIN_DEMO_REVISION: version,
  },
});
server.on('error', (error) => {
  throw error;
});
server.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
process.stdout.write(`Frozen snapshot ${version}: ${snapshot}\n`);
