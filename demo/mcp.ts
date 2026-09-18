import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { toolsFromMCP } from '../src/mcp/index';
import { workspaceStatistics } from './data';

export async function createWorkspaceMCP() {
  const server = new McpServer({ name: 'northstar-workspace', version: '1.0.0' });
  server.registerTool(
    'workspace_statistics',
    {
      description:
        'Get current Northstar workspace statistics over MCP: completed task count this week, workspace plan, team member count, active project count and on-time delivery rate. Use for workspace activity, completed tasks, team size or plan details.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            ...workspaceStatistics,
            source: 'Northstar demo workspace over MCP',
          }),
        },
      ],
    }),
  );
  server.registerTool(
    'team_capacity',
    {
      description:
        'Get Northstar team capacity over MCP: available working days, planned days, utilization and remaining days. Use for team availability or workload.',
      inputSchema: {},
    },
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            plan: workspaceStatistics.plan,
            members: workspaceStatistics.members,
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
    tools: await toolsFromMCP(client, { allow: ['workspace_statistics', 'team_capacity'] }),
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
