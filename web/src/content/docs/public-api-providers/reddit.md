---
title: Reddit Settings
description: OpenQuok public API provider settings for Reddit — markdown body, optional subreddit and title, media for handoff; manual dashboard connect and awaiting-member due state.
order: 13
lastUpdated: 2026-10-28
sidebar:
  label: Reddit Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="reddit" variant="default" /> |
| Connect | Dashboard manual channel — <Badge text="GET /api/v1/public/social/reddit" variant="path" /> returns <strong>400</strong> |
| Setup guide | <a href="/docs/social-integration/reddit">Reddit</a> |
| Body cap | **10,000** characters (markdown on top-level <Badge text="body" variant="param" />) |
| Publish | **No server publish** — due rows move to <strong>awaiting member</strong>; you submit on reddit.com |
| Main-post media | Optional images via upload — stored for extension handoff download; not uploaded to Reddit by OpenQuok |

<Callout type="note">
<p>Add Reddit from <Badge text="Add Channel" variant="new" /> in the dashboard. The <strong>body</strong> is markdown on <Badge text="body" variant="param" />. Optional <Badge text="subreddit" variant="param" /> and <Badge text="title" variant="param" /> live in <Badge text="providerSettingsByIntegrationId" variant="param" /> for autofill at handoff. OpenQuok does not call Reddit’s publish API.</p>
</Callout>

## Settings on create post

Flat keys and the <Badge text="reddit" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="subreddit" variant="param" /> | <Badge text="reddit.subreddit" variant="param" /> | Community or profile (<Badge text="r/name" variant="param" /> or <Badge text="u/name" variant="param" />) — optional for global-only captions |
| <Badge text="community" variant="param" /> / <Badge text="sub" variant="param" /> | — | Aliases for <Badge text="subreddit" variant="param" /> |
| <Badge text="title" variant="param" /> | <Badge text="reddit.title" variant="param" /> | reddit.com post title (**1–300** chars when Settings are in use) |

When any subreddit or title field is set, OpenQuok validates community and title before schedule. Global captions without Settings can omit both — you choose the subreddit when you paste on reddit.com.

```json
{
  "providerSettingsByIntegrationId": {
    "<reddit-integration-id>": {
      "reddit": {
        "subreddit": "r/openquok",
        "title": "Weekly product update"
      }
    }
  }
}
```

## Media for handoff

Attach uploads on the top-level <Badge text="media" variant="param" /> array (or per-channel media in customize mode). OpenQuok stores files for your workflow. At due time the optional browser extension can download attachments — OpenQuok does not upload them to Reddit.

```json
{
  "body": "Screenshot walkthrough in markdown.",
  "integrationIds": ["<reddit-integration-id>"],
  "media": [{ "id": "<media-id>", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "<reddit-integration-id>": {
      "subreddit": "openquok",
      "title": "New feature screenshot"
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="subreddit" variant="param" /> / <Badge text="reddit.subreddit" variant="param" /> | string | When Settings active | Normalized to <Badge text="r/name" variant="param" /> or <Badge text="u/name" variant="param" /> |
| <Badge text="title" variant="param" /> / <Badge text="reddit.title" variant="param" /> | string | When Settings active | **1–300** characters |
| Top-level <Badge text="body" variant="param" /> | string | **Yes** | Markdown caption — links allowed |

Run <Badge text="GET /api/v1/public/integrations/:id/settings" variant="path" /> (or <Badge text="openquok integrations:settings" variant="default" />) for the typed <Badge text="settingsSchema" variant="param" /> Reddit exposes.

## Complete example

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "**Markdown body** — finish this post on reddit.com when the row is awaiting member.",
    "scheduledAt": "2026-05-15T12:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<reddit-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<reddit-integration-id>": {
        "reddit": {
          "subreddit": "r/openquok",
          "title": "Release notes from the API"
        }
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog — manual vs OAuth channels" href="/docs/public-api-providers" />
<LinkCard title="Reddit CLI examples" description="openquok recipes for subreddit, title, and media handoff" href="/docs/cli-examples/reddit" />
<LinkCard title="Reddit setup" description="Manual channel connect and member browser handoff" href="/docs/social-integration/reddit" />
<LinkCard title="Per-channel settings" description="Subreddit and title in the composer" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Writing the post" description="Markdown editor for Reddit" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Media rules" description="Body cap and handoff attachments" href="/docs/platforms/media-rules" />
</CardGrid>
