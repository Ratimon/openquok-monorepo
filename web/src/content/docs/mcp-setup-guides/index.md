---
title: MCP Clients Overview
description: Platform-specific setup for connecting OpenQuok MCP to Cursor, Claude Code, Codex, VS Code Copilot, and other native MCP clients.
order: 0
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Guides for wiring OpenQuok into **native MCP clients** — the editors and terminals where you already chat with an AI agent. Each page covers where to paste the config, which auth method to use, and how to confirm the connection.

For a quick copy-paste snippet, start at <a href="/docs/getting-started-for-mcp/setup">MCP client setup</a> in the dashboard (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> → <strong>MCP client configuration</strong>).

For **agent hosts** that run the CLI skill (OpenClaw, Hermes Agent, Telegram bots), see <a href="/docs/agent-setup-guides">Agent setup guides</a> instead.

<CardGrid>
<LinkCard title="Cursor" description="Project-level .cursor/mcp.json for Agent and Composer" href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="Claude Code" description="claude mcp add with HTTP transport" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="Claude Cowork" description="Custom connectors and managedMcpServers" href="/docs/mcp-setup-guides/claude-cowork" />
<LinkCard title="VS Code / Copilot" description="Project .vscode/mcp.json for GitHub Copilot" href="/docs/mcp-setup-guides/vscode-copilot" />
<LinkCard title="Devin Desktop" description="Global ~/.codeium/mcp_config.json for Devin Local" href="/docs/mcp-setup-guides/devin-desktop" />
<LinkCard title="Amp" description="amp mcp add or Amp settings.json" href="/docs/mcp-setup-guides/amp" />
<LinkCard title="Codex" description="OpenAI Codex config.toml MCP servers" href="/docs/mcp-setup-guides/codex" />
<LinkCard title="Antigravity CLI" description="Global ~/.gemini/config/mcp_config.json for agy" href="/docs/mcp-setup-guides/antigravity-cli" />
<LinkCard title="Warp" description="Warp terminal MCP server settings" href="/docs/mcp-setup-guides/warp" />
</CardGrid>

<Callout type="note" title="Server name">
<p>Every JSON config uses <Badge text="openquok" variant="default" /> as the MCP server key. Keep that name when merging with existing servers.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and v1 tool list" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator and auth methods" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP examples" description="Agent workflows for scheduling posts by platform" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="schedulePostTool input shape and provider settings" href="/docs/mcp-references/tools" />
</CardGrid>
