---
title: Tools Reference
description: OpenQuok MCP tools — list channels, schedule and manage posts, configure plugs, and read analytics from AI agent clients.
order: 1
lastUpdated: 2026-09-10
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

All tools run in the context of the workspace tied to your <Badge text="opo_" variant="default" /> token. They call the same backend services as <Badge text="/api/v1/public/*" variant="path" /> — lower latency, no HTTP loopback.

A typical agent workflow: <Badge text="integrationList" variant="default" /> → <Badge text="schedulePostTool" variant="default" /> → <Badge text="postsList" variant="default" /> / <Badge text="postsStatus" variant="default" /> → <Badge text="analyticsPost" variant="default" /> → <Badge text="plugsUpsert" variant="default" />. Image and video generation MCP tools from other catalogs are not available yet.

## Channel discovery

### groupList

List channel groups (customers) for the authenticated workspace. Use a group's <Badge text="id" variant="param" /> with <Badge text="integrationList" variant="default" /> when you only need channels in one group.

**Input:** none

**Output:**

```json
{
  "groups": [
    {
      "id": "<customer-group-id>",
      "name": "Client A"
    }
  ]
}
```

### integrationList

List connected social channels for the authenticated workspace.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="group" variant="param" /> | string | No | Channel group id from <Badge text="groupList" variant="default" />; when set, only channels in that group are returned |

**Output:**

```json
{
  "integrations": [
    {
      "id": "<integration-id>",
      "name": "My Threads account",
      "identifier": "threads",
      "platform": "threads",
      "picture": "https://example.com/profile.jpg",
      "disabled": false,
      "profile": "https://www.threads.net/@handle",
      "customer": { "id": "<customer-group-id>", "name": "Client A" }
    }
  ]
}
```

Use returned <Badge text="id" variant="param" /> values as <Badge text="integration" variant="param" />, <Badge text="integrationId" variant="param" />, or acting-channel UUIDs in <Badge text="schedulePostTool" variant="default" /> settings. <Badge text="platform" variant="param" /> mirrors <Badge text="identifier" variant="param" /> for compatibility with agents trained on other MCP catalogs.

### integrationSchema

Return posting rules, character limits, compose settings schema, and allow-listed provider tools for a **platform identifier** (no connected channel required).

**Input:**

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="platform" variant="param" /> | string | Provider identifier, e.g. <Badge text="threads" variant="default" />, <Badge text="instagram" variant="default" /> |
| <Badge text="isPremium" variant="param" /> | boolean | Optional; when the provider tiers character limits by plan, pass whether the workspace is premium (defaults to <Badge text="false" variant="default" />) |

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

### triggerTool

Invoke an allow-listed provider method on a connected channel (same behavior as <Badge text="POST /public/integration-trigger/:id" variant="path" />).

**Input:**

| Field | Type | Description |
| --- | --- | --- |
| <Badge text="integration" variant="param" /> | string | Connected channel UUID (alias for <Badge text="integrationId" variant="param" />) |
| <Badge text="integrationId" variant="param" /> | string | Connected channel UUID from <Badge text="integrationList" variant="default" /> |
| <Badge text="methodName" variant="param" /> | string | Provider tool method name from <Badge text="integrationSchema" variant="default" /> |
| <Badge text="data" variant="param" /> | object | Optional payload passed to the provider method |
| <Badge text="dataSchema" variant="param" /> | array | Optional key-value pairs (<Badge text="key" variant="param" />, <Badge text="value" variant="param" />) — alternative to <Badge text="data" variant="param" /> |

## Scheduling

### schedulePostTool

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
| <Badge text="integration" variant="param" /> | string | Connected channel UUID (publishing channel) |
| <Badge text="postsAndComments" variant="param" /> | string[] | Main post body; additional strings are **same-account** reply chains only — not cross-account plugs |
| <Badge text="settings" variant="param" /> | object | Provider compose settings on the **publisher** (same keys as REST <Badge text="providerSettingsByIntegrationId" variant="param" />) |
| <Badge text="attachments" variant="param" /> | string[] | Public image or video URLs — uploaded automatically before scheduling |

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

