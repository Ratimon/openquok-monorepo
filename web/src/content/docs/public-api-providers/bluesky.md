---
title: Bluesky Settings
description: OpenQuok public API provider settings for Bluesky — 300-character cap, images or video, and follow-up replies.
order: 11
lastUpdated: 2026-09-26
sidebar:
  label: Bluesky Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="bluesky" variant="default" /> |
| Connect | Dashboard credentials — <Badge text="GET /api/v1/public/social/bluesky" variant="path" /> returns <strong>400</strong> |
| Setup guide | <a href="/docs/social-integration/bluesky">Bluesky</a> |
| Character cap | **300** graphemes (main caption and each follow-up) |
| Main-post media | Text-only OK; up to <strong>4</strong> images <strong>or</strong> <strong>1</strong> MP4 (never mixed) |

<Callout type="note">
<p>Keys in <Badge text="providerSettingsByIntegrationId" variant="param" /> use the channel <strong>UUID</strong> from <Badge text="GET /api/v1/public/integrations" variant="default" /> — not the <Badge text="bluesky" variant="default" /> identifier. See the <a href="/docs/public-api-providers">Provider settings overview</a> for terminology.</p>
</Callout>

## Settings on create post

Bluesky has <strong>no</strong> title, tags, or privacy fields in <Badge text="providerSettingsByIntegrationId" variant="param" />. The main caption is <Badge text="body" variant="param" />; attachments use top-level <Badge text="media" variant="param" /> or <Badge text="mediaByIntegrationId" variant="param" />.

Scheduled same-account replies use the nested <Badge text="bluesky" variant="default" /> bucket only:

```json
{
  "providerSettingsByIntegrationId": {
    "<bluesky-integration-id>": {
      "bluesky": {
        "replies": [
          {
            "id": "reply-1",
            "message": "More detail in the reply.",
            "delaySeconds": 300,
            "media": [{ "id": "<media-id>", "path": "FILE_PATH_FROM_UPLOAD" }]
          }
        ]
      }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="bluesky.replies" variant="param" /> | array | No | Follow-up replies after the root post publishes |
| <Badge text="bluesky.replies[].id" variant="param" /> | string | No | Stable row id (composer-generated) |
| <Badge text="bluesky.replies[].message" variant="param" /> | string | Yes (per row) | Reply text; **300** graphemes when <Badge text="status" variant="param" /> is <Badge text="scheduled" variant="param" /> |
| <Badge text="bluesky.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Wait after the previous part publishes |
| <Badge text="bluesky.replies[].media" variant="param" /> | array | No | Same rules as main post — up to four images or one MP4, not mixed |

## Follow-up comments

Same-account replies live in <Badge text="bluesky.replies" variant="param" />. Each row needs <Badge text="message" variant="param" /> and <Badge text="delaySeconds" variant="param" />. Optional <Badge text="media" variant="param" /> uses the same <Badge text="&#123; id, path &#125;" variant="param" /> shape as the main post — upload first via <Badge text="POST /api/v1/public/upload" variant="path" />.

<Callout type="tip">
<p>Use <Badge text="status: draft" variant="param" /> or <Badge text="-t draft" variant="param" /> if you need to store longer copy before you shorten it for schedule.</p>
</Callout>

## Complete example

Schedule a text post with one follow-up reply:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Shipping a small update today.",
    "scheduledAt": "2026-05-15T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<bluesky-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<bluesky-integration-id>": {
        "bluesky": {
          "replies": [
            { "id": "reply-1", "message": "Thread continues here.", "delaySeconds": 120 }
          ]
        }
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Bluesky CLI examples" description="openquok recipes for text, images, and follow-ups" href="/docs/cli-examples/bluesky" />
<LinkCard title="Bluesky setup" description="App password and dashboard connect" href="/docs/social-integration/bluesky" />
<LinkCard title="Threads and comments" description="Follow-up comments in the composer" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media rules" description="Caps and attachment mix by network" href="/docs/platforms/media-rules" />
</CardGrid>
