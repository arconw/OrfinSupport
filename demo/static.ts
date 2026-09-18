import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

export function createStaticHandler(directory: string) {
  const root = resolve(directory);
  return async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
      let file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (
        !file.startsWith(`${root}${sep}`) ||
        pathname.split('/').some((part) => part.startsWith('.'))
      ) {
        response.writeHead(404).end();
        return;
      }
      let info = await stat(file).catch(() => undefined);
      if (!info && !extname(file)) {
        file = resolve(root, 'index.html');
        info = await stat(file);
      }
      if (!info?.isFile() || !contentTypes[extname(file)]) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        'Content-Type': contentTypes[extname(file)]!,
        'Content-Length': info.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') response.end();
      else {
        const stream = createReadStream(file);
        stream.on('error', () => response.destroy());
        response.on('close', () => stream.destroy());
        stream.pipe(response);
      }
    } catch {
      if (!response.headersSent) response.writeHead(400);
      response.end();
    }
  };
}
