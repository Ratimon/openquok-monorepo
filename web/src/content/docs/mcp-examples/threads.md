---
title: Meta Threads
description: OpenQuok MCP examples for Meta Threads — scheduled posts, reply chains, and provider tools.
order: 3
lastUpdated: 2026-06-26
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

## Related

<CardGrid>
<LinkCard title="Meta Threads setup" description="Configure the Meta app, OAuth redirects, scopes, and tester roles" href="/docs/social-integration/threads" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for Threads reply chains and analytics" href="/docs/cli-examples/threads" />
<LinkCard title="MCP tools reference" description="schedulePostTool and triggerTool input shapes" href="/docs/mcp-references/tools" />
</CardGrid>