<Callout type="tip">
<p>On <Badge text="threads" variant="default" /> and <Badge text="x" variant="default" />, the first <Badge text="postsAndComments" variant="param" /> string is the main thread; remaining strings map to same-account reply chains. Cross-account comments or reposts belong in <Badge text="settings" variant="param" /> — <Badge text="threads.crossAccountPlugs" variant="param" />, <Badge text="x.crossAccountPlugs" variant="param" />, or <Badge text="linkedin.crossAccountPlugs" variant="param" /> — with acting channel UUIDs from <Badge text="integrationList" variant="default" />. See <a href="/docs/mcp-examples/threads">MCP examples — Threads</a> and <a href="/docs/cli-examples/threads">CLI examples — Threads</a>.</p>
</Callout>

#### Example input

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

#### Provider settings on the publisher

Put per-channel compose options in <Badge text="settings" variant="param" /> on the **publishing** <Badge text="socialPost" variant="param" /> entry. Keys match REST <Badge text="providerSettingsByIntegrationId[integrationId]" variant="param" /> — for example <Badge text="threads.internalEngagementPlug" variant="param" /> for a same-account delayed engagement reply, or nested <Badge text="threads.crossAccountPlugs" variant="param" /> for comments from another connected Threads channel.

| Setting bucket | Use for |
| --- | --- |
| <Badge text="threads.internalEngagementPlug" variant="param" /> | Same-account delayed engagement reply after publish |
| <Badge text="threads.crossAccountPlugs" variant="param" /> | Comments from other Threads channels in the workspace |
| <Badge text="x.crossAccountPlugs" variant="param" /> | Reposts from other X channels after publish |
| <Badge text="linkedin.crossAccountPlugs" variant="param" /> | Comments or reshares from other LinkedIn channels |

Full field shapes: <a href="/docs/cli-examples/threads">CLI examples — Threads</a>, <a href="/docs/cli-examples/x">CLI examples — X</a>, <a href="/docs/cli-examples/linkedin">CLI examples — LinkedIn</a>.

### uploadFromUrl

Fetch a public HTTPS image or video URL into workspace media. Returns <Badge text="id" variant="param" /> and <Badge text="path" variant="param" /> for <Badge text="schedulePostTool" variant="default" /> media or compose settings.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="url" variant="param" /> | string | Yes | Public <Badge text="https://" variant="new" /> URL to fetch and store |

**Output:**

```json
{
  "id": "<media-id>",
  "path": "org/<media-id>.jpg"
}
```

<Callout type="tip">
<p>Alternatively, pass public URLs on <Badge text="schedulePostTool.attachments" variant="param" /> — OpenQuok uploads them automatically. Use <Badge text="uploadFromUrl" variant="default" /> when you need the <Badge text="id" variant="param" /> / <Badge text="path" variant="param" /> pair for provider settings that reference media by id.</p>
</Callout>

## Post management

### postsList

List posts in a date window for the workspace.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="start" variant="param" /> | string | No | Start ISO timestamp; default is 30 local calendar days before today |
| <Badge text="end" variant="param" /> | string | No | End ISO timestamp; default is 30 local calendar days after today |
| <Badge text="integrationIds" variant="param" /> | string[] | No | Filter to specific connected channel ids |
| <Badge text="customerGroupId" variant="param" /> | string | No | Filter to a channel group id from <Badge text="groupList" variant="default" /> |

**Output:**

```json
{
  "success": true,
  "data": {
    "posts": []
  }
}
```

### postsFindSlot

Suggest a free schedule slot for the workspace or a specific connected channel.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="integrationId" variant="param" /> | string | No | Connected channel id; omit to consider all channels |

**Output:**

```json
{
  "success": true,
  "data": {
    "date": "2026-06-27T14:00:00.000Z"
  }
}
```

### postsStatus

Flip a post row between draft and scheduled at the stored publish time.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id from <Badge text="postsList" variant="default" /> or <Badge text="schedulePostTool" variant="default" /> |
| <Badge text="status" variant="param" /> | <Badge text="draft" variant="default" /> \| <Badge text="schedule" variant="default" /> \| <Badge text="scheduled" variant="default" /> | Yes | <Badge text="schedule" variant="default" /> and <Badge text="scheduled" variant="default" /> both mean scheduled |

**Output:**

```json
{
  "success": true,
  "data": {
    "postGroup": "<post-group-id>",
    "posts": []
  }
}
```

### postsReviewTodo

Set or update the review-todo note on a post row.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id |
| <Badge text="note" variant="param" /> | string \| null | No | Kanban review note; pass <Badge text="null" variant="default" /> to clear |
| <Badge text="isReviewed" variant="param" /> | boolean | No | Mark the review todo as complete |
| <Badge text="kanbanManualFinishAcknowledged" variant="param" /> | boolean | No | Acknowledge manual kanban finish for the post group |

