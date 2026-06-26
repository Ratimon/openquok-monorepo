---
title: Tools Reference
description: OpenQuok MCP v1 tools — integrationList, integrationSchema, triggerTool, and schedulePostTool.
order: 0
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

All tools run in the context of the workspace tied to your <Badge text="opo_" variant="default" /> token. They call the same backend services as <Badge text="/api/v1/public/*" variant="path" /> — lower latency, no HTTP loopback.

Parameter and response shapes follow the catalog in <DocsExternalLink href="https://docs.postiz.com/mcp/tools">Postiz MCP tools reference</DocsExternalLink>, adapted to OpenQuok's v1 surface. Image and video generation MCP tools from that catalog are not available yet.

## integrationList

List connected social channels for the authenticated workspace.

**Input:** none

**Output:**

```json
{
  "integrations": [
    {
      "id": "<integration-id>",
      "name": "My Threads account",
      "identifier": "threads"
    }
  ]
}
```

Use returned <Badge text="id" variant="param" /> values as <Badge text="integration" variant="param" /> in <Badge text="schedulePostTool" variant="default" /> and <Badge text="triggerTool" variant="default" />.

## integrationSchema

Return posting rules, character limits, compose settings schema, and allow-listed provider tools for a **platform identifier** (no connected channel required).

**Input:**

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="platform" variant="param" /> | string | Provider identifier, e.g. <Badge text="threads" variant="default" />, <Badge text="instagram" variant="default" /> |

**Output:**

```json
{
  "output": {
    "rules": "…",
    "maxLength": 500,
    "settings": { },
    "tools": []
  }
}
```

## triggerTool

Invoke an allow-listed provider method on a connected channel (same behavior as <Badge text="POST /public/integration-trigger/:id" variant="path" />).

**Input:**

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="integration" variant="param" /> | string | Connected channel UUID |
| <Badge text="methodName" variant="param" /> | string | Provider tool method name from <Badge text="integrationSchema" variant="default" /> |
| <Badge text="data" variant="param" /> | object | Optional payload passed to the provider method |

## schedulePostTool

Create or schedule posts across one or more connected channels.

**Input:**

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="type" variant="param" /> | <Badge text="draft" variant="default" /> \| <Badge text="schedule" variant="default" /> \| <Badge text="now" variant="default" /> | Draft, scheduled, or publish immediately |
| <Badge text="date" variant="param" /> | string | ISO-8601 time when <Badge text="type" variant="param" /> is <Badge text="schedule" variant="default" /> |
| <Badge text="socialPost" variant="param" /> | array | Per-channel payloads (see below) |

Each <Badge text="socialPost" variant="param" /> entry:

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="integration" variant="param" /> | string | Connected channel UUID |
| <Badge text="postsAndComments" variant="param" /> | string[] | Post body; additional strings become thread replies or comment chains per provider |
| <Badge text="settings" variant="param" /> | object | Provider-specific compose settings (same keys as REST <Badge text="providerSettingsByIntegrationId" variant="param" />) |
| <Badge text="attachments" variant="param" /> | string[] | Public image URLs — uploaded automatically before scheduling |

**Output:**

```json
{
  "output": [
    {
      "postId": "<post-id>",
      "integration": "<integration-id>"
    }
  ]
}
```

<Callout type="tip" title="Thread platforms">
<p>On <Badge text="threads" variant="default" /> and <Badge text="x" variant="default" />, the first <Badge text="postsAndComments" variant="param" /> string is the root post; remaining strings map to reply chains. On other providers, extra strings map to provider-specific reply buckets.</p>
</Callout>

### Example input

```json
{
  "type": "schedule",
  "date": "2026-06-26T14:00:00.000Z",
  "socialPost": [
    {
      "integration": "<integration-id>",
      "postsAndComments": ["Hello from MCP!"],
      "attachments": ["https://example.com/photo.jpg"]
    }
  ]
}
```

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and the four v1 tools" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples" description="End-to-end agent prompts for scheduling and channel tools" href="/docs/mcp-examples" />
<LinkCard title="Supported social channels" description="Per-provider settings for Threads and Instagram" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="Posts APIs" description="REST equivalent of schedulePostTool" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="REST list and trigger endpoints" href="/docs/apis-integrations" />
</CardGrid>
