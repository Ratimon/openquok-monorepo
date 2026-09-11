---
title: LinkedIn
description: OpenQuok MCP examples for LinkedIn — text posts, document carousels, and first-comment chains.
order: 7
lastUpdated: 2026-09-10
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
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

<Callout type="tip" title="Attach media in chat">
<p>Instead of public slide URLs in your prompt, attach the image files directly in your MCP client chat — then ask the agent to build the carousel with those files and your caption.</p>
</Callout>

## Cross-account comment or reshare

> Schedule a LinkedIn Page post for Friday at 2pm with body "Q2 recap is live" — then have my personal LinkedIn profile comment "Great update from the team!" and my other Page reshare it two minutes after publish. Use integrationList to find the channel IDs.

Cross-account actions belong in <Badge text="settings" variant="param" /> on the **publishing** channel (personal <Badge text="linkedin" variant="default" /> or <Badge text="linkedin-page" variant="default" />). List acting channel UUIDs in <Badge text="integrationIds" variant="param" /> inside <Badge text="linkedin.crossAccountPlugs" variant="param" />:

```json
{
  "type": "schedule",
  "date": "2026-06-27T14:00:00.000Z",
  "socialPost": [
    {
      "integration": "<linkedin-page-integration-id>",
      "postsAndComments": ["Q2 recap is live"],
      "settings": {
        "linkedin": {
          "crossAccountPlugs": [
            {
              "plugName": "linkedin-add-comment",
              "enabled": true,
              "delayMs": 0,
              "integrationIds": ["<linkedin-integration-id>"],
              "fields": {
                "comment": "Great update from the team!"
              }
            },
            {
              "plugName": "linkedin-repost-post-users",
              "enabled": true,
              "delayMs": 120000,
              "integrationIds": ["<linkedin-other-page-integration-id>"],
              "fields": {}
            }
          ]
        }
      }
    }
  ]
}
```

<Callout type="note" title="Comment vs reshare">
<p><Badge text="linkedin-add-comment" variant="default" /> needs <Badge text="fields.comment" variant="param" /> text. <Badge text="linkedin-repost-post-users" variant="default" /> reshares from acting channels with an empty <Badge text="fields" variant="param" /> object. <Badge text="delayMs" variant="param" /> is in milliseconds (<code>120000</code> = two minutes).</p>
</Callout>

## Global plugs (Page only)

<Callout type="note" title="Personal LinkedIn has no global catalog">
<p>Global plug tools apply to <Badge text="linkedin-page" variant="default" /> integrations only. Personal <Badge text="linkedin" variant="default" /> channels support internal <Badge text="linkedin.crossAccountPlugs" variant="param" /> via <Badge text="schedulePostTool" variant="default" /> — not <Badge text="plugsUpsert" variant="default" />.</p>
</Callout>

> On my LinkedIn Page, create a global plug that comments "Great discussion — full details below!" when a post gets 100 likes — use integrationList to find the Page channel ID.

Global plugs are channel-level rules that fire when a **published** post's likes reach a threshold. OpenQuok checks every six hours, up to three times per post.

1. Call <Badge text="integrationList" variant="default" /> and pick a <Badge text="linkedin-page" variant="default" /> channel UUID.
2. Call <Badge text="plugsCatalog" variant="default" /> and read field names for <Badge text="autoPlugPost" variant="default" /> or <Badge text="autoRepostPost" variant="default" />.
3. Call <Badge text="plugsUpsert" variant="default" />.

### Auto-comment when likes hit 100

```json
{
  "integrationId": "<linkedin-page-integration-id>",
  "func": "autoPlugPost",
  "fields": [
    { "name": "likesAmount", "value": "100" },
    { "name": "post", "value": "Great discussion — full details in the comments." }
  ]
}
```

### Auto-reshare when likes hit 100

```json
{
  "integrationId": "<linkedin-page-integration-id>",
  "func": "autoRepostPost",
  "fields": [
    { "name": "likesAmount", "value": "100" }
  ]
}
```

## Pause or delete a global rule

> Disable the global plug with id abc123 on my workspace.

```json
{
  "plugId": "<plug-id>",
  "activated": false
}
```

Call <Badge text="plugsActivate" variant="default" /> with <Badge text="activated: true" variant="param" /> to re-enable. Call <Badge text="plugsDelete" variant="default" /> to remove the row permanently.

## Related

<CardGrid>
<LinkCard title="LinkedIn setup" description="Developer app, OAuth scopes, and Page vs personal accounts" href="/docs/social-integration/linkedin" />
<LinkCard title="CLI examples" description="openquok posts:create and analytics for LinkedIn" href="/docs/cli-examples/linkedin" />
<LinkCard title="Cross-account plugs" description="Other connected LinkedIn channels comment or reshare" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Global plugs" description="Channel rules when likes reach a threshold" href="/docs/automations/global-plugs" />
<LinkCard title="Tools reference — Global plugs" description="plugsCatalog, plugsList, plugsUpsert, plugsActivate, plugsDelete" href="/docs/mcp-references/tools#global-plugs" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and rate limits" href="/docs/mcp-examples" />
</CardGrid>
