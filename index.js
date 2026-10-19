#!/usr/bin/env node
/**
 * gpu.nz MCP bridge: a local stdio MCP server that forwards every request to the hosted gpu.nz MCP server
 * (https://gpu.nz/mcp, Streamable HTTP). For MCP clients that only start local servers; clients that speak HTTP can
 * connect to https://gpu.nz/mcp directly.
 *
 *   GPUNZ_API_KEY  API key (gpz_…) from https://gpu.nz/console/keys — needed to rent and manage servers,
 *                  not to browse GPUs, prices and VRAM estimates
 *   GPUNZ_MCP_URL  endpoint override (default https://gpu.nz/mcp)
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const VERSION = "1.0.0";
const endpoint = new URL(process.env.GPUNZ_MCP_URL || "https://gpu.nz/mcp");
const key = (process.env.GPUNZ_API_KEY || "").trim();

const headers = { "User-Agent": `gpunz-mcp/${VERSION} (stdio bridge)` };
if (key) headers.Authorization = `Bearer ${key}`;

const upstream = new Client({ name: "gpunz-mcp-bridge", version: VERSION });
await upstream.connect(new StreamableHTTPClientTransport(endpoint, { requestInit: { headers } }));

const info = upstream.getServerVersion();
const server = new Server(
  { name: info?.name ?? "gpu.nz", version: info?.version ?? VERSION },
  { capabilities: { tools: {} }, instructions: upstream.getInstructions() },
);

server.setRequestHandler(ListToolsRequestSchema, (request) => upstream.listTools(request.params));
server.setRequestHandler(CallToolRequestSchema, (request) => upstream.callTool(request.params));

await server.connect(new StdioServerTransport());

const shutdown = async () => {
  await Promise.allSettled([server.close(), upstream.close()]);
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
