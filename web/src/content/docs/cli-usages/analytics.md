---
title: Analytics
description: View platform-level and per-post analytics from the Openquok CLI over a 7, 30, or 90 day window.
order: 3
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

`analytics:*` wraps the <a href="/docs/apis-analytics">Analytics APIs</a>. Two commands cover the supported windows:

- <Badge text="analytics:platform" variant="default" /> — channel-level metrics (followers, impressions, engagement, …).
- <Badge text="analytics:post" variant="default" /> — per-post metrics (likes, comments, shares, …) for a **published** post.

<Callout type="note" title="Allowed windows">
<p>The backend rejects anything outside <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and <Badge text="90" variant="param" />. The CLI validates this client-side so you get a clear error instead of a generic HTTP 400.</p>
</Callout>

## Platform analytics

```bash
openquok analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b
openquok analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b --days 30
openquok analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b -d 90
```

| Flag | Description |
| --- | --- |
| <code>&lt;id&gt;</code> (positional) | Integration channel UUID from <a href="/docs/cli-usages/integrations">`openquok integrations:list`</a>. |
| <Badge text="--days" variant="param" /> (alias <Badge text="-d" variant="param" />) | Look-back window. One of <code>7</code> (default), <code>30</code>, or <code>90</code>. |

The response is an array of metric series, each with daily data points and a `percentageChange` summary:

```json
[
  {
    "label": "Followers",
    "data": [
      { "total": "1250", "date": "2026-05-01" },
      { "total": "1280", "date": "2026-05-02" }
    ],
    "percentageChange": 2.4
  },
  {
    "label": "Impressions",
    "data": [
      { "total": "5000", "date": "2026-05-01" },
      { "total": "5200", "date": "2026-05-02" }
    ],
    "percentageChange": 4.0
  }
]
```

<Callout type="tip" title="Metrics vary by provider">
<p>Meta Threads exposes followers, views, likes, replies, reposts, and quotes; Instagram exposes followers, impressions, reach, profile views, and website clicks. Fetch <code>integrations:settings</code> first if you need the canonical metric list for a provider.</p>
</Callout>

### Scripting examples

Extract just the followers series:

```bash
openquok analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b -d 30 \
  | jq '.[] | select(.label=="Followers")'
```

Show only the percentage change for every metric:

```bash
openquok analytics:platform 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b \
  | jq '.[] | {label, percentageChange}'
```

Compare two channels side-by-side:

```bash
for ID in "$THREADS_ID" "$INSTAGRAM_ID"; do
  echo "=== $ID ==="
  openquok analytics:platform "$ID" -d 30 \
    | jq '.[] | {label, percentageChange}'
done
```

## Post analytics

```bash
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d --days 30
```

| Flag | Description |
| --- | --- |
| <code>&lt;id&gt;</code> (positional) | Post row UUID (from <a href="/docs/cli-usages/managing-posts">`openquok posts:list`</a>). |
| <Badge text="--days" variant="param" /> (alias <Badge text="-d" variant="param" />) | Look-back window. One of <code>7</code> (default), <code>30</code>, or <code>90</code>. |

Response shape mirrors `analytics:platform`. Common metrics:

```json
[
  {
    "label": "Likes",
    "data": [
      { "total": "150", "date": "2026-05-01" },
      { "total": "175", "date": "2026-05-02" }
    ],
    "percentageChange": 16.7
  },
  {
    "label": "Comments",
    "data": [
      { "total": "25", "date": "2026-05-01" },
      { "total": "30", "date": "2026-05-02" }
    ],
    "percentageChange": 20.0
  }
]
```

<Callout type="warning" title="Drafts and queued posts return an empty array">
<p>Per-post analytics are only available for posts that have been published. Drafts, queued rows, and rows whose <code>release_id</code> is still <Badge text="missing" variant="default" /> all resolve to <code>[]</code>. Reconnect missing rows with <a href="/docs/cli-usages/managing-posts">`openquok posts:connect`</a> to unlock analytics.</p>
</Callout>

### Scripting examples

Get just the latest total for each metric:

```bash
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 30 \
  | jq '.[] | {label, latest: .data[-1].total}'
```

Diff a row's metrics before and after a campaign:

```bash
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 7  > before.json
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 30 > after.json
jq -s '
  [.[0], .[1]]
  | map([.[] | {label, total: (.data[-1].total | tonumber)}])
  | { before: .[0], after: .[1] }
' before.json after.json
```

## Related

<CardGrid>
<LinkCard title="Managing Posts" description="Use `posts:connect` to unlock per-post analytics for `missing` rows" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Integrations" description="Discover channel UUIDs that feed `analytics:platform`" href="/docs/cli-usages/integrations" />
<LinkCard title="Analytics APIs" description="Underlying REST endpoints used by every `analytics:*` command" href="/docs/apis-analytics" />
</CardGrid>
