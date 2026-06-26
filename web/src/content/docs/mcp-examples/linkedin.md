---
title: LinkedIn
description: OpenQuok MCP examples for LinkedIn — text posts, document carousels, and first-comment chains.
order: 7
lastUpdated: 2026-06-26
---

<script>
import { Badge, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Personal | Page |
| --- | --- | --- |
| Provider identifier | <Badge text="linkedin" variant="default" /> | <Badge text="linkedin-page" variant="default" /> |
| OAuth setup | <a href="/docs/social-integration/linkedin">LinkedIn</a> | <a href="/docs/social-integration/linkedin">LinkedIn</a> |

## Schedule a text post

> Schedule a LinkedIn post for Friday at 2pm UTC: Shipping a small update on what we learned this week.

```json
{
  "type": "schedule",
  "date": "2026-06-27T14:00:00.000Z",
  "socialPost": [
    {
      "integration": "<linkedin-integration-id>",
      "postsAndComments": ["Shipping a small update on what we learned this week."]
    }
  ]
}
```

## Post with a first comment

> Publish a LinkedIn announcement now, then add a comment with the product link.

On LinkedIn, the first <Badge text="postsAndComments" variant="param" /> string is the post and the rest are comments:

```json
{
  "type": "now",
  "socialPost": [
    {
      "integration": "<linkedin-integration-id>",
      "postsAndComments": [
        "We just launched something big!",
        "Check it out at example.com"
      ]
    }
  ]
}
```

## Document carousel (Page)

> Schedule a LinkedIn Page carousel from these slide images with title "Q2 update" — use integrationList to find my Page channel.

```json
{
  "type": "schedule",
  "date": "2026-06-28T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<linkedin-page-integration-id>",
      "postsAndComments": ["Our Q2 product slides — swipe through the deck."],
      "attachments": [
        "https://example.com/slides/01.png",
        "https://example.com/slides/02.png"
      ],
      "settings": {
        "linkedin": {
          "postAsImagesCarousel": true,
          "carouselName": "Q2 update"
        }
      }
    }
  ]
}
```

## Related

<CardGrid>
<LinkCard title="LinkedIn setup" description="Developer app, OAuth scopes, and Page vs personal accounts" href="/docs/social-integration/linkedin" />
<LinkCard title="CLI examples" description="openquok posts:create and analytics for LinkedIn" href="/docs/cli-examples/linkedin" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and rate limits" href="/docs/mcp-examples" />
</CardGrid>
