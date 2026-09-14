---
title: Instagram Business Settings
description: OpenQuok public API provider settings for Instagram Business (FB-linked) — post type, trial reels, collaborators, and follow-up comments.
order: 6
lastUpdated: 2026-09-14
sidebar:
  label: Instagram Business Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="instagram-business" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/instagram-business" variant="path" /> (+ Facebook Page picker) |
| Setup guide | <a href="/docs/social-integration/instagram">Instagram</a> |
| Character cap | **2,200** |
| Main-post media | **≥1** attachment required for <Badge text="status: scheduled" variant="param" />; story/trial reel = **1** item; carousel ≤**10** |

<Callout type="note">
<p><Badge text="instagram-business" variant="default" /> and <Badge text="instagram-standalone" variant="default" /> accept the <strong>same</strong> settings shape — only the connect path differs. Standalone (IG Login) docs: <a href="/docs/public-api-providers/instagram-standalone">Instagram Standalone Settings</a>.</p>
</Callout>

## Settings on create post

Flat keys merge into <Badge text="providerSettingsByIntegrationId[&lt;integration-id&gt;]" variant="param" />. Follow-up comments nest under <Badge text="instagram.replies" variant="param" />.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="post_type" variant="param" /> | <Badge text="instagram.postType" variant="param" /> | Feed/Reel vs <Badge text="story" variant="default" /> |
| <Badge text="is_trial_reel" variant="param" /> | <Badge text="instagram.isTrialReel" variant="param" /> | Trial Reel (single video, feed only) |
| <Badge text="graduation_strategy" variant="param" /> | <Badge text="instagram.graduationStrategy" variant="param" /> | <Badge text="MANUAL" variant="default" /> or <Badge text="SS_PERFORMANCE" variant="default" /> when trial reel is on |
| <Badge text="collaborators" variant="param" /> | <Badge text="instagram.collaborators" variant="param" /> | Up to **3** IG usernames (feed/Reel single media only) |
| — | <Badge text="instagram.replies" variant="param" /> | Text follow-up comments |

```json
{
  "providerSettingsByIntegrationId": {
    "<instagram-integration-id>": {
      "post_type": "story",
      "collaborators": [{ "label": "openquok" }],
      "instagram": {
        "replies": [
          { "message": "Thanks for the love!", "delaySeconds": 300 }
        ]
      }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="post_type" variant="param" /> | string | No | Omit or <Badge text="post" variant="default" /> for feed/Reel; <Badge text="story" variant="default" /> for Stories |
| <Badge text="is_trial_reel" variant="param" /> | boolean | No | Single MP4 trial reel — not combinable with Stories |
| <Badge text="graduation_strategy" variant="param" /> | string | No | Used when <Badge text="is_trial_reel" variant="param" /> is <Badge text="true" variant="default" />; defaults to <Badge text="MANUAL" variant="default" /> |
| <Badge text="collaborators" variant="param" /> | array | No | Strings or <Badge text="&#123; label &#125;" variant="param" /> objects; max **3**; not on Stories or carousels |
| <Badge text="instagram.replies" variant="param" /> | array | No | Comments on the published media |
| <Badge text="instagram.replies[].message" variant="param" /> | string | Yes (per row) | **Text only** — no media on follow-ups |
| <Badge text="instagram.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Delay after previous part |

## Follow-up comments

Instagram follow-ups use <Badge text="instagram.replies" variant="param" /> — text only. Put images and video on the main post <Badge text="media" variant="param" /> array.

## Complete example

Upload media first, then schedule a feed post:

```bash
# 1) Upload
curl -X POST https://api.openquok.com/api/v1/public/upload \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -F "file=@photo.jpg"

# 2) Schedule
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Beautiful sunset #photography",
    "scheduledAt": "2026-05-15T18:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<instagram-integration-id>"],
    "isGlobal": true,
    "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }]
  }'
```

Publish a Story (one attachment; collaborators are not supported on Stories):

```json
{
  "body": "",
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["<instagram-integration-id>"],
  "isGlobal": true,
  "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "<instagram-integration-id>": {
      "post_type": "story"
    }
  }
}
```

## Related

<CardGrid>
<LinkCard title="Instagram Standalone Settings" description="Same settings — IG Login connect path" href="/docs/public-api-providers/instagram-standalone" />
<LinkCard title="Provider settings overview" description="Hub catalog and per-channel media overrides" href="/docs/public-api-providers" />
<LinkCard title="Instagram CLI examples" description="openquok recipes for Reels, Stories, and trial reels" href="/docs/cli-examples/instagram" />
<LinkCard title="Instagram setup" description="Meta app, Page link, and OAuth" href="/docs/social-integration/instagram" />
<LinkCard title="Platform limits" description="Carousel, story, and reel constraints" href="/docs/platforms" />
</CardGrid>
