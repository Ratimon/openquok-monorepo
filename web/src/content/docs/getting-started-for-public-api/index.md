---
title: Overview - Public API
description: Getting started to automate your Social Scheduling with Openquok 's public api.
order: 0
lastUpdated: 2026-05-11
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Start Integrating

<Badge text="@openquok/node-sdk" variant="experimental" /> is a small, typed Node.js wrapper around Openquok's programmatic API (<Badge text="/api/v1/public" variant="default" />). Use it to schedule posts, manage post groups, upload media, and inspect connected channels from any Node.js script or backend.

<Callout type="note" title="Authentication">
<p>Pass an organization <strong>API key</strong> (or OAuth app token) as the first argument to the <code>Openquok</code> constructor — it is sent as the <Badge text="Authorization" variant="default" /> header on every request.
</Callout>

### Installation

```bash
npm install @openquok/node-sdk
```

### Quick guide

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
<LinkCard title="Integrations APIs" description="Programmatic endpoints for connecting channels and triggering provider tools — what the SDK wraps" href="/docs/apis-integrations" />
<LinkCard title="CLI" description="Same public API surface, available as openquok auth/posts/integrations commands" href="/docs/getting-started-for-cli" />
</CardGrid>

