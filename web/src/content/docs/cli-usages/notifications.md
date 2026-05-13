---
title: Notifications
description: List paginated in-app notifications for the workspace from the Openquok CLI.
order: 4
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

`notifications:list` wraps the <a href="/docs/apis-notifications">Notifications APIs</a>. It returns paginated in-app notification history for the workspace tied to the current API key (100 entries per page, zero-based `--page` index).

```bash
openquok notifications:list
openquok notifications:list --page 1
openquok notifications:list --page 2
```

| Flag | Description |
| --- | --- |
| <Badge text="--page" variant="param" /> | Zero-based page index. Defaults to <code>0</code> (most recent 100 entries). |

## Response shape

```json
{
  "page": 0,
  "pageSize": 100,
  "total": 247,
  "notifications": [
    {
      "id": "f6e5d4c3-b2a1-9087-7665-544433221100",
      "created_at": "2026-05-12T19:31:47.221Z",
      "content": "Threads channel @openquok was disconnected by the provider.",
      "link": "/integrations/4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b"
    }
  ]
}
```

The `link` field is an optional in-app deep link (relative to the web origin), or `null` for unlinked entries.

## Scripting examples

Show a flat timeline:

```bash
openquok notifications:list \
  | jq '.notifications[] | {created_at, content}'
```

Walk every page until the list is exhausted:

```bash
PAGE=0
while :; do
  CHUNK=$(openquok notifications:list --page "$PAGE")
  COUNT=$(echo "$CHUNK" | jq '.notifications | length')
  [ "$COUNT" -eq 0 ] && break
  echo "$CHUNK" | jq '.notifications[] | {created_at, content}'
  PAGE=$((PAGE + 1))
done
```

Count outstanding notifications since a timestamp:

```bash
SINCE="2026-05-01T00:00:00Z"
openquok notifications:list \
  | jq --arg since "$SINCE" '
    .notifications
    | map(select(.created_at > $since))
    | length
  '
```

<Callout type="note" title="Read state lives in the web app">
<p>Notifications listed via the CLI are <strong>not</strong> marked as read. Use the web UI to acknowledge entries; the CLI is intentionally read-only so you can mirror the history into external dashboards or SIEM pipelines without mutating workspace state.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Integrations" description="Most notifications reference an integration UUID you can resolve with `integrations:list`" href="/docs/cli-usages/integrations" />
<LinkCard title="Notifications APIs" description="Underlying REST endpoint used by `notifications:list`" href="/docs/apis-notifications" />
</CardGrid>
