import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

await mkdir('dist/standalone', { recursive: true });
const { version } = JSON.parse(await readFile('package.json', 'utf8'));
const result = await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/standalone/orfinsupport.min.js',
  bundle: true,
  format: 'iife',
  globalName: 'OrfinSupport',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  legalComments: 'linked',
  metafile: true,
  banner: { js: `/*! OrfinSupport v${version} | MIT | Third-party notices: LICENSES.txt */` },
});
for (const output of Object.values(result.metafile.outputs)) {
  if (output.imports.length) throw new Error('Standalone bundle contains external imports');
}
const licenses = ['OrfinSupport\n' + (await readFile('LICENSE', 'utf8'))];
// All runtime imports in this entry resolve to Lit packages, bundled below.
for (const name of ['lit', 'lit-html', 'lit-element', '@lit/reactive-element']) {
  licenses.push(`${name}\n${await readFile(`node_modules/${name}/LICENSE`, 'utf8')}`);
}
await writeFile('dist/standalone/LICENSES.txt', licenses.join('\n\n---\n\n'));
const bytes = await readFile('dist/standalone/orfinsupport.min.js');
await writeFile(
  'dist/standalone/integrity.json',
  JSON.stringify(
    {
      version,
      file: 'orfinsupport.min.js',
      integrity: 'sha384-' + createHash('sha384').update(bytes).digest('base64'),
    },
    null,
    2,
  ) + '\n',
);
console.log(`Standalone browser bundle: ${bytes.length} bytes; no external imports.`);
