# Installing the gpu.nz MCP server (for Cline and other AI agents)

The gpu.nz MCP server is **hosted** at `https://gpu.nz/mcp` (Streamable HTTP). There is nothing to build or run
locally.

## 1. Decide whether you need an API key

- **No key:** the agent can search GPU servers with live prices, look up GPU models and templates, and estimate how
  much VRAM an LLM or image model needs. Use this to try the server.
- **With a key:** the agent can also launch, monitor, stop and destroy servers on the user's gpu.nz account (billed by
  the minute). Ask the user to create a key at https://gpu.nz/en/console/keys and paste it. Keys look like
  `gpz_` followed by 40 letters and digits. Never print the key back or commit it anywhere.

## 2. Add the server to Cline

Open Cline's MCP settings (`cline_mcp_settings.json`) and add:

```json
{
  "mcpServers": {
    "gpunz": {
      "type": "streamableHttp",
      "url": "https://gpu.nz/mcp",
      "headers": { "Authorization": "Bearer gpz_…" },
      "disabled": false
    }
  }
}
```

Without a key, leave out the `headers` line.

If your Cline version does not support remote servers, run it through `mcp-remote` instead:

```json
{
  "mcpServers": {
    "gpunz": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://gpu.nz/mcp", "--header", "Authorization:${GPUNZ_AUTH}"],
      "env": { "GPUNZ_AUTH": "Bearer gpz_…" }
    }
  }
}
```

## 3. Check that it works

Ask the agent: «Find the cheapest GPU with at least 24 GB of VRAM» or «How much VRAM does Qwen3 32B need with a 32K
context?». Both work without a key. The server lists its tools on connect; tools that change something (launch, stop,
destroy) are annotated as such, so the client asks the user before running them.

Docs: https://gpu.nz/en/docs/mcp
