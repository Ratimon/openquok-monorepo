---
title: Overview - Posts APIs
description: Programmatic endpoints for scheduling, listing, flipping draft ↔ scheduled, and deleting posts using a workspace programmatic token.
order: 0
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List Posts" description="Return calendar rows in an ISO date window, optionally filtered by channel UUID" href="/docs/apis-posts/list" />
<LinkCard title="Create Post" description="Create a draft or scheduled post group with one row per selected channel" href="/docs/apis-posts/create" />
<LinkCard title="Find Slot" description="Suggest the next free posting slot for the workspace (or one specific channel)" href="/docs/apis-posts/find-slot" />
<LinkCard title="Flip post status" description="Flip draft ↔ scheduled for the group that a list row belongs to, without changing the stored publish time" href="/docs/apis-posts/flip-status" />
<LinkCard title="Get Post (row summary)" description="Resolve a list row UUID to its parent postGroup id" href="/docs/apis-posts/get-post" />
<LinkCard title="Delete Post" description="Delete a single post by row id (soft-deletes the whole post group it belongs to)" href="/docs/apis-posts/delete" />
<LinkCard title="Missing Content" description="List provider-side candidate ids when the worker could not link a published row" href="/docs/apis-posts/missing" />
<LinkCard title="Update Release ID" description="Manually link a post row to a provider-native id when worker auto-link failed" href="/docs/apis-posts/release-id" />
<LinkCard title="Update Review Todo" description="Set kanban review note and mark reviewed" href="/docs/apis-posts/review-todo" />
</CardGrid>

<Callout type="note" title="Terminology">
<p>A <strong>post group</strong> is the multi-channel composition the workspace UI calls a <em>post</em>. The group's UUID is returned by <Badge text="POST /public/posts" variant="default" /> as <code>postGroup</code> and appears on each calendar row from <Badge text="GET /public/posts/list" variant="default" />. Full edit-mode read/update/delete for a group over HTTP is <strong>session-only</strong> (<Badge text="/posts/group/{postGroup}" variant="path" /> with a user token). A programmatic token can create groups, list rows, flip status with <Badge text="PUT /public/posts/{postId}/status" variant="default" />, and delete by row id.</p>
</Callout>

## Typical flow

1. <strong>Pick channels</strong> — call <Badge text="GET /public/integrations" variant="default" /> to list connected channels, then collect the UUIDs you want to publish to.
2. <strong>(Optional) Attach media</strong> — upload each asset via <Badge text="POST /public/upload" variant="default" /> and keep the returned <code>id</code> + <code>path</code>.
3. <strong>Create</strong> — call <Badge text="POST /public/posts" variant="default" /> with the canonical <code>body</code>, any per-channel <code>bodiesByIntegrationId</code> overrides, the media references, <code>scheduledAt</code>, and <code>status</code> (<code>draft</code> or <code>scheduled</code>). For agent/approval flows, set <Badge text="isAgent" variant="param" /> and optional <Badge text="note" variant="param" /> (kanban review checklist). The response includes the new <code>postGroup</code> UUID.
4. <strong>Iterate</strong> — use the workspace composer or authenticated session APIs to change channels, copy, media, or reschedule. Use <Badge text={"PUT /public/posts/{postId}/status"} variant="default" /> with a row id when you only need to flip <code>draft</code> ↔ <code>scheduled</code> at the same stored time.
5. <strong>Remove</strong> — call <Badge text={"DELETE /public/posts/{postId}"} variant="default" /> with any row id from the group to soft-delete the whole group; already-published rows remain on the social provider.

## Rate limits

<Callout type="warning" title="One call per group">
<p>The <strong>30 requests per hour</strong> cap (shared across the public API) counts each request individually. Schedule a multi-channel group in a single <Badge text="POST /public/posts" variant="default" /> call instead of looping per channel to maximize throughput.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Integrations APIs" description="Connect, list, delete, and inspect the channels referenced in `integrationIds`" href="/docs/apis-integrations" />
<LinkCard title="Uploads APIs" description="Upload media that you pass back as `media[]` when creating a post group" href="/docs/apis-uploads" />
<LinkCard title="Analytics APIs" description="Per-post analytics for the rows returned by List Posts" href="/docs/apis-analytics" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>
