---
title: YouTube Settings
description: OpenQuok public API provider settings for YouTube — title, privacy, tags, made-for-kids, and custom thumbnail on video uploads.
order: 8
lastUpdated: 2026-09-14
sidebar:
  label: YouTube Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="youtube" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/youtube" variant="path" /> (+ channel picker) |
| Setup guide | <a href="/docs/social-integration/youtube">YouTube</a> |
| Description cap | **5,000** characters on top-level <Badge text="body" variant="param" /> |
| Main-post media | Exactly **one MP4** video — required |

<Callout type="note">
<p><Badge text="title" variant="param" /> is required (**2–100** characters) in provider settings. The top-level <Badge text="body" variant="param" /> is the video <strong>description</strong>. YouTube does not support scheduled follow-up comments in OpenQuok.</p>
</Callout>

## Settings on create post

Flat keys and the <Badge text="youtube" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="title" variant="param" /> | <Badge text="youtube.title" variant="param" /> | Video title (**2–100** chars, required) |
| <Badge text="type" variant="param" /> | <Badge text="youtube.type" variant="param" /> | <Badge text="public" variant="default" />, <Badge text="private" variant="default" />, or <Badge text="unlisted" variant="default" /> |
| <Badge text="selfDeclaredMadeForKids" variant="param" /> | <Badge text="youtube.selfDeclaredMadeForKids" variant="param" /> | <Badge text="yes" variant="default" /> or <Badge text="no" variant="default" /> |
| <Badge text="tags" variant="param" /> | <Badge text="youtube.tags" variant="param" /> | Snippet tags (strings or <Badge text="&#123; value, label &#125;" variant="param" /> objects) |
| <Badge text="thumbnail" variant="param" /> / <Badge text="thumbnailPath" variant="param" /> | <Badge text="youtube.thumbnail" variant="param" /> | Custom thumbnail <Badge text="&#123; path &#125;" variant="param" /> from upload |

```json
{
  "providerSettingsByIntegrationId": {
    "<youtube-integration-id>": {
      "title": "Product walkthrough — May 2026",
      "type": "unlisted",
      "selfDeclaredMadeForKids": "no",
      "tags": [{ "value": "saas", "label": "saas" }],
      "thumbnail": { "path": "FILE_PATH_FROM_THUMBNAIL_UPLOAD" }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="title" variant="param" /> / <Badge text="youtube.title" variant="param" /> | string | **Yes** | **2–100** characters |
| <Badge text="type" variant="param" /> / <Badge text="youtube.type" variant="param" /> | string | No | Privacy status; default <Badge text="public" variant="default" /> |
| <Badge text="selfDeclaredMadeForKids" variant="param" /> | string | No | COPPA declaration: <Badge text="yes" variant="default" /> or <Badge text="no" variant="default" /> |
| <Badge text="tags" variant="param" /> / <Badge text="youtube.tags" variant="param" /> | array | No | Optional video tags |
| <Badge text="thumbnail" variant="param" /> / <Badge text="thumbnailPath" variant="param" /> | object or string | No | Storage path from <Badge text="POST /api/v1/public/upload" variant="path" /> |

## Complete example

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "In this video we walk through the new dashboard and scheduling flow.",
    "scheduledAt": "2026-05-15T16:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<youtube-integration-id>"],
    "isGlobal": true,
    "media": [{ "id": "video-1", "path": "FILE_PATH_FROM_UPLOAD" }],
    "providerSettingsByIntegrationId": {
      "<youtube-integration-id>": {
        "title": "Dashboard walkthrough — May 2026",
        "type": "public",
        "selfDeclaredMadeForKids": "no"
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog and upload workflow" href="/docs/public-api-providers" />
<LinkCard title="YouTube CLI examples" description="openquok recipes for title, tags, and thumbnails" href="/docs/cli-examples/youtube" />
<LinkCard title="YouTube setup" description="Google Cloud project and OAuth consent" href="/docs/social-integration/youtube" />
<LinkCard title="Upload APIs" description="Multipart upload before scheduling video posts" href="/docs/apis-uploads" />
<LinkCard title="Media rules" description="YouTube media and description rules" href="/docs/platforms/media-rules" />
</CardGrid>
