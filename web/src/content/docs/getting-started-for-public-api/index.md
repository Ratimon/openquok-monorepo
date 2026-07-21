---
title: Overview - Public API
description: Getting started to automate your Social Scheduling with Openquok's public API and Node.js SDK.
order: 0
lastUpdated: 2026-07-19
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

If you are building an app **for other Openquok users**, register an OAuth app under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> and use the <a href="/docs/oauth2-for-apps">OAuth2 Authorization Code flow</a>. The returned <Badge text="access_token" variant="default" /> also uses the <Badge text="opo_" variant="default" /> prefix and is sent the same way:

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


![Wizard Payload Generator](/docs/_assets/getting-started-for-public-api/wizard-payload.webp)


It's the same post composer you already use in the Openquok app, but the schedule buttons are swapped for <Badge text="Copy scheduled payload" variant="new" /> and <Badge text="Copy draft payload" variant="default" />, so you can drop the result straight into a <Badge text="POST /api/v1/public/posts" variant="default" /> request body.

## Channel groups

Workspaces can organize connected channels into **channel groups** (the dashboard calls them customers). Use them to scope list and calendar queries to one client or brand.

| Action | HTTP | SDK |
| --- | --- | --- |
| List groups | <Badge text="GET /public/groups" variant="path" /> | <Badge text="listGroups()" variant="default" /> |
| List channels in a group | <Badge text="GET /public/integrations?group=" variant="path" /> | <Badge text="integrations({ group })" variant="default" /> |

```bash
# List channel groups, then filter integrations to one group
curl -H "Authorization: Bearer opo_your_programmatic_token" \
  https://api.openquok.com/api/v1/public/groups

curl -H "Authorization: Bearer opo_your_programmatic_token" \
  "https://api.openquok.com/api/v1/public/integrations?group=<channel-group-id>"
```

The same <Badge text="group" variant="param" /> filter is available on <Badge text="GET /public/posts/list" variant="path" /> via <Badge text="customerGroupId" variant="param" /> — see <a href="/docs/apis-posts/list">List Posts</a>.

<Callout type="tip" title="CLI equivalent">
<p><Badge text="openquok integrations:groups" variant="default" /> lists groups; <Badge text="openquok integrations:list --group &lt;channel-group-id&gt;" variant="default" /> filters channels. See <a href="/docs/cli-usages/integrations">CLI integrations</a>.</p>
</Callout>

## Plugs

**Plugs** automate engagement after a post goes live (auto-replies, cross-account comments, reposts when a likes threshold is met). They are available on paid plans.

| Type | Scope | Configure via |
| --- | --- | --- |
| **Internal plugs** | Per post (compose time) | <Badge text="providerSettingsByIntegrationId" variant="param" /> on <Badge text="POST /public/posts" variant="path" /> |
| **Global plugs** | Per channel (account rules) | Plug endpoints below |

**Internal plugs** run once after publish — for example a same-account Threads reply or a cross-account comment from another connected channel. Set them in the create-post payload; see <a href="/docs/getting-started-for-public-api/supported-social-channels#internal-plugs">Supported social channels → Internal plugs</a> and the <a href="/docs/cli-examples/threads">Threads CLI examples</a>.

**Global plugs** are saved rules on a channel (e.g. auto-repost when likes ≥ 100). The orchestrator re-checks every 6 hours, up to 3 times per post.

| Action | HTTP | SDK |
| --- | --- | --- |
| Catalog (field names per provider) | <Badge text="GET /public/plug-catalog" variant="path" /> | <Badge text="getPlugCatalog()" variant="default" /> |
| List saved rules on a channel | <Badge text="GET /public/integration-plugs/:id" variant="path" /> | <Badge text="listIntegrationPlugs(integrationId)" variant="default" /> |
| Create or update a rule | <Badge text="POST /public/integration-plugs/:id" variant="path" /> | <Badge text="upsertIntegrationPlug(integrationId, body)" variant="default" /> |
| Delete a rule | <Badge text="DELETE /public/plugs/:plugId" variant="path" /> | <Badge text="deleteIntegrationPlug(plugId)" variant="default" /> |
| Enable or disable a rule | <Badge text="PUT /public/plugs/:plugId/activate" variant="path" /> | <Badge text="setIntegrationPlugActivated(plugId, activated)" variant="default" /> |

