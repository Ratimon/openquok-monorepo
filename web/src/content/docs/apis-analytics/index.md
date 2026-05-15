---
title: Overview - Analytics APIs
description: Programmatic analytics for connected channels and individual posts. Backed by each provider's native insights API, cached server-side by `(integrationId|postId, date)`.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="Platform Analytics" description="Platform-native time-series metrics (followers, impressions, etc.) for one connected channel" href="/docs/apis-analytics/platform" />
<LinkCard title="Post Analytics" description="Per-post insights for a published row" href="/docs/apis-analytics/post" />
</CardGrid>

<Callout type="note" title="Date window">
<p>Both endpoints take a required <Badge text="date" variant="default" /> query parameter accepting <Badge text="7" variant="default" />, <Badge text="30" variant="default" />, or <Badge text="90" variant="default" /> days. Responses are cached server-side; consecutive calls for the same window are fast.</p>
</Callout>

## Missing-link flow

When `GET /public/analytics/post/{postId}` returns `{ "data": { "missing": true } }`, the scheduled-publish worker could not map the OpenQuok row to a live provider object. Recover by:

1. Calling `GET /public/posts/{postId}/missing` to fetch candidate ids and preview URLs from the provider.
2. Identifying the one that matches your post.
3. Calling `PUT /public/posts/{postId}/release-id` variant="default" /> with the chosen id.
4. Re-running the analytics query — subsequent calls return the metric series instead of `missing`.

## Related Section(s)

<CardGrid>
<LinkCard title="Posts APIs" description="List, create, and manage the post rows referenced by `postId`" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="List and manage the connected channels referenced by `integrationId`" href="/docs/apis-integrations" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>
