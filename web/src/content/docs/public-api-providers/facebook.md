---
title: Facebook Page Settings
description: OpenQuok public API provider settings for Facebook Pages — embedded URL on text posts, Stories, and follow-up comments with optional image.
order: 5
lastUpdated: 2026-09-14
sidebar:
  label: Facebook Page Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="facebook" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/facebook" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/facebook">Facebook Page</a> |
| Character cap | **63,206** |
| Main-post media | Text-only OK; photos, multi-photo carousel, or Reel (MP4) |

## Settings on create post

Flat keys and the <Badge text="facebook" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="post_type" variant="param" /> / <Badge text="postType" variant="param" /> | <Badge text="facebook.postType" variant="param" /> | <Badge text="post" variant="default" /> (feed/Reel) or <Badge text="story" variant="default" /> |
| <Badge text="url" variant="param" /> | <Badge text="facebook.url" variant="param" /> | Link preview on **text-only** feed posts |
| — | <Badge text="facebook.replies" variant="param" /> | Follow-up comments after publish |

<Callout type="warning">
<p><Badge text="url" variant="param" /> is <strong>ignored</strong> when photos or video are attached. <strong>Stories</strong> require at least one image or MP4 and do <strong>not</strong> support follow-up <Badge text="facebook.replies" variant="param" />.</p>
</Callout>

```json
{
  "providerSettingsByIntegrationId": {
    "<facebook-integration-id>": {
      "url": "https://example.com/launch",
      "facebook": {
        "replies": [
          {
            "message": "See the chart in this comment",
            "delaySeconds": 60,
            "media": [{ "id": "reply-img", "path": "FILE_PATH_FROM_UPLOAD" }]
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
| <Badge text="post_type" variant="param" /> / <Badge text="facebook.postType" variant="param" /> | string | No | <Badge text="post" variant="default" /> (default) or <Badge text="story" variant="default" /> |
| <Badge text="url" variant="param" /> / <Badge text="facebook.url" variant="param" /> | string | No | HTTPS link for text-only feed posts |
| <Badge text="facebook.replies" variant="param" /> | array | No | Feed posts only — not Stories |
| <Badge text="facebook.replies[].message" variant="param" /> | string | Yes (per row) | Comment text |
| <Badge text="facebook.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Delay after previous part |
| <Badge text="facebook.replies[].media" variant="param" /> | array | No | Max **one image** per reply — no video |

## Follow-up comments

Same-account Page comments use <Badge text="facebook.replies" variant="param" />. Optional <Badge text="media" variant="param" /> allows a single image per reply — upload via <Badge text="POST /api/v1/public/upload" variant="path" /> first.

## Complete example

Text post with link preview:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "We just shipped a major update.",
    "scheduledAt": "2026-05-15T14:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<facebook-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<facebook-integration-id>": {
        "url": "https://example.com/blog/launch"
      }
    }
  }'
```

Story with one image:

```json
{
  "body": "",
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["<facebook-integration-id>"],
  "isGlobal": true,
  "media": [{ "id": "story-1", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "<facebook-integration-id>": {
      "post_type": "story"
    }
  }
}
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog and multi-channel examples" href="/docs/public-api-providers" />
<LinkCard title="Facebook CLI examples" description="openquok recipes for link previews, Reels, and Stories" href="/docs/cli-examples/facebook" />
<LinkCard title="Facebook setup" description="Meta developer app and Page permissions" href="/docs/social-integration/facebook" />
<LinkCard title="Threads and comments" description="Follow-up comment support by network" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Platform limits" description="Facebook media and caption rules" href="/docs/platforms" />
</CardGrid>
