---
title: TikTok Settings
description: OpenQuok public API provider settings for TikTok — direct post vs inbox upload, privacy, photo title, and brand disclosure toggles.
order: 9
lastUpdated: 2026-09-14
sidebar:
  label: TikTok Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="tiktok" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/tiktok" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/tiktok">TikTok</a> |
| Character cap | **2,000** (caption) |
| Main-post media | **≥1** attachment; one MP4 <strong>or</strong> **1–35** JPEG/PNG/WEBP photos (never mixed) |
| Photo title | **≤90** characters when posting a photo carousel |

<Callout type="warning">
<p><Badge text="content_posting_method: UPLOAD" variant="param" /> (creator inbox) and <Badge text="privacy_level: SELF_ONLY" variant="param" /> on direct post are <strong>different</strong> workflows. Inbox upload does <strong>not</strong> send <Badge text="privacy_level" variant="param" />.</p>
</Callout>

## Settings on create post

Flat keys and the <Badge text="tiktok" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="content_posting_method" variant="param" /> | <Badge text="tiktok.content_posting_method" variant="param" /> | <Badge text="DIRECT_POST" variant="default" /> or <Badge text="UPLOAD" variant="default" /> (inbox) |
| <Badge text="privacy_level" variant="param" /> | <Badge text="tiktok.privacy_level" variant="param" /> | **Direct post only** — who can view |
| <Badge text="title" variant="param" /> | <Badge text="tiktok.title" variant="param" /> | Photo carousel title (**≤90** chars) |
| <Badge text="comment" variant="param" /> | <Badge text="tiktok.comment" variant="param" /> | Allow comments |
| <Badge text="duet" variant="param" /> | <Badge text="tiktok.duet" variant="param" /> | Allow duets |
| <Badge text="stitch" variant="param" /> | <Badge text="tiktok.stitch" variant="param" /> | Allow stitches |
| <Badge text="brand_content_toggle" variant="param" /> | — | Branded content disclosure |
| <Badge text="brand_organic_toggle" variant="param" /> | — | Brand organic disclosure |
| <Badge text="video_made_with_ai" variant="param" /> | — | AI-generated or AI-edited disclosure |

### Privacy levels (direct post)

| Value | Meaning |
| --- | --- |
| <Badge text="PUBLIC_TO_EVERYONE" variant="default" /> | Public |
| <Badge text="MUTUAL_FOLLOW_FRIENDS" variant="default" /> | Friends |
| <Badge text="FOLLOWER_OF_CREATOR" variant="default" /> | Followers |
| <Badge text="SELF_ONLY" variant="default" /> | Private on profile (finish in app, then switch to public) |

```json
{
  "providerSettingsByIntegrationId": {
    "<tiktok-integration-id>": {
      "content_posting_method": "DIRECT_POST",
      "privacy_level": "PUBLIC_TO_EVERYONE",
      "comment": true,
      "duet": false,
      "stitch": false,
      "video_made_with_ai": false
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="content_posting_method" variant="param" /> | string | No | <Badge text="DIRECT_POST" variant="default" /> (default) publishes to profile; <Badge text="UPLOAD" variant="default" /> sends to creator inbox |
| <Badge text="privacy_level" variant="param" /> | string | No | Direct post only — omitted when method is <Badge text="UPLOAD" variant="default" /> |
| <Badge text="title" variant="param" /> | string | For photo posts | Carousel title, max **90** characters |
| <Badge text="comment" variant="param" /> | boolean | No | Interaction toggle |
| <Badge text="duet" variant="param" /> | boolean | No | Interaction toggle |
| <Badge text="stitch" variant="param" /> | boolean | No | Interaction toggle |
| <Badge text="brand_content_toggle" variant="param" /> | boolean | No | Branded content |
| <Badge text="brand_organic_toggle" variant="param" /> | boolean | No | Brand organic |
| <Badge text="video_made_with_ai" variant="param" /> | boolean | No | AI disclosure |

TikTok does **not** support follow-up comments via <Badge text="providerSettingsByIntegrationId" variant="param" />.

## Complete example

Direct-post video:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Behind the scenes of our launch day.",
    "scheduledAt": "2026-05-15T20:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<tiktok-integration-id>"],
    "isGlobal": true,
    "media": [{ "id": "video-1", "path": "FILE_PATH_FROM_UPLOAD" }],
    "providerSettingsByIntegrationId": {
      "<tiktok-integration-id>": {
        "content_posting_method": "DIRECT_POST",
        "privacy_level": "PUBLIC_TO_EVERYONE",
        "comment": true
      }
    }
  }'
```

Send to creator inbox (finish trending audio in the TikTok app):

```json
{
  "body": "Draft for inbox — add sound in app.",
  "scheduledAt": "2026-05-15T20:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["<tiktok-integration-id>"],
  "isGlobal": true,
  "media": [{ "id": "video-1", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "<tiktok-integration-id>": {
      "content_posting_method": "UPLOAD"
    }
  }
}
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog and media upload flow" href="/docs/public-api-providers" />
<LinkCard title="TikTok CLI examples" description="openquok recipes for inbox, private drafts, and carousels" href="/docs/cli-examples/tiktok" />
<LinkCard title="TikTok setup" description="Developer app and Content Posting API review" href="/docs/social-integration/tiktok" />
<LinkCard title="Media rules" description="Photo carousel and video rules" href="/docs/platforms/media-rules" />
</CardGrid>
