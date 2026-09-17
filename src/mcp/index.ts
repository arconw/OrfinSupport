import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Tool } from '../core/types';

export interface MCPToolsOptions {
  allow: string[];
  prefix?: string;
}

export async function toolsFromMCP(
  client: Pick<Client, 'listTools' | 'callTool'>,
  options: MCPToolsOptions,
): Promise<Tool[]> {
  const tools: Tool[] = [];
  let cursor: string | undefined;
  const cursors = new Set<string>();
  do {
    const page = await client.listTools(cursor ? { cursor } : {});
    for (const tool of page.tools) {
      if (!options.allow.includes(tool.name)) continue;
      const name = `${options.prefix ?? ''}${tool.name}`;
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name))
        throw new Error('MCP tool names must fit the model tool-name format.');
      tools.push({
        name,
        description: tool.description ?? tool.name,
        parameters: tool.inputSchema,
        async execute(args, context) {
          const result = await client.callTool({ name: tool.name, arguments: args }, undefined, {
            signal: context.signal,
          });
          if (result.isError) throw new Error('MCP tool failed.');
          return result;
        },
      });
    }
    cursor = page.nextCursor;
    if (cursor) {
      if (cursors.has(cursor) || cursors.size >= 100) throw new Error('Invalid MCP pagination.');
      cursors.add(cursor);
    }
  } while (cursor);
  return tools;
}

export async function connectMCP(
  options: MCPToolsOptions & { url: string; headers?: HeadersInit },
) {
  const [{ Client }, { StreamableHTTPClientTransport }] = await Promise.all([
    import('@modelcontextprotocol/sdk/client/index.js'),
    import('@modelcontextprotocol/sdk/client/streamableHttp.js'),
  ]);
  const client = new Client({ name: 'orfinsupport', version: '0.1.0' });
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL(options.url), {
        requestInit: { headers: options.headers },
      }),
    );
    return { tools: await toolsFromMCP(client, options), close: () => client.close() };
  } catch (error) {
    await client.close();
    throw error;
  }
}
