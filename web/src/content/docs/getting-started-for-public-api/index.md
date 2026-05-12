---
title: Overview - Public API
description: Getting started to automate your Social Scheduling with Openquok 's public api.
order: 0
lastUpdated: 2026-05-11
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Authentication

There are two ways to authenticate with the Openquok public API. In both cases the token is sent in the <Badge text="Authorization" variant="default" /> header and currently uses the <Badge text="opo_" variant="default" /> prefix.

### API key

Get your workspace API key from <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />, then reveal and copy it from the **API Key** panel. Send it on every request:

```bash
curl -H "Authorization: opo_your_api_key" https://api.openquok.com/api/v1/public/integrations
```

API keys belong to a **workspace (organization)** and act with that workspace's permissions. We may rotate from the same panel ounce in a while.

### OAuth2 access token

If you are building an app for other Openquok users, use the <a href="/docs/developer-guidelines/oauth2-authentication">OAuth2 Authorization Code flow</a> to obtain tokens that act on behalf of users. The returned <Badge text="access_token" variant="default" /> is sent the same way as an API key:

```bash
curl -H "Authorization: opo_your_oauth_token" https://api.openquok.com/api/v1/public/integrations
```

OAuth tokens are scoped to the **organization the user authorized** — not to the developer who built the app — so the same endpoint returns different data depending on which token is used.

## Base URL

| Environment | Base URL |
| --- | --- |
| Openquok Cloud | <Badge text="https://api.openquok.com/api/v1/public" variant="new" /> |
| Self-hosted | Your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin + <Badge text="/api/v1/public" variant="path" /> |

The path prefix <Badge text="/api/v1" variant="path" /> is configurable via <Badge text="API_PREFIX" variant="envBackend" />.

## Rate limits

<Callout type="warning" title="30 requests per hour">
<p>A <strong>30 requests per hour</strong> limit applies to all endpoints. This does not mean you can only post 30 times per hour — each API call counts as one request, so <strong>schedule multiple posts in a single request</strong> (for example a multi-channel post group) to maximize throughput.</p>
</Callout>

## Supported social channels

Openquok currently ships with **3 social provider integrations**: **Meta Threads** and **Instagram** in two flavors (Business and Standalone). Each connected channel goes through the same <Badge text="POST /api/v1/public/posts" variant="default" /> endpoint — provider-specific tuning lives under <code>providerSettingsByIntegrationId</code> keyed by the channel's UUID.

For per-channel settings, and copy-paste API examples — plus the **channel vs integration** terminology used across the dashboard and API — see the dedicated <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> page.

<CardGrid>
<LinkCard title="Supported social channels" description="Provider identifiers, per-channel settings (Threads, Instagram), and curl/JSON examples for each platform we ship today" href="/docs/getting-started-for-public-api/supported-social-channels" />
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

<Callout type="note" title="Authentication">
<p>Pass an organization <strong>API key</strong> (or OAuth app token) as the first argument to the <code>Openquok</code> constructor — it is sent as the <Badge text="Authorization" variant="default" /> header on every request.
</Callout>

```ts
import Openquok from '@openquok/node-sdk';

const openquok = new Openquok('YOUR_API_KEY', {
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

For the full method list (`upload`, `post`, `postList`, `getPostGroup`, `updatePostGroup`, `deletePostGroup`, `integrations`, `deleteIntegrationChannel`), see the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/README.md">SDK README</DocsExternalLink>.

### References

<CardGrid>
<LinkCard title="NodeJs SDK" description="Official NodeJs SDK" href="https://www.npmjs.com/package/@openquok/node-sdk" />
</CardGrid>


## Related Section(s)

<CardGrid>
<LinkCard title="Supported social channels" description="Per-provider settings and copy-paste API examples for Threads and Instagram" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="Integrations APIs" description="Programmatic endpoints for connecting channels and triggering provider tools — what the SDK wraps" href="/docs/apis-integrations" />
<LinkCard title="Posts APIs" description="Schedule, list, update, and delete post groups against your connected channels" href="/docs/apis-posts" />
<LinkCard title="Uploads APIs" description="Upload media that you attach to scheduled posts" href="/docs/apis-uploads" />
<LinkCard title="CLI" description="Same public API surface, available as openquok auth/posts/integrations commands" href="/docs/getting-started-for-cli" />
</CardGrid>

