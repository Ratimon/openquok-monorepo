---
title: CLI authentication
description: OAuth2 device flow, API keys, and OPENQUOK_* environment variables for the Openquok CLI—including a custom CLI auth server URL.
order: 1
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The Openquok CLI authenticates to the API in one of two ways:

- **OAuth2 device flow** (recommended for interactive use) — no client ID or secret in the CLI; a small **CLI auth server** holds the OAuth client secret and completes the flow.
- **API key** — set <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> for scripts and CI.

If both are present, <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> takes precedence over stored OAuth credentials (see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/README.md"><Badge text="agent/README.md" variant="path" /></DocsExternalLink>).

## OAuth2 (device flow)

Run:

```bash
openquok auth:login
```

This will:

1. Display a one-time code in your terminal (and a URL to open if needed).
2. Open the browser so you can approve access on the Openquok OAuth UI.
3. Store credentials for later commands (default <code>~/.openquok/credentials.json</code>).

**Other auth commands:**

```bash
openquok auth:status
openquok auth:logout
```

### Which auth server does the CLI use?

By default, <code>openquok auth:login</code> uses the **hosted** device-flow server:

- <Badge text="https://cli-auth.openquok.com" variant="new" />

You can point the CLI at **your own** deployed auth server (for self-hosted Openquok or local development of <Badge text="agent/server" variant="path" />):

- **Environment variable:** set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> to the server **origin** (no trailing slash).
- **Per run:** pass <code>--authServer</code> to <code>openquok auth:login</code>.

```bash
export OPENQUOK_AUTH_SERVER="https://auth.example.com"
openquok auth:login
```

```bash
openquok auth:login --authServer "https://auth.example.com"
```

For **local** auth server development, the default listen URL is <Badge text="http://localhost:3111" variant="default" /> — see <a href="/docs/installation/development-environment#optional-cli-auth-server-device-flow">Development environment</a> and <a href="/docs/configuration-agent">Configuration - Agent</a>.

<Callout type="note" title="Operators: deploy the auth server">
<p>Environment variables for <strong>running</strong> the auth server (<Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, OAuth client keys, etc.) are documented under <a href="/docs/configuration-agent">Configuration - Agent</a>, not on this page.</p>
</Callout>

## API key

Set your programmatic API token for non-interactive use:

```bash
export OPENQUOK_API_KEY="opo_..."
export OPENQUOK_API_URL="https://api.openquok.com"
```

Add exports to your shell profile if you want them to persist.

You can also pass an API key once (storage behavior is described in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/README.md"><Badge text="agent/README.md" variant="path" /></DocsExternalLink>):

```bash
openquok auth:login --apiKey "your_token"
```

## Environment variables

These variables apply to the **CLI process** (your shell, CI job, or agent), not to the auth server deployment.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> | No* | — | Bearer token for the programmatic API |
| <Badge text="OPENQUOK_API_URL" variant="envBackend" /> | No | <Badge text="https://api.openquok.com" variant="new" /> | API origin; requests use paths under <code>/api/v1/</code> |
| <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> | No | <Badge text="https://cli-auth.openquok.com" variant="new" /> | Origin of the device-flow auth server (<code>/device/*</code>, <code>/health</code>). Use <Badge text="http://localhost:3111" variant="default" /> when running <Badge text="agent/server" variant="path" /> locally |

*Either <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> or successful <code>openquok auth:login</code> (stored credentials) is required for authenticated commands.

## Self-hosting the auth server

You do **not** need to self-host the auth server to use the CLI with Openquok’s hosted stack — the defaults above are enough.

If you run **your own** Openquok deployment and want a dedicated device-flow service, deploy <Badge text="agent/server" variant="path" />, register <code>SERVER_URL/device/callback</code> on your OAuth app, and set <Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> in the CLI to that public origin. Step-by-step operator docs:

<CardGrid>
<LinkCard title="Configuration - Agent" description="Env vars, production vs local SERVER_URL, and deploy steps" href="/docs/configuration-agent" />
<LinkCard title="Auth server architecture" description="Endpoints and Postgres device flow state" href="/docs/configuration-agent/architecture" />
<LinkCard title="Vercel — CLI auth server" description="Separate project, root directory agent/server" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="CLI overview" description="Install, quick start, and command overview" href="/docs/cli" />
<LinkCard title="Admin — OAuth apps" description="Create OAuth client ID and secret; redirect URLs" href="/docs/admin/oauth-server" />
<LinkCard title="Configuration - Backend" description="API base URL and OAuth alignment with the web app" href="/docs/configuration-backend" />
</CardGrid>
