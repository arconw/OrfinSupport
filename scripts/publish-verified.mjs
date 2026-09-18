import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = JSON.parse(
  await readFile(new URL('../.artifacts/package/verification.json', import.meta.url), 'utf8'),
);
const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(report.version, manifest.version, 'Version changed since package verification');
assert(
  report.results.length >= 11 && report.results.every((result) => result.passed),
  'Incomplete package verification',
);
assert.equal(
  'sha512-' +
    createHash('sha512')
      .update(await readFile(report.tarball))
      .digest('base64'),
  report.integrity,
  'Release archive changed since verification',
);
const flags = process.argv.slice(2);
assert(
  flags.every((flag) => ['--dry-run', '--provenance'].includes(flag)),
  'Unsupported publishing option',
);
const result = spawnSync(
  'npm',
  [
    'publish',
    report.tarball,
    '--access',
    'public',
    '--registry=https://registry.npmjs.org/',
    ...flags,
  ],
  { cwd: root, stdio: 'inherit' },
);
process.exit(result.status ?? 1);
