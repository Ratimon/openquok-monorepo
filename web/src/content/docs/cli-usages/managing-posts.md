---
title: Managing Posts
description: Create, list, delete, and reconnect Openquok posts from the command line.
order: 1
lastUpdated: 2026-05-14
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The `posts:*` commands wrap the <a href="/docs/apis-posts">Posts APIs</a>. They drive every step of the publishing lifecycle: pick channels and a schedule time, create a post group, iterate on it, then delete it or reconnect it to its provider-native id once it is published.

<Callout type="note" title="Post groups vs. post rows">
<p>A <strong>post group</strong> is the multi-channel composition the UI calls a post; <Badge text="posts:group" variant="default" /> and <Badge text="posts:update-group" variant="default" /> operate on the group UUID returned by <Badge text="posts:create" variant="default" />. A <strong>post row</strong> is one channel inside that group (<Badge text="posts:delete" variant="default" />, <Badge text="posts:missing" variant="default" />, <Badge text="posts:connect" variant="default" /> use the row UUID from <Badge text="posts:list" variant="default" />).</p>
</Callout>

## Create a post

The simplest case: one channel, one body, one scheduled timestamp.

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T12:00:00Z" \
  --status scheduled \
  --body "Hello from Openquok" \
  --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"
```

| Flag | Description |
| --- | --- |
| <Badge text="--scheduledAt" variant="default" /> | ISO-8601 timestamp (required). |
| <Badge text="--status" variant="default" /> | <code>scheduled</code> (default) enqueues for publishing; <code>draft</code> persists without enqueuing. |
| <Badge text="--body" variant="default" /> | Default body used unless <code>bodiesByIntegrationId</code> overrides it. |
| <Badge text="--integrationIds" variant="default" /> | Comma-separated channel UUIDs. |
| <Badge text="--media" variant="default" /> | JSON array of items with <code>id</code> and <code>path</code> fields returned by <a href="/docs/cli-usages/media-upload">`openquok upload`</a>. |
| <Badge text="--bodiesByIntegrationId" variant="default" /> | JSON object keyed by integration UUID; each value is the per-channel body override. |
| <Badge text="--providerSettingsByIntegrationId" variant="default" /> | JSON map of provider-specific settings (see <a href="/docs/cli-examples">CLI Examples</a>). |
| <Badge text="--tagNames" variant="default" /> | Comma-separated workspace tag names. |
| <Badge text="--repeatInterval" variant="default" /> | Backend repeat enum (e.g. <code>weekly</code>). |

### Draft instead of scheduling

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T12:00:00Z" \
  --status draft \
  --body "Review before publishing" \
  --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"
```

### Post for Different body per channel

Pass `--bodiesByIntegrationId` to customize each row; the canonical `--body` becomes a fallback:

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T12:00:00Z" \
  --integrationIds "uuid-threads,uuid-instagram" \
  --body "Fallback body" \
  --bodiesByIntegrationId '{"uuid-threads":"Threads-only caption","uuid-instagram":"Instagram-only caption #photography"}'
```

### Post and Attach media

Upload the asset first (returns `data.id` and `data.path`), then pass them back as JSON:

```bash
MEDIA=$(openquok upload ./photo.jpg | jq -c '{id: .data.id, path: .data.filePath}')

openquok posts:create \
  --scheduledAt "2026-01-15T12:00:00Z" \
  --body "Check this out!" \
  --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b" \
  --media "[${MEDIA}]"
```

<Callout type="warning" title="Per-platform media rules">
<p>Instagram requires at least one attachment for <code>scheduled</code> posts; Threads accepts text-only. Each provider has its own per-call validation — surface them up-front with <a href="/docs/cli-usages/integrations">`openquok integrations:settings`</a> before you script a batch.</p>
</Callout>

## List posts


```bash
openquok posts:list
```

### List posts (Filter by Date Range)

Override the window with explicit ISO timestamps:

```bash
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z"
```

<Callout type="note" title="Defaults live in the CLI, not the API">
<p><Badge text="GET /public/posts/list" variant="default" /> requires <code>start</code> and <code>end</code>. The CLI fills omitted flags with ±30 local calendar days from today (ISO UTC on the wire). Optional <code>customerGroupId</code> narrows by channel group. SDK and raw HTTP clients must send both dates; see <a href="/docs/apis-posts/list">List Posts</a>.</p>
</Callout>


Filter to specific channels by passing a comma-separated list of integration UUIDs:

```bash
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z" \
  --integrationIds "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b,9c0d1e2f-3a4b-5c6d-7e8f-901a2b3c4d5e"
