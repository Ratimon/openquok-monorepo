---
title: TikTok
description: OpenQuok MCP examples for TikTok — videos and photo carousels with privacy settings.
order: 5
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="tiktok" variant="default" /> |
| Max caption length | 2,000 characters |
| Required attachments | One video or one+ images (no mixing) |
| OAuth setup | <a href="/docs/social-integration/tiktok">TikTok</a> |

## Video with privacy settings

> Schedule a TikTok for tomorrow with this clip https://example.com/clip.mp4 — caption "Vertical clip from my agent", public, allow comments, no duet or stitch.

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<tiktok-integration-id>",
      "postsAndComments": ["Vertical clip — scheduled from my agent."],
      "attachments": ["https://example.com/clip.mp4"],
      "settings": {
        "privacy_level": "PUBLIC_TO_EVERYONE",
        "content_posting_method": "DIRECT_POST",
        "comment": true,
        "duet": false,
        "stitch": false
      }
    }
  ]
}
```

<Callout type="tip" title="Inbox vs direct post">
<p>Some workspaces use <Badge text="content_posting_method: SEND_TO_INBOX" variant="param" /> so creators finish editing in the TikTok app. Ask the agent to read <Badge text="integrationSchema" variant="default" /> for allowed values on your account.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="TikTok setup" description="Developer app, redirect URI, and content posting scopes" href="/docs/social-integration/tiktok" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for video and photo carousels" href="/docs/cli-examples/tiktok" />
<LinkCard title="MCP overview" description="Multi-channel and bulk scheduling patterns" href="/docs/mcp-examples" />
</CardGrid>
