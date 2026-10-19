/**
 * Smoke test: starts the bridge over stdio, lists the tools and asks for a VRAM estimate (no key needed).
 *   node test.js                                   (the bridge from this checkout, against https://gpu.nz/mcp)
 *   BRIDGE_CMD='["docker","run","-i","--rm","ghcr.io/gpunz/gpunz-mcp"]' node test.js   (a published image)
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "gpunz-mcp-test", version: "1.0.0" });
const [command, ...args] = process.env.BRIDGE_CMD ? JSON.parse(process.env.BRIDGE_CMD) : [process.execPath, "index.js"];
await client.connect(new StdioClientTransport({ command, args, env: { ...process.env, GPUNZ_API_KEY: "" } }));
const { tools } = await client.listTools();
const names = tools.map((t) => t.name);
for (const need of ["search_offers", "estimate_vram", "create_instance", "destroy_instance"]) {
  if (!names.includes(need)) throw new Error(`missing tool ${need}`);
}
const res = await client.callTool({ name: "estimate_vram", arguments: { model: "qwen3-32b" } });
const body = JSON.parse(res.content[0].text);
if (!(body.total_vram_gb > 10)) throw new Error(`unexpected estimate ${res.content[0].text}`);
console.log(`ok: ${names.length} tools; Qwen3 32B needs ${body.total_vram_gb} GB`);
await client.close();
