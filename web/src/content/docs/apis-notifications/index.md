---
title: Overview - Notifications APIs
description: 'GET /public/notifications — paginated in-app history for the API key workspace (100 rows per page). Does not advance the user read cursor.'
order: 0
lastUpdated: 2026-09-29
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List Notifications" description="Paginated batch of 100 in-app notifications, newest first" href="/docs/apis-notifications/list" />
</CardGrid>

<Callout type="note" title="Read cursor">
<p>Unlike <Badge text="GET /api/v1/notifications/list" variant="path" /> (used by the session UI), this endpoint does <strong>not</strong> advance the signed-in user&apos;s &quot;last read&quot; cursor. Calling it is safe from background scripts that should not touch read state.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Posts APIs" description="Posts that may trigger publish-event notifications" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="Channels whose token expirations / disconnect events are surfaced as notifications" href="/docs/apis-integrations" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>
