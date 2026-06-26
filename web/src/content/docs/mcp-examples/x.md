---
title: X
description: OpenQuok MCP examples for X — tweets, media, and multi-part threads.
order: 8
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="x" variant="default" /> |
| Max content length | 280 weighted (4000 when Verified) |
| Required attachments | None — text-only posts publish |
| OAuth setup | <a href="/docs/social-integration/x">X setup guide</a> |

## Schedule a post to X

> Schedule a post to X for tomorrow at 10am UTC: Excited to announce our new feature!

The agent calls <Badge text="integrationList" variant="default" />, optionally <Badge text="integrationSchema" variant="default" /> with <Badge text="platform: x" variant="param" />, then <Badge text="schedulePostTool" variant="default" />:

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<x-integration-id>",
      "postsAndComments": ["Excited to announce our new feature!"],
      "settings": { "who_can_reply_post": "everyone" }
    }
  ]
}
```

## Post with an image URL

> Schedule a tweet with this image https://example.com/launch.jpg and text "Launch day."

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<x-integration-id>",
      "postsAndComments": ["Launch day."],
      "attachments": ["https://example.com/launch.jpg"],
      "settings": { "who_can_reply_post": "everyone" }
    }
  ]
}
```

<Callout type="tip" title="Attach media in chat">
<p>Instead of a public URL in your prompt, attach the image directly in your MCP client chat — then ask the agent to schedule the tweet with that file and your caption.</p>
</Callout>

## Create a thread

> Draft a three-part X thread: hook, two lessons learned, and a call to action.

Add multiple items to <Badge text="postsAndComments" variant="param" /> — the first string is the root tweet; the rest become replies:

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<x-integration-id>",
      "postsAndComments": [
        "Thread: 5 things I learned this week",
        "1. Consistency beats intensity",
        "2. Start before you're ready"
      ],
      "settings": { "who_can_reply_post": "everyone" }
    }
  ]
}
```

<Callout type="tip" title="Weighted character counting">
<p>X counts URLs and some characters differently than plain length. Ask the agent to call <Badge text="integrationSchema" variant="default" /> first if you are near the limit.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="X setup" description="OAuth 1.0a Native App credentials and callback URLs" href="/docs/social-integration/x" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for threads and analytics" href="/docs/cli-examples/x" />
<LinkCard title="MCP overview" description="Bulk schedule and multi-channel workflows" href="/docs/mcp-examples" />
</CardGrid>
