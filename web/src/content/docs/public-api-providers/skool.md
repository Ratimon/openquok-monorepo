---
title: Skool Settings
description: OpenQuok public API provider settings for Skool — title, group, optional label, images, and follow-up comments via browser-extension connect.
order: 12
lastUpdated: 2026-10-09
sidebar:
  label: Skool Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="skool" variant="default" /> |
| Connect | Dashboard + OpenQuok browser extension — <Badge text="GET /api/v1/public/social/skool" variant="path" /> returns <strong>400</strong> |
| Setup guide | <a href="/docs/social-integration/skool">Skool</a> |
| Body cap | **5,000** characters on top-level <Badge text="body" variant="param" /> |
| Main-post media | Optional images — upload via API first; native Skool video is not published |

<Callout type="note">
<p>Connect Skool in the dashboard while signed in on <strong>skool.com</strong> in the same Chrome profile as the extension. Required publish fields <Badge text="title" variant="param" /> and <Badge text="group" variant="param" /> live in <Badge text="providerSettingsByIntegrationId" variant="param" /> for the Skool channel UUID.</p>
</Callout>

## Settings on create post

Flat keys and the <Badge text="skool" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="title" variant="param" /> | <Badge text="skool.title" variant="param" /> | Post title (**required**, min 1 character) |
| <Badge text="group" variant="param" /> | <Badge text="skool.group" variant="param" /> | Skool group id (**required**) — from <Badge text="groups" variant="default" /> tool |
| <Badge text="group_id" variant="param" /> / <Badge text="groupId" variant="param" /> | — | Aliases for <Badge text="group" variant="param" /> |
| <Badge text="label" variant="param" /> | <Badge text="skool.label" variant="param" /> | Optional label id — from <Badge text="label" variant="default" /> tool |
| — | <Badge text="skool.replies" variant="param" /> | Follow-up comments after the main post publishes |

List groups and labels with <a href="/docs/apis-integrations/integration-trigger">Trigger integration tool</a> methods <Badge text="groups" variant="default" /> and <Badge text="label" variant="default" /> (pass <Badge text="id" variant="param" /> = group id for labels).

```json
{
  "providerSettingsByIntegrationId": {
    "<skool-integration-id>": {
      "title": "Week 12 — community update",
      "group": "<group-id-from-groups-tool>",
      "label": "<optional-label-id>"
    }
  }
}
```

## Follow-up comments

Nest scheduled comments under <Badge text="skool.replies" variant="param" /> on the publishing Skool UUID:

```json
{
  "providerSettingsByIntegrationId": {
    "<skool-integration-id>": {
      "skool": {
        "title": "Launch thread",
        "group": "<group-id>",
        "replies": [
          {
            "id": "reply-1",
            "message": "Details in this comment.",
            "delaySeconds": 300,
            "media": [{ "id": "<media-id>", "path": "FILE_PATH_FROM_UPLOAD" }]
          }
        ]
      }
    }
  }
}
```

Each reply row uses <Badge text="delaySeconds" variant="param" /> relative to the previous step. Optional <Badge text="media" variant="param" /> on a reply requires a prior <Badge text="POST /api/v1/public/upload" variant="path" /> (or upload-from-url) entry.

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="title" variant="param" /> / <Badge text="skool.title" variant="param" /> | string | **Yes** | Minimum **1** character |
| <Badge text="group" variant="param" /> / <Badge text="skool.group" variant="param" /> | string | **Yes** | Group id from <Badge text="groups" variant="default" /> trigger |
| <Badge text="label" variant="param" /> / <Badge text="skool.label" variant="param" /> | string | No | Omit or use <Badge text="none" variant="param" /> for default |
| <Badge text="skool.replies" variant="param" /> | array | No | Follow-up comments when the group allows |

Run <Badge text="GET /api/v1/public/integrations/:id/settings" variant="path" /> (or <Badge text="openquok integrations:settings" variant="default" />) for the typed <Badge text="settingsSchema" variant="param" /> Skool exposes.

## Complete example

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Weekly update for the group — queue from the API after extension connect.",
    "scheduledAt": "2026-05-15T12:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<skool-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<skool-integration-id>": {
        "title": "Week 12 shipping notes",
        "group": "<group-id>"
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog — extension vs OAuth channels" href="/docs/public-api-providers" />
<LinkCard title="Skool CLI examples" description="openquok recipes for groups, labels, and follow-ups" href="/docs/cli-examples/skool" />
<LinkCard title="Skool setup" description="Browser extension connect" href="/docs/social-integration/skool" />
<LinkCard title="Trigger integration tool" description="List groups and labels before publishing" href="/docs/apis-integrations/integration-trigger" />
<LinkCard title="Threads and comments" description="Follow-up comment model across channels" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media rules" description="Caption and attachment constraints" href="/docs/platforms/media-rules" />
</CardGrid>
