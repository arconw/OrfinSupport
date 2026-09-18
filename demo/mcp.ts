import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { toolsFromMCP } from '../src/mcp/index';

export async function createWorkspaceMCP() {
  const server = new McpServer({ name: 'northstar-workspace', version: '1.0.0' });
  server.registerTool(
    'team_capacity',
    {
      description:
        'Get Northstar workspace statistics over MCP: current plan, member count, team capacity and available working days. Use for workspace statistics, plan, team size, availability or workload.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            plan: 'Studio',
            members: 12,
            availableDays: 48,
            plannedDays: 36,
            utilization: '75%',
            remainingDays: 12,
            source: 'Northstar demo workspace over MCP',
          }),
        },
      ],
    }),
  );
  const client = new Client({ name: 'orfin-demo', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return {
    tools: await toolsFromMCP(client, { allow: ['team_capacity'] }),
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
