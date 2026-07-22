---
title: MCP Client Setup
description: Configure Cursor, Claude Code, Claude Cowork, Codex, VS Code, and other MCP clients to connect to OpenQuok HTTP streaming.
order: 1
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick setup from the dashboard

<Steps>

### Generate a programmatic token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create your OAuth app on the Apps tab if needed, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Open MCP client configuration

Scroll to <strong>MCP client configuration</strong> on the same page. Choose <strong>Authorization header</strong> or <strong>API key in URL</strong>, pick your client, then <strong>Copy</strong> the snippet.

### Paste into your MCP client

Follow the hint under the snippet (project <Badge text=".cursor/mcp.json" variant="path" />, terminal command, etc.). Use <strong>Reveal</strong> before copying if you need to verify the token in the command.

</Steps>

<Callout type="note" title="Self-hosted">
<p>Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> on the web app with the same API host in production.</p>
</Callout>

## Authentication methods

### Authorization header (recommended)

- URL: <Badge text="https://api.openquok.com/mcp" variant="new" />
- Header: <Badge text="Authorization: Bearer opo_your_programmatic_token" variant="default" />

### API key in URL

For clients that cannot send custom headers:

```text
https://api.openquok.com/mcp/opo_your_programmatic_token
```

## Per-client snippets

The dashboard generator produces configs for these clients. Server name in JSON files is always <Badge text="openquok" variant="default" />.

For step-by-step guides with troubleshooting, see <a href="/docs/mcp-setup-guides">MCP setup guides</a>.

| Client | Config location | Guide |
| --- | --- | --- |
| <Badge text="Claude Code" variant="default" /> | Terminal <Badge text="claude mcp add" variant="default" /> command | <a href="/docs/mcp-setup-guides/claude-code">Claude Code</a> |
| <Badge text="Claude Cowork" variant="default" /> | Custom connector or <Badge text="managedMcpServers" variant="param" /> entry | <a href="/docs/mcp-setup-guides/claude-cowork">Claude Cowork</a> |
| <Badge text="Cursor" variant="default" /> | <Badge text=".cursor/mcp.json" variant="path" /> | <a href="/docs/mcp-setup-guides/cursor">Cursor</a> |
| <Badge text="VS Code / Copilot" variant="default" /> | <Badge text=".vscode/mcp.json" variant="path" /> | <a href="/docs/mcp-setup-guides/vscode-copilot">VS Code / Copilot</a> |
| <Badge text="Devin Desktop" variant="default" /> | <Badge text="~/.codeium/mcp_config.json" variant="path" /> | <a href="/docs/mcp-setup-guides/devin-desktop">Devin Desktop</a> |
| <Badge text="Amp" variant="default" /> | Terminal command or Amp <Badge text="settings.json" variant="path" /> | <a href="/docs/mcp-setup-guides/amp">Amp</a> |
| <Badge text="Codex" variant="default" /> | <Badge text="~/.codex/config.toml" variant="path" /> | <a href="/docs/mcp-setup-guides/codex">Codex</a> |
| <Badge text="Antigravity CLI" variant="default" /> | <Badge text="~/.gemini/config/mcp_config.json" variant="path" /> | <a href="/docs/mcp-setup-guides/antigravity-cli">Antigravity CLI</a> |
| <Badge text="Warp" variant="default" /> | Settings → MCP Servers | <a href="/docs/mcp-setup-guides/warp">Warp</a> |

### Cursor (header auth)

```json
{
  "mcpServers": {
    "openquok": {
      "url": "https://api.openquok.com/mcp",
      "headers": {
        "Authorization": "Bearer opo_your_programmatic_token"
      }
    }
  }
}
```

### Claude Code (header auth)

```bash
claude mcp add openquok \
  --transport http \
  --header "Authorization: Bearer opo_your_programmatic_token" \
  "https://api.openquok.com/mcp"
```

### Claude Code (path auth)

```bash
claude mcp add openquok --transport http --url "https://api.openquok.com/mcp/opo_your_programmatic_token"
```

## Verify connection

Ask your agent:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" /> and return channel names and IDs from your workspace.

## Manual verification checklist

Run this checklist after copying a snippet from the dashboard. Use a workspace that already has at least one connected channel so <Badge text="integrationList" variant="default" /> returns real data.

### Cursor

- Paste the generated OpenQuok entry into <Badge text=".cursor/mcp.json" variant="path" />.
- Open Cursor settings or reload the workspace if the MCP server list does not refresh automatically.
- Ask your agent:

  > List my connected social media accounts

- Confirm the response includes your workspace channel names and IDs.
- If it fails, switch the dashboard snippet between <strong>Authorization header</strong> and <strong>API key in URL</strong> and retry once.

### Codex

- Paste the generated entry into <Badge text="~/.codex/config.toml" variant="path" />.
- Restart Codex or start a fresh session so it reloads MCP configuration.
- Ask your agent:

  > List my connected social media accounts

- Confirm the response lists channels from the same OpenQuok workspace that issued the token.
- If it fails, verify the MCP URL still points at your current API origin and that the <Badge text="opo_" variant="default" /> token was copied completely.

### Claude Code

- Run the generated <Badge text="claude mcp add" variant="default" /> command or update the existing OpenQuok server entry.
- Start a new Claude Code session after the command succeeds.
- Ask your agent:

  > List my connected social media accounts

- Confirm Claude returns connected channel names and IDs from OpenQuok.
- If it fails, run <Badge text="claude mcp list" variant="default" /> to verify the <Badge text="openquok" variant="default" /> server is registered, then retry with the alternate auth method if needed.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP setup guides" description="Step-by-step guides for Cursor, Claude Code, Warp, and other clients" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP introduction" description="Endpoints, authentication, and v1 tool list" href="/docs/getting-started-for-mcp" />
<LinkCard title="Tools reference" description="schedulePostTool input shape and provider settings" href="/docs/mcp-references/tools" />
<LinkCard title="MCP examples" description="Copy-paste agent workflows for scheduling posts by platform" href="/docs/mcp-examples" />
<LinkCard title="CLI authentication" description="Alternative to MCP for terminal and device-login flows" href="/docs/getting-started-for-cli/authentication" />
</CardGrid>
