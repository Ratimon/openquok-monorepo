---
title: Meta Threads
description: OpenQuok MCP examples for Meta Threads — scheduled posts, reply chains, cross-account comments, and provider tools.
order: 3
lastUpdated: 2026-09-10
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="threads" variant="default" /> |
| Max content length | 500 characters |
| Required attachments | None — text-only posts publish |
| OAuth setup | <a href="/docs/social-integration/threads">Meta Threads</a> |

## Schedule a single post

> Schedule a post to my Threads account tomorrow at 2pm UTC saying "Hello from my AI assistant" — use integrationList first to find the right channel ID.

The agent should:

1. Call <Badge text="integrationList" variant="default" /> and pick the Threads channel.
2. Optionally call <Badge text="integrationSchema" variant="default" /> with <Badge text="platform: threads" variant="param" /> to check character limits.
3. Call <Badge text="schedulePostTool" variant="default" /> with <Badge text="type: schedule" variant="param" /> and an ISO <Badge text="date" variant="param" />.

```json
{
  "type": "schedule",
  "date": "2026-06-27T14:00:00.000Z",
  "socialPost": [
    {
      "integration": "<threads-integration-id>",
      "postsAndComments": ["Hello from my AI assistant"]
    }
  ]
}
```

## Reply chain (thread)

> Draft a three-part Threads thread on my connected account: hook, detail, and call to action.

```json
{
  "type": "draft",
  "socialPost": [
    {
      "integration": "<threads-integration-id>",
      "postsAndComments": [
        "Here is the hook.",
        "Here is the supporting detail.",
        "What do you think? Reply below."
      ]
    }
  ]
}
```

The adapter maps additional <Badge text="postsAndComments" variant="param" /> entries to Threads reply chains automatically.

## Cross-account comment from another Threads channel

> Schedule a Threads post from my brand account tomorrow at 10am with body "Main thread from our brand account" — then have my other Threads account comment "Great thread — sharing from our other account." two minutes after publish. Use integrationList to find both channel IDs.

Cross-account comments belong in <Badge text="settings" variant="param" /> on the **publishing** channel — not as extra <Badge text="postsAndComments" variant="param" /> strings. List acting channel UUIDs in <Badge text="integrationIds" variant="param" /> inside <Badge text="threads.crossAccountPlugs" variant="param" />:

```json
{
  "type": "schedule",
  "date": "2026-06-27T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<threads-publish-integration-id>",
      "postsAndComments": ["Main thread from our brand account"],
      "settings": {
        "threads": {
          "crossAccountPlugs": [
            {
              "plugName": "threads-cross-account-comment",
              "enabled": true,
              "delayMs": 120000,
              "integrationIds": ["<threads-other-integration-id>"],
              "fields": {
                "comment": "Great thread — sharing from our other account."
              }
            }
          ]
        }
      }
    }
  ]
}
```

<Callout type="note" title="Same account vs cross-account">
<p><Badge text="postsAndComments" variant="param" /> entries after the first string are <strong>same-account</strong> reply chains. <Badge text="threads.internalEngagementPlug" variant="param" /> in <Badge text="settings" variant="param" /> runs a delayed reply from the <strong>publishing</strong> channel. <Badge text="threads.crossAccountPlugs" variant="param" /> runs comments from <strong>other</strong> connected Threads channels. <Badge text="delayMs" variant="param" /> is in milliseconds (<code>120000</code> = two minutes).</p>
</Callout>

<Callout type="warning" title="Mentions scope">
<p>Cross-account Threads comments require the <Badge text="threads_manage_mentions" variant="default" /> OAuth scope on acting channels. Reconnect integrations after adding the scope in your Meta app. See <a href="/docs/cli-examples/threads">CLI examples — Threads</a> for Meta App Review notes.</p>
</Callout>

## Trigger a provider tool

> On my Threads integration, run the allow-listed tool to refresh channel metadata.

1. Call <Badge text="integrationSchema" variant="default" /> with <Badge text="platform: threads" variant="param" /> and read the <Badge text="tools" variant="param" /> array.
2. Call <Badge text="triggerTool" variant="default" />:

```json
{
  "integration": "<threads-integration-id>",
  "methodName": "<method-from-schema>",
  "data": {}
}
```

## Global plug (likes threshold)

> On my Threads channel, create a global plug that replies "Thanks for reading!" when a post gets 100 likes — use integrationList first.

Global plugs are channel-level rules that fire when a **published** post's likes reach a threshold. OpenQuok checks every six hours, up to three times per post.

1. Call <Badge text="integrationList" variant="default" /> and pick the Threads channel UUID.
2. Call <Badge text="plugsCatalog" variant="default" /> and read the <Badge text="autoPlugPost" variant="default" /> field names for <Badge text="threads" variant="default" />.
3. Call <Badge text="plugsUpsert" variant="default" />:

```json
{
  "integrationId": "<threads-integration-id>",
  "func": "autoPlugPost",
  "fields": [
    { "name": "likesAmount", "value": "100" },
    { "name": "post", "value": "Thanks for reading — like and follow for more!" }
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
<p><Badge text="schedulePostTool.settings" variant="param" /> handles <strong>per-post</strong> plugs at create time (<Badge text="threads.crossAccountPlugs" variant="param" />, <Badge text="threads.internalEngagementPlug" variant="param" />). <Badge text="plugsUpsert" variant="default" /> handles <strong>channel-level</strong> rules that watch likes on future publishes. See <a href="/docs/cli-examples/threads">CLI examples — Threads</a> for internal plug field shapes.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Meta Threads setup" description="Configure the Meta app, OAuth redirects, scopes, and tester roles" href="/docs/social-integration/threads" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for Threads reply chains and analytics" href="/docs/cli-examples/threads" />
<LinkCard title="Internal plugs" description="Same-account delayed engagement on one post" href="/docs/automations/internal-plugs" />
<LinkCard title="Cross-account plugs" description="Other connected channels comment after publish" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Global plugs" description="Channel rules when likes reach a threshold" href="/docs/automations/global-plugs" />
<LinkCard title="Tools reference — Global plugs" description="plugsCatalog, plugsList, plugsUpsert, plugsActivate, plugsDelete" href="/docs/mcp-references/tools#global-plugs" />
<LinkCard title="MCP tools reference" description="schedulePostTool and triggerTool input shapes" href="/docs/mcp-references/tools" />
</CardGrid>
