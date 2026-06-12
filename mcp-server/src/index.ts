#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  console.error('[captura-mcp] Starting CAPTURA MCP Server...');
  console.error('[captura-mcp] Transport: stdio');
  console.error('[captura-mcp] Auth required:', process.env.MCP_API_KEY ? 'yes' : 'no');

  await server.connect(transport);

  console.error('[captura-mcp] Server ready. Waiting for tool calls...');
}

main().catch((err) => {
  console.error('[captura-mcp] Fatal error:', err);
  process.exit(1);
});
