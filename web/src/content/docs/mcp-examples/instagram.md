---
title: Instagram
description: OpenQuok MCP examples for Instagram — feed posts and reels with public image or video URLs.
order: 2
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Business | Standalone |
| --- | --- | --- |
| Provider identifier | <Badge text="instagram-business" variant="default" /> | <Badge text="instagram-standalone" variant="default" /> |
| Max content length | 2200 characters | 2200 characters |
| Required attachments | At least 1 | At least 1 |
| OAuth setup | <a href="/docs/social-integration/instagram">Instagram</a> | <a href="/docs/social-integration/instagram">Instagram</a> |

## Post with an image URL

> Schedule an Instagram post with this image https://example.com/brand-photo.jpg and caption "Summer launch"

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<instagram-integration-id>",
      "postsAndComments": ["Summer launch"],
      "attachments": ["https://example.com/brand-photo.jpg"]
    }
  ]
}
```

OpenQuok downloads each attachment URL, uploads it to your workspace media storage, then attaches it to the post.

<Callout type="warning" title="Scheduled posts need media">
<p>Instagram rejects scheduled posts with zero attachments. Always include at least one public URL in <Badge text="attachments" variant="param" />, or save as <Badge text="type: draft" variant="param" /> and attach media from the web UI later.</p>
</Callout>

## Reel (single video URL)

> Schedule an Instagram reel for Friday at noon with this video https://example.com/reel.mp4 and caption "New reel — drop a fire emoji if you like it!"

```json
{
  "type": "schedule",
  "date": "2026-06-28T12:00:00.000Z",
  "socialPost": [
    {
      "integration": "<instagram-integration-id>",
      "postsAndComments": ["New reel — drop a 🔥 if you like it!"],
      "attachments": ["https://example.com/reel.mp4"]
    }
  ]
}
```

A single <Badge text=".mp4" variant="param" /> attachment is published as a Reel automatically.

## Related

<CardGrid>
<LinkCard title="Instagram setup" description="Meta app, Page picker, and Business vs Standalone OAuth" href="/docs/social-integration/instagram" />
<LinkCard title="CLI examples" description="openquok upload and posts:create recipes for feed, reels, and carousels" href="/docs/cli-examples/instagram" />
<LinkCard title="MCP overview" description="List channels, bulk schedule, and rate limits" href="/docs/mcp-examples" />
</CardGrid>