```bash
# Discover plug types for Threads, then upsert a global rule
curl -H "Authorization: Bearer opo_your_programmatic_token" \
  https://api.openquok.com/api/v1/public/plug-catalog

curl -X POST -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  https://api.openquok.com/api/v1/public/integration-plugs/<integration-id> \
  -d '{"func":"autoPlugPost","fields":[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for reading!"}]}'
```

Not every provider exposes plugs — Threads, X, and LinkedIn Page support global rules; Instagram and TikTok do not. Provider-specific behavior is documented under <a href="/docs/social-integration">Social integration</a>.

## Start Integrating with SDK

<Badge text="@openquok/node-sdk" variant="experimental" /> is a small, typed Node.js wrapper around Openquok's programmatic API (<Badge text="/api/v1/public" variant="default" />). Use it to schedule posts, manage post groups, upload media, list channel groups, configure global plugs, and inspect connected channels from any Node.js script or backend.


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

await openquok.isConnected();

// List channel groups, then channels in the first group
const groups = await openquok.listGroups();
const channels = groups[0]
	? await openquok.integrations({ group: groups[0].id })
	: await openquok.integrations();

// Upload a file (multipart field name: `file`)
const uploaded = await openquok.upload(fileBuffer, 'png');

// Create a scheduled post
await openquok.post({
	scheduledAt: new Date().toISOString(),
	status: 'scheduled',
	body: 'Hello from Openquok SDK',
	media: uploaded?.data?.filePath
		? [{ id: '1', path: uploaded.data.filePath }]
		: undefined,
	integrationIds: [channels[0]?.id].filter(Boolean)
});

// Configure a global plug on a Threads channel (auto-reply at 100 likes)
const threadsChannel = channels.find((c) => c.identifier === 'threads');
if (threadsChannel) {
	await openquok.upsertIntegrationPlug(threadsChannel.id, {
		func: 'autoPlugPost',
		fields: [
			{ name: 'likesAmount', value: '100' },
			{ name: 'post', value: 'Thanks for reading!' }
		]
	});
}
```

For the full method table — posts, integrations, plugs, analytics, notifications, and more — see the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/README.md">SDK README</DocsExternalLink> (current release: <Badge text="@openquok/node-sdk@0.0.10" variant="experimental" />).

### References

<CardGrid>
<LinkCard title="NodeJs SDK" description="Official NodeJs SDK" href="https://www.npmjs.com/package/@openquok/node-sdk" />
</CardGrid>


## Related Section(s)

<CardGrid>
<LinkCard title="Supported social channels" description="Per-provider settings and copy-paste API examples for Threads and Instagram" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="MCP (HTTP streaming)" description="Native MCP client setup for Cursor, Claude Code, Codex, and more" href="/docs/getting-started-for-mcp" />
<LinkCard title="Integrations APIs" description="Programmatic endpoints for channels, groups, global plugs, and provider tools — what the SDK wraps" href="/docs/apis-integrations" />
<LinkCard title="Posts APIs" description="Schedule, list, flip draft ↔ scheduled, and delete posts against your connected channels" href="/docs/apis-posts" />
<LinkCard title="Analytics APIs" description="Platform and per-post insights backed by each provider's native analytics" href="/docs/apis-analytics" />
<LinkCard title="Notifications APIs" description="Paginated in-app notification history scoped to your workspace" href="/docs/apis-notifications" />
<LinkCard title="Uploads APIs" description="Upload media that you attach to scheduled posts" href="/docs/apis-uploads" />
<LinkCard title="CLI" description="Same public API surface, available as openquok auth/posts/integrations commands" href="/docs/getting-started-for-cli" />
</CardGrid>