```

### List posts (Filter by customer group)

Use the channel-group UUID from your workspace (row id in <code>integration_customers</code>; assign integrations to groups in the dashboard). The CLI sends it as the <code>customerGroupId</code> query parameter on <Badge text="GET /public/posts/list" variant="default" />.

```bash
openquok posts:list --customerGroupId "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"
```

You can combine <code>--customerGroupId</code> with <code>--integrationIds</code>: only integrations that belong to **both** the group and the CSV are queried.

To find post rows whose provider id could not be mapped yet (database column <code>release_id</code> is the string <code>missing</code>; JSON responses use <code>releaseId</code>), see <a href="#connecting-missing-posts">Connecting missing posts</a>.

## Connecting missing posts

Some platforms do not return a stable published asset id right away. The worker then stores <code>release_id = 'missing'</code> on the row; the list API exposes that as <code>releaseId: "missing"</code> (camelCase). Per-post analytics stay blocked until you link the row to the real provider id.

<Callout type="note" title="When `posts:missing` returns nothing">
<p>The backend only calls a provider-specific enumerator when the integration implements the optional <code>missing</code> hook and the row still has <code>release_id === "missing"</code>. Otherwise the list-missing endpoint returns <code>data.items: []</code>. See <a href="/docs/apis-posts/missing">Get missing content</a>.</p>
</Callout>

### List available content

```bash
openquok posts:missing <post-row-uuid>
```

The CLI prints the API envelope, for example:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "7321456789012345678", "url": "https://example.com/preview-cover.jpeg" },
      { "id": "7321456789012345679", "url": "https://example.com/preview-cover-2.jpeg" }
    ]
  }
}
```

Narrow to id and preview URL:

```bash
openquok posts:missing <post-row-uuid> | jq '.data.items[] | {id, url}'
```

### Connect a post

After you pick the matching provider id from the list above:

```bash
openquok posts:connect <post-row-uuid> --releaseId "7321456789012345678"
```

<p>That maps to <Badge text="Connect post release id" variant="default" /> in the public API. Send a JSON body with a single string field named <code>releaseId</code> (same value you pass to <code>--releaseId</code>). The service only accepts the update while the row is still in the missing state (see <code>updateReleaseIdIfMissing</code> in the backend). Details are in <a href="/docs/apis-posts/release-id">Update release ID</a>.</p>

### Full workflow

```bash
# 1. Find post rows that still need a release id (unwrap data.posts from the list response)
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z" \
  | jq '.data.posts[] | select(.releaseId == "missing") | {id, content, integrationId}'

# 2. Ask the provider for recent candidates (replace POST_ROW_UUID)
openquok posts:missing POST_ROW_UUID | jq '.data.items'

# 3. Link the correct provider id
openquok posts:connect POST_ROW_UUID --releaseId "7321456789012345678"

# 4. Confirm per-post analytics resolve (pick a window the CLI accepts)
openquok analytics:post POST_ROW_UUID --days 7
```

## Fetch, update, and delete a post group

```bash
openquok posts:group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d
```

Update accepts the same JSON shape as `posts:create` (minus `organizationId`). Use it to **reschedule**, **flip draft &harr; scheduled**, or **swap the channel list**:

```bash
openquok posts:update-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d \
  --json '{"scheduledAt":"2026-02-15T09:00:00Z","status":"scheduled"}'
```

```bash
openquok posts:update-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d \
  --json '{"status":"draft"}'
```

Delete the whole group:

```bash
openquok posts:delete-group 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d
```

Delete a single row (also soft-deletes its group — a post never publishes in isolation):

```bash
openquok posts:delete 5b6c7d8e-9f01-2a3b-4c5d-6e7f8a9b0c1d
```


## End-to-end workflow

```bash
INTEGRATION_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')

MEDIA=$(openquok upload ./hero.png | jq -c '{id: .data.id, path: .data.filePath}')

GROUP=$(openquok posts:create \
  --scheduledAt "2026-01-20T15:00:00Z" \
  --status scheduled \
  --body "Scheduled with media" \
  --integrationIds "$INTEGRATION_ID" \
  --media "[${MEDIA}]" \
  | jq -r '.postGroup')

openquok posts:group "$GROUP"
```

## Related

<CardGrid>
<LinkCard title="Integrations" description="Discover channel UUIDs, max post lengths, and tools that build the `--settings` payload" href="/docs/cli-usages/integrations" />
<LinkCard title="Media Upload" description="Produce the `data.id` and `data.filePath` you pass to `--media`" href="/docs/cli-usages/media-upload" />
<LinkCard title="Analytics" description="Per-post analytics once a `release_id` is linked" href="/docs/cli-usages/analytics" />
<LinkCard title="Posts APIs" description="Underlying REST endpoints used by every `posts:*` command" href="/docs/apis-posts" />
</CardGrid>
