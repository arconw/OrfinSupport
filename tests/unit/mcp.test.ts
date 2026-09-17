import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'node:http';
import { toolsFromMCP, connectMCP } from '../../src/mcp/index';
import { request } from './helpers';

describe('MCP bridge', () => {
  it('connects to a real Streamable HTTP endpoint and closes the session', async () => {
    const mcp = new McpServer({ name: 'http-test', version: '1' });
    mcp.registerTool('status', { inputSchema: {} }, async () => ({
      content: [{ type: 'text', text: 'HTTP transport works' }],
    }));
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    await mcp.connect(transport);
    const server = createServer((req, res) => {
      void transport.handleRequest(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test address.');
    const connection = await connectMCP({
      url: `http://127.0.0.1:${address.port}/mcp`,
      allow: ['status'],
    });
    try {
      expect(
        await connection.tools[0]!.execute(
          {},
          { signal: new AbortController().signal, request: request() },
        ),
      ).toMatchObject({ content: [{ text: 'HTTP transport works' }] });
    } finally {
      await connection.close();
      await mcp.close();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
  it('discovers only allowed tools and calls an actual MCP server', async () => {
    const server = new McpServer({ name: 'test', version: '1' });
    server.registerTool('allowed', { inputSchema: {}, description: 'Allowed data' }, async () => ({
      content: [{ type: 'text', text: 'MCP result' }],
    }));
    server.registerTool('hidden', { inputSchema: {} }, async () => ({
      content: [{ type: 'text', text: 'Hidden' }],
    }));
    const client = new Client({ name: 'test-client', version: '1' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(a), server.connect(b)]);
    try {
      const tools = await toolsFromMCP(client, { allow: ['allowed'], prefix: 'workspace_' });
      expect(tools.map((tool) => tool.name)).toEqual(['workspace_allowed']);
      expect(
        await tools[0]!.execute({}, { signal: new AbortController().signal, request: request() }),
      ).toMatchObject({ content: [{ type: 'text', text: 'MCP result' }] });
    } finally {
      await client.close();
      await server.close();
    }
  });
  it('surfaces an MCP tool error without reporting success', async () => {
    const server = new McpServer({ name: 'test', version: '1' });
    server.registerTool('failure', { inputSchema: {} }, async () => ({
      isError: true,
      content: [{ type: 'text', text: 'Failure' }],
    }));
    const client = new Client({ name: 'test-client', version: '1' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(a), server.connect(b)]);
    try {
      const tools = await toolsFromMCP(client, { allow: ['failure'] });
      await expect(
        tools[0]!.execute({}, { signal: new AbortController().signal, request: request() }),
      ).rejects.toThrow('MCP tool failed');
    } finally {
      await client.close();
      await server.close();
    }
  });
});
