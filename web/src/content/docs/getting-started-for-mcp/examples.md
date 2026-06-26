---
title: MCP Examples
description: Example OpenQuok MCP agent workflows — list channels, schedule to Threads, and trigger provider tools.
order: 3
lastUpdated: 2026-06-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## List connected channels

After connecting your MCP client, ask:

> List my connected social media accounts

The agent calls <Badge text="integrationList" variant="default" /> and returns channel names, provider identifiers, and UUIDs. Save the UUID you need for scheduling.

## Schedule a single post

> Schedule a post to my Threads account tomorrow at 2pm UTC saying "Hello from my AI assistant" — use integrationList first to find the right channel ID.

The agent should:

1. Call <Badge text="integrationList" variant="default" /> and pick the Threads channel.
2. Optionally call <Badge text="integrationSchema" variant="default" /> with <Badge text="platform: threads" variant="param" /> to check character limits.
3. Call <Badge text="schedulePostTool" variant="default" /> with <Badge text="type: schedule" variant="param" /> and an ISO <Badge text="date" variant="param" />.

```json
{
  "type": "schedule",
  "date": "2026-06-26T14:00:00.000Z",
  "socialPost": [
    {
      "integration": "<threads-integration-id>",
      "postsAndComments": ["Hello from my AI assistant"]
    }
  ]
}
```

## Threads reply chain

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

## Multi-channel blast

> Publish the same announcement to all my connected channels right now.

```json
{
  "type": "now",
  "socialPost": [
    {
      "integration": "<integration-id-1>",
      "postsAndComments": ["We just shipped a new feature!"]
    },
    {
      "integration": "<integration-id-2>",
      "postsAndComments": ["We just shipped a new feature!"]
    }
  ]
}
```

Use <Badge text="integrationList" variant="default" /> to build one <Badge text="socialPost" variant="param" /> entry per channel.

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

<Callout type="warning" title="Rate limits">
<p>Public API and MCP share the same <strong>30 requests per hour</strong> limit per token. Batch multi-channel schedules into one <Badge text="schedulePostTool" variant="default" /> call when possible.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Tools reference" description="Full input tables for schedulePostTool and triggerTool" href="/docs/getting-started-for-mcp/tools" />
<LinkCard title="Client setup" description="Connect Cursor, Claude Code, or Codex to OpenQuok MCP" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="Payload Wizard" description="Generate REST payloads visually when you prefer curl or the SDK" href="/account/payload-wizard" />
<LinkCard title="Agent guides" description="CLI skill setup for OpenClaw and Hermes when MCP is not available" href="/docs/agent-guides" />
</CardGrid>
