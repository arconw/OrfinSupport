import { defineConfig } from 'tsup';
import { readFile, writeFile } from 'node:fs/promises';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/core/index.ts',
    'src/server/index.ts',
    'src/providers/index.ts',
    'src/mcp/index.ts',
    'src/adapters/react.ts',
    'src/adapters/vue.ts',
    'src/adapters/angular.ts',
  ],
  format: ['esm'],
  target: 'es2022',
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'vue', '@angular/core', '@angular/common', '@modelcontextprotocol/sdk'],
  onSuccess: async () => {
    const path = 'dist/adapters/react.js';
    const source = await readFile(path, 'utf8');
    await writeFile(path, `'use client';\n${source}`);
  },
});
