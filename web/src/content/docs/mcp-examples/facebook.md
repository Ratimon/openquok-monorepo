---
title: Facebook Page
description: OpenQuok MCP examples for Facebook Page — text, photos, link previews, and follow-up comments.
order: 1
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="facebook" variant="default" /> |
| OAuth setup | <a href="/docs/social-integration/facebook">Facebook Page</a> |

## Text-only Page post

> Schedule a Facebook Page post for Monday at noon: Hello from our Page

```json
{
  "type": "schedule",
  "date": "2026-06-30T12:00:00.000Z",
  "socialPost": [
    {
      "integration": "<facebook-page-integration-id>",
      "postsAndComments": ["Hello from our Page"]
    }
  ]
}
```

## Post with an image URL

> Schedule a photo post to my Facebook Page with https://example.com/hero.jpg and caption "Photo update"

```json
{
  "type": "schedule",
  "date": "2026-06-30T12:00:00.000Z",
  "socialPost": [
    {
      "integration": "<facebook-page-integration-id>",
      "postsAndComments": ["Photo update"],
      "attachments": ["https://example.com/hero.jpg"]
    }
  ]
}
```

<Callout type="tip" title="Attach media in chat">
<p>Instead of a public URL in your prompt, attach the image directly in your MCP client chat — then ask the agent to schedule the post with that file and your caption.</p>
</Callout>

## Link post

> Schedule a link post to my Facebook Page pointing to https://example.com/article with text "Read more on our site"

```json
{
  "type": "schedule",
  "date": "2026-06-30T12:00:00.000Z",
  "socialPost": [
    {
      "integration": "<facebook-page-integration-id>",
      "postsAndComments": ["Read more on our site"],
      "settings": { "url": "https://example.com/article" }
    }
  ]
}
```

## Follow-up comment

> Post an announcement to my Facebook Page now, then add a comment with the signup link.

Use multiple <Badge text="postsAndComments" variant="param" /> strings — the first is the Page post, the rest become comments:

```json
{
  "type": "now",
  "socialPost": [
    {
      "integration": "<facebook-page-integration-id>",
      "postsAndComments": [
        "We just launched something big!",
        "Check it out at example.com"
      ]
    }
  ]
}
```

## Related

<CardGrid>
<LinkCard title="Facebook Page setup" description="Meta app, Page permissions, and OAuth redirects" href="/docs/social-integration/facebook" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for carousels and link posts" href="/docs/cli-examples/facebook" />
<LinkCard title="MCP overview" description="List channels and multi-channel blast workflows" href="/docs/mcp-examples" />
</CardGrid>
