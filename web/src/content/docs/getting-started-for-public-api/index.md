---
title: Overview - Public API
description: Getting started to automate your Social Scheduling with Openquok 's public api.
order: 0
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Authentication

All programmatic access to <Badge text="/api/v1/public/*" variant="path" /> uses a Bearer token with the <Badge text="opo_" variant="default" /> prefix in the <Badge text="Authorization" variant="default" /> header.

### Programmatic access token (your workspace)

For scripts, CI, and your own integrations, use a **programmatic access token** tied to your workspace:

1. In the Openquok app, go to <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.
2. Click <Badge text="Generate / Rotate token" variant="new" />. The plaintext <Badge text="opo_…" variant="default" /> value is shown **once** — copy it immediately.
3. Send it on every request:

```bash
curl -H "Authorization: Bearer opo_your_programmatic_token" https://api.openquok.com/api/v1/public/integrations
```

Tokens belong to the **workspace (organization)** you selected and act with that workspace's permissions. Rotate from the same panel when you need a new token; previously issued tokens stop working after rotation.

<Callout type="tip" title="CLI and agents">
<p>Prefer <Badge text="openquok auth:login" variant="default" /> (device OAuth) when a browser is available — it stores an <Badge text="opo_" variant="default" /> token without pasting secrets. For headless hosts, set <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> to the same <Badge text="opo_" variant="default" /> value. See <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.</p>
</Callout>

<Callout type="tip" title="Native MCP clients">
<p>Cursor, Claude Code, Codex, and other MCP hosts can connect directly to OpenQuok over HTTP streaming with your <Badge text="opo_" variant="default" /> token — no CLI skill required. See <a href="/docs/getting-started-for-mcp">MCP introduction</a> and copy snippets from <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> in the dashboard.</p>
</Callout>

### OAuth2 access token (third-party apps)

If you are building an app **for other Openquok users**, register an OAuth app under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> and use the <a href="/docs/developer-guidelines/oauth2-authentication">OAuth2 Authorization Code flow</a>. The returned <Badge text="access_token" variant="default" /> also uses the <Badge text="opo_" variant="default" /> prefix and is sent the same way:

```bash
curl -H "Authorization: Bearer opo_your_oauth_token" https://api.openquok.com/api/v1/public/integrations
```

OAuth tokens are scoped to the **organization the user authorized** — not to the developer who built the app — so the same endpoint returns different data depending on which token is used.

## Base URL

| Environment | Base URL |
| --- | --- |
| Openquok Cloud | <Badge text="https://api.openquok.com/api/v1/public" variant="new" /> |
| Self-hosted | Your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin + <Badge text="/api/v1/public" variant="path" /> |

The path prefix <Badge text="/api/v1" variant="path" /> is configurable via <Badge text="API_PREFIX" variant="envBackend" />.

## Rate limits

<Callout type="warning">
<p>A <strong>30 requests per hour</strong> limit applies to all endpoints. This does not mean you can only post 30 times per hour — each API call counts as one request, so <strong>schedule multiple posts in a single request</strong> (for example a multi-channel post group) to maximize throughput.</p>
</Callout>

## Supported social channels

Openquok currently ships with **3 social provider integrations**: **Meta Threads** and **Instagram** in two flavors (Business and Standalone). Each connected channel goes through the same <Badge text="POST /api/v1/public/posts" variant="default" /> endpoint — provider-specific tuning lives under <code>providerSettingsByIntegrationId</code> keyed by the channel's UUID.

For per-channel settings, and copy-paste API examples — plus the **channel vs integration** terminology used across the dashboard and API — see the dedicated <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> page.

<CardGrid>
<LinkCard title="Supported social channels" description="Provider identifiers, per-channel settings (Threads, Instagram)" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="MCP (HTTP streaming)" description="Connect Cursor, Claude Code, and Codex with your opo_ token" href="/docs/getting-started-for-mcp" />
</CardGrid>

## Generate Output

Skip hand-writing JSON — open the <a href="/account/payload-wizard">Payload Wizard</a> instead.


![Wizard Payload Generator](/docs/getting-started-for-public-api/wizard-payload.webp)


It's the same post composer you already use in the Openquok app, but the schedule buttons are swapped for <Badge text="Copy scheduled payload" variant="new" /> and <Badge text="Copy draft payload" variant="default" />, so you can drop the result straight into a <Badge text="POST /api/v1/public/posts" variant="default" /> request body.

## Start Integrating with SDK

<Badge text="@openquok/node-sdk" variant="experimental" /> is a small, typed Node.js wrapper around Openquok's programmatic API (<Badge text="/api/v1/public" variant="default" />). Use it to schedule posts, manage post groups, upload media, and inspect connected channels from any Node.js script or backend.


### Installation

```bash
npm install @openquok/node-sdk
```

### Quick guide

<Callout type="note">
<p>Pass your programmatic <Badge text="opo_" variant="default" /> token (from <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />, or from OAuth for third-party apps) as the first argument to the <code>Openquok</code> constructor — it is sent as the <Badge text="Authorization" variant="default" /> header on every request.</p>
</Callout>

```ts
import Openquok from '@openquok/node-sdk';

const openquok = new Openquok('opo_your_programmatic_token', {
	// optional (defaults shown)
	baseUrl: 'https://api.openquok.com',
	apiPrefix: '/api/v1'
});

// Upload a file (multipart field name: `file`)
const uploaded = await openquok.upload(fileBuffer, 'png');

// Create a scheduled post
await openquok.post({
	scheduledAt: new Date().toISOString(),
	status: 'scheduled',
	body: 'Hello from Openquok SDK',
	media: uploaded?.data?.filePath
		? [{ id: '1', path: uploaded.data.filePath }]
		: undefined
});
```

For the full method list (`upload`, `post`, `postList`, `getPost`, `flipPostStatus`, `deletePost`, `integrations`, `deleteIntegrationChannel`), see the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/README.md">SDK README</DocsExternalLink>.

### References

<CardGrid>
<LinkCard title="NodeJs SDK" description="Official NodeJs SDK" href="https://www.npmjs.com/package/@openquok/node-sdk" />
</CardGrid>


## Related Section(s)

<CardGrid>
<LinkCard title="Supported social channels" description="Per-provider settings and copy-paste API examples for Threads and Instagram" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="MCP (HTTP streaming)" description="Native MCP client setup for Cursor, Claude Code, Codex, and more" href="/docs/getting-started-for-mcp" />
<LinkCard title="Integrations APIs" description="Programmatic endpoints for connecting channels and triggering provider tools — what the SDK wraps" href="/docs/apis-integrations" />
<LinkCard title="Posts APIs" description="Schedule, list, flip draft ↔ scheduled, and delete posts against your connected channels" href="/docs/apis-posts" />
<LinkCard title="Analytics APIs" description="Platform and per-post insights backed by each provider's native analytics" href="/docs/apis-analytics" />
<LinkCard title="Notifications APIs" description="Paginated in-app notification history scoped to your workspace" href="/docs/apis-notifications" />
<LinkCard title="Uploads APIs" description="Upload media that you attach to scheduled posts" href="/docs/apis-uploads" />
<LinkCard title="CLI" description="Same public API surface, available as openquok auth/posts/integrations commands" href="/docs/getting-started-for-cli" />
</CardGrid>