**Output:**

```json
{
  "success": true,
  "data": {
    "posts": []
  }
}
```

### postsDelete

Delete a post row by id.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id to delete |

**Output:**

```json
{
  "success": true,
  "data": {}
}
```

### postsMissing

List provider candidates when a published post is missing <Badge text="release_id" variant="param" /> (needed before per-post analytics).

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id with <Badge text="release_id" variant="param" /> missing |

**Output:**

```json
{
  "success": true,
  "data": {
    "items": []
  }
}
```

### postsConnect

Link a post row to a provider <Badge text="release_id" variant="param" /> for per-post analytics.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id |
| <Badge text="releaseId" variant="param" /> | string | Yes | Provider release id from <Badge text="postsMissing" variant="default" /> candidates |

**Output:**

```json
{
  "success": true,
  "data": {}
}
```

## Analytics

### analyticsPlatform

Platform-level metrics for a connected channel.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="integrationId" variant="param" /> | string | Yes | Connected channel id from <Badge text="integrationList" variant="default" /> |
| <Badge text="days" variant="param" /> | <Badge text="7" variant="param" /> \| <Badge text="30" variant="param" /> \| <Badge text="90" variant="param" /> | Yes | Lookback window in days |

**Output:**

```json
{
  "success": true,
  "data": {}
}
```

### analyticsPost

Per-post metrics for a published post row. Returns empty data for drafts.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Published post row id |
| <Badge text="days" variant="param" /> | <Badge text="7" variant="param" /> \| <Badge text="30" variant="param" /> \| <Badge text="90" variant="param" /> | Yes | Lookback window in days |

**Output:**

```json
{
  "success": true,
  "data": {}
}
```

## Global plugs

Global plugs are channel-level rules that fire when a published post's likes cross a threshold. Per-post plugs are set on <Badge text="schedulePostTool.settings" variant="param" /> instead — <a href="/docs/automations/internal-plugs">internal plugs</a> for same-account engagement and <a href="/docs/automations/cross-account-plugs">cross-account plugs</a> for comments or reposts from other connected channels. See <a href="/docs/automations/global-plugs">Global plugs</a> and MCP examples for <a href="/docs/mcp-examples/threads">Threads</a>, <a href="/docs/mcp-examples/x">X</a>, and <a href="/docs/mcp-examples/linkedin">LinkedIn</a>.

### plugsCatalog

List global plug types and field names per provider. No input.

**Output:** catalog of plug definitions with <Badge text="identifier" variant="param" />, <Badge text="methodName" variant="param" />, and <Badge text="fields" variant="param" /> arrays.

### plugsList

List saved global plug rules on a connected channel.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="integrationId" variant="param" /> | string | Yes | Connected channel id from <Badge text="integrationList" variant="default" /> |

**Output:**

```json
{
  "plugs": []
}
```

### plugsUpsert

Create or update a global plug rule on a connected channel.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="integrationId" variant="param" /> | string | Yes | Connected channel id |
| <Badge text="func" variant="param" /> | string | Yes | Plug function name from <Badge text="plugsCatalog" variant="default" /> (e.g. <Badge text="autoPlugPost" variant="default" />) |
| <Badge text="fields" variant="param" /> | array | Yes | Field values as <Badge text="name" variant="param" /> and <Badge text="value" variant="param" />or  pairs matching the catalog |
| <Badge text="plugId" variant="param" /> | string | No | Existing plug row id to update instead of creating a duplicate |

**Output:** saved plug row.

### plugsActivate

Enable or disable a saved global plug rule.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="plugId" variant="param" /> | string | Yes | Plug row id from <Badge text="plugsList" variant="default" /> |
| <Badge text="activated" variant="param" /> | boolean | Yes | <Badge text="true" variant="default" /> to enable, <Badge text="false" variant="default" /> to disable |

**Output:** updated plug row.

### plugsDelete

Delete a saved global plug rule.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="plugId" variant="param" /> | string | Yes | Plug row id from <Badge text="plugsList" variant="default" /> |

**Output:** deletion confirmation.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and typical list → schedule → manage workflows" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples" description="Agent prompts for scheduling, plugs, analytics, and cross-account Threads" href="/docs/mcp-examples" />
<LinkCard title="Supported social channels" description="Per-provider settings for Threads, X, and LinkedIn" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="Posts APIs" description="REST equivalent of schedulePostTool and post management" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="REST list, trigger, and global plug endpoints" href="/docs/apis-integrations" />
</CardGrid>
