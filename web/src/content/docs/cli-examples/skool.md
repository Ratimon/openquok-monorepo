---
title: Skool
description: OpenQuok CLI examples for Skool — title, group, label, images, and follow-up comments after browser-extension connect.
order: 12
lastUpdated: 2026-10-09
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="skool" variant="default" /> |
| Max body length | 5,000 characters (<Badge text="-c" variant="param" /> caption) |
| Required settings | <strong>Title</strong> and <strong>Group</strong> (group id) |
| Connect | Dashboard + browser extension (not <Badge text="GET /public/social/skool" variant="path" />) |
| Setup guide | <a href="/docs/social-integration/skool">Skool</a> |

```bash
SKOOL_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="skool") | .id')
```

Connect the channel in the workspace first with the <a href="/docs/installation/chrome-extension">OpenQuok browser extension</a> while signed in on skool.com. The CLI cannot start Skool connect.

<Callout type="warning">
<p>Agents and headless scripts can schedule posts only <strong>after</strong> a human completes extension connect in the dashboard.</p>
</Callout>

## Resolve group and label ids

```bash
openquok integrations:settings "$SKOOL_ID"
openquok integrations:trigger "$SKOOL_ID" groups
openquok integrations:trigger "$SKOOL_ID" label -d '{"id":"<group-id>"}'
```

Use the <Badge text="value" variant="param" /> field from <Badge text="groups" variant="default" /> as <Badge text="group" variant="param" /> in settings.

## Post with title and group

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Weekly community update for the group feed." \
  -i "$SKOOL_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$SKOOL_ID" --arg group "<group-id>" '
    { ($id): { skool: { title: "Week 12 — shipping notes", group: $group } } }
  ')"
```

## Optional label

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Announcement with a label filter." \
  -i "$SKOOL_ID" \
  --settings '{"title":"Office hours Friday","group":"<group-id>","label":"<label-id>"}'
```

## Post with images

Upload first, then attach media on the main post:

```bash
MEDIA=$(openquok upload ./graphic.png | jq -c '[.data | {id, path: (.path // .filePath)}]')

openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Resource drop with a cover image." \
  -i "$SKOOL_ID" \
  -m "$MEDIA" \
  --settings '{"title":"New resource","group":"<group-id>"}'
```

## Follow-up comments

Schedule threaded comments with <Badge text="skool.replies" variant="param" />:

```bash
openquok posts:create --json ./examples/skool-follow-up.json
```

Copy the skill example from <Badge text="openquok-core" variant="default" /> after install: <Badge text="resources/examples/skool-follow-up.json" variant="path" />.

## JSON examples

| File | Scenario |
| --- | --- |
| `skool-text-title-group.json` | Title + group in nested `skool` bucket |
| `skool-with-label.json` | Flat title, group, and label |
| `skool-with-image.json` | Main post with `media[]` |
| `skool-follow-up.json` | `skool.replies` follow-up comments |

## Related

<CardGrid>
<LinkCard title="Skool setup" description="Extension connect and session refresh" href="/docs/social-integration/skool" />
<LinkCard title="Skool provider settings" description="Public API field reference" href="/docs/public-api-providers/skool" />
<LinkCard title="CLI examples index" description="All channel recipes" href="/docs/cli-examples" />
<LinkCard title="openquok-core skill" description="Agent skill with Skool agent tasks table" href="/docs/getting-started-for-cli" />
</CardGrid>
