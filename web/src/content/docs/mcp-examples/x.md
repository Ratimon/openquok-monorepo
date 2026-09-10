---
title: X
description: OpenQuok MCP examples for X — tweets, media, and multi-part threads.
order: 8
lastUpdated: 2026-09-10
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

## Cross-account repost

> Schedule a tweet from my brand X account tomorrow at 10am with body "Main tweet from our brand account" — then have my other X account repost it two minutes after publish. Use integrationList to find both channel IDs.

Cross-account reposts belong in <Badge text="settings" variant="param" /> on the **publishing** channel — not as extra <Badge text="postsAndComments" variant="param" /> strings. List acting channel UUIDs in <Badge text="integrationIds" variant="param" /> inside <Badge text="x.crossAccountPlugs" variant="param" />:

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<x-publish-integration-id>",
      "postsAndComments": ["Main tweet from our brand account"],
      "settings": {
        "x": {
          "crossAccountPlugs": [
            {
              "plugName": "x-repost-post-users",
              "enabled": true,
              "delayMs": 120000,
              "integrationIds": ["<x-other-integration-id>"],
              "fields": {}
            }
          ]
        }
      }
    }
  ]
}
```

<Callout type="note" title="Repost, not reply">
<p>X cross-account plugs <strong>repost</strong> the published tweet from acting channels. They do not post reply comments from another account. Use <Badge text="postsAndComments" variant="param" /> for same-account thread replies. See <a href="/docs/cli-examples/x">CLI examples — X</a> for the same <Badge text="x-repost-post-users" variant="default" /> shape.</p>
</Callout>

## Global plug when likes hit a threshold

> On my X channel, create a global plug that replies "Appreciate the support!" when a tweet gets 100 likes — use integrationList first.

Global plugs are channel-level rules that fire when a **published** post's likes reach a threshold. OpenQuok checks every six hours, up to three times per post.

1. Call <Badge text="integrationList" variant="default" /> and pick the X channel UUID.
2. Call <Badge text="plugsCatalog" variant="default" /> and read field names for <Badge text="autoPlugPost" variant="default" /> or <Badge text="autoRepostPost" variant="default" /> on <Badge text="x" variant="default" />.
3. Call <Badge text="plugsUpsert" variant="default" />.

### Auto-reply when likes hit 100

```json
{
  "integrationId": "<x-integration-id>",
  "func": "autoPlugPost",
  "fields": [
    { "name": "likesAmount", "value": "100" },
    { "name": "post", "value": "Appreciate the support — link in bio!" }
  ]
}
```

### Auto-repost when likes hit 100

```json
{
  "integrationId": "<x-integration-id>",
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

<Callout type="note" title="Internal vs global">
<p><Badge text="schedulePostTool.settings" variant="param" /> handles <strong>per-post</strong> cross-account reposts via <Badge text="x.crossAccountPlugs" variant="param" />. <Badge text="plugsUpsert" variant="default" /> handles <strong>channel-level</strong> rules that watch likes on future publishes.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="X setup" description="OAuth 1.0a Native App credentials and callback URLs" href="/docs/social-integration/x" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for threads and analytics" href="/docs/cli-examples/x" />
<LinkCard title="Plugs (user guide)" description="Internal vs global plugs, platform support, and dashboard setup" href="/docs/automations/plugs" />
<LinkCard title="Tools reference — Global plugs" description="plugsCatalog, plugsList, plugsUpsert, plugsActivate, plugsDelete" href="/docs/mcp-references/tools#global-plugs" />
<LinkCard title="MCP overview" description="Bulk schedule and multi-channel workflows" href="/docs/mcp-examples" />
</CardGrid>
