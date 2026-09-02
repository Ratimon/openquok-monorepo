---
title: TikTok (Business)
description: OpenQuok MCP examples for TikTok (Business) — videos with custom covers and optional commercial audio.
order: 6
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="tiktok-business" variant="default" /> |
| Max caption length | 2,200 characters |
| Required attachments | One video or one+ images (no mixing) |
| OAuth setup | <a href="/docs/social-integration/tiktok-business">TikTok (Business)</a> |

## Video with commercial audio

> Schedule a TikTok Business clip for tomorrow with this video https://example.com/clip.mp4 — caption "Vertical clip from my agent", allow comments, attach commercial audio.

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<tiktok-business-integration-id>",
      "postsAndComments": ["Vertical clip — scheduled from my agent."],
      "attachments": ["https://example.com/clip.mp4"],
      "settings": {
        "content_posting_method": "DIRECT_POST",
        "comment": true,
        "duet": false,
        "stitch": false,
        "music_sound_id": "<music-sound-id>"
      }
    }
  ]
}
```

<Callout type="tip" title="Attach media in chat">
<p>Instead of a public URL in your prompt, attach the video or image files directly in your MCP client chat — then ask the agent to schedule the TikTok (Business) post with that media and your caption.</p>
</Callout>

<Callout type="note" title="Video privacy">
<p>Business video posts follow the account default. Ask the agent not to send a privacy level on videos. Photo carousels can still set privacy on direct post.</p>
</Callout>

<Callout type="tip" title="Inbox vs direct post">
<p>Use inbox upload when you want to finish in the TikTok app. Commercial audio and location apply to direct posts only. Ask the agent to read <Badge text="integrationSchema" variant="default" /> for allowed values on your account.</p>
</Callout>

<Callout type="note">
<p>This channel is separate from Content API TikTok. Before scheduling at volume, warm the account using <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">How to warm up a TikTok account to reach a US audience</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="TikTok (Business) setup" description="Marketing API app, trailing-slash redirect, and media domain verification" href="/docs/social-integration/tiktok-business" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for video and photo carousels" href="/docs/cli-examples/tiktok-business" />
<LinkCard title="MCP overview" description="Multi-channel and bulk scheduling patterns" href="/docs/mcp-examples" />
</CardGrid>
