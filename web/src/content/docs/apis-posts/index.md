---
title: Overview - Posts APIs
description: Programmatic endpoints for scheduling, listing, updating, and deleting post groups using the organization API key.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List Posts" description="Return calendar rows in an ISO date window, optionally filtered by channel UUID" href="/docs/apis-posts/list" />
<LinkCard title="Create Post" description="Create a draft or scheduled post group with one row per selected channel" href="/docs/apis-posts/create" />
<LinkCard title="Get Post Group" description="Fetch the edit-mode payload for a post group (body, per-channel overrides, media, provider settings)" href="/docs/apis-posts/get-group" />
<LinkCard title="Update Post Group" description="Atomically replace the rows in a post group — add/remove channels, change schedule, edit content" href="/docs/apis-posts/update-group" />
<LinkCard title="Delete Post Group" description="Soft-delete every row in a post group so it stops publishing and disappears from List Posts" href="/docs/apis-posts/delete-group" />
</CardGrid>

<Callout type="note" title="Terminology">
<p>A <strong>post group</strong> is the multi-channel composition the workspace UI calls a <em>post</em>. The group's UUID is returned by <Badge text="POST /public/posts" variant="default" /> and is the key used by every other <Badge text="/public/posts/group/{postGroup}" variant="path" /> route.</p>
</Callout>

## Typical flow

1. <strong>Pick channels</strong> — call <Badge text="GET /public/integrations" variant="default" /> to list connected channels, then collect the UUIDs you want to publish to.
2. <strong>(Optional) Attach media</strong> — upload each asset via <Badge text="POST /public/upload" variant="default" /> and keep the returned <code>id</code> + <code>path</code>.
3. <strong>Create</strong> — call <Badge text="POST /public/posts" variant="default" /> with the canonical <code>body</code>, any per-channel <code>bodiesByIntegrationId</code> overrides, the media references, <code>scheduledAt</code>, and <code>status</code> (<code>draft</code> or <code>scheduled</code>). The response includes the new <code>postGroup</code> UUID.
4. <strong>Iterate</strong> — re-fetch with <Badge text={"GET /public/posts/group/{postGroup}"} variant="default" />, then call <Badge text={"PUT /public/posts/group/{postGroup}"} variant="default" /> with the full desired state to update the schedule, channels, or content.
5. <strong>Remove</strong> — call <Badge text={"DELETE /public/posts/group/{postGroup}"} variant="default" /> to soft-delete the group; already-published rows remain on the social provider.

## Rate limits

<Callout type="warning" title="One call per group">
<p>The <strong>30 requests per hour</strong> cap (shared across the public API) counts each request individually. Schedule a multi-channel group in a single <Badge text="POST /public/posts" variant="default" /> call instead of looping per channel to maximize throughput.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Integrations APIs" description="Connect, list, delete, and inspect the channels referenced in `integrationIds`" href="/docs/apis-integrations" />
<LinkCard title="Uploads APIs" description="Upload media that you pass back as `media[]` when creating or updating a post group" href="/docs/apis-uploads" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>
