---
title: YouTube
description: OpenQuok MCP examples for YouTube — MP4 uploads with title, privacy, and tags.
order: 4
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="youtube" variant="default" /> |
| Max description length | 5,000 characters |
| Required attachments | Exactly one <Badge text=".mp4" variant="param" /> video |
| OAuth setup | <a href="/docs/social-integration/youtube">YouTube</a> |

## Video with title and privacy

> Schedule a YouTube upload for next Tuesday at 9am with this video https://example.com/walkthrough.mp4 — title "OpenQuok walkthrough", public, description "Full product walkthrough — links below."

```json
{
  "type": "schedule",
  "date": "2026-07-01T09:00:00.000Z",
  "socialPost": [
    {
      "integration": "<youtube-integration-id>",
      "postsAndComments": ["Full product walkthrough — links in description."],
      "attachments": ["https://example.com/walkthrough.mp4"],
      "settings": {
        "title": "OpenQuok walkthrough",
        "type": "public",
        "selfDeclaredMadeForKids": "no"
      }
    }
  ]
}
```

<Callout type="tip" title="Attach media in chat">
<p>Instead of a public URL in your prompt, attach the video file directly in your MCP client chat — then ask the agent to schedule the YouTube upload with that file, title, and description.</p>
</Callout>

<Callout type="note" title="Description vs title">
<p>The first <Badge text="postsAndComments" variant="param" /> string becomes the YouTube <strong>description</strong>. Set <Badge text="title" variant="param" /> and <Badge text="type" variant="param" /> (privacy) in <Badge text="settings" variant="param" />.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="YouTube setup" description="Google Cloud project, OAuth consent, and upload scopes" href="/docs/social-integration/youtube" />
<LinkCard title="CLI examples" description="openquok upload and posts:create with nested youtube settings" href="/docs/cli-examples/youtube" />
<LinkCard title="MCP overview" description="Attachment URL conventions and rate limits" href="/docs/mcp-examples" />
</CardGrid>
