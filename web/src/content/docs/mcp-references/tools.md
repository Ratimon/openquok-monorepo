---
title: Tools Reference
description: OpenQuok MCP tools — channels, posts, plugs, analytics, directory launch profiles, and directory SEO.
order: 1
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

All tools run in the context of the workspace tied to your <Badge text="opo_" variant="default" /> token. They call the same backend services as <Badge text="/api/v1/public/*" variant="path" /> — lower latency, no HTTP loopback.

A typical social workflow: <Badge text="integrationList" variant="default" /> → <Badge text="schedulePostTool" variant="default" /> → <Badge text="postsList" variant="default" /> / <Badge text="postsStatus" variant="default" /> / <Badge text="postsReschedule" variant="default" /> → <Badge text="analyticsPost" variant="default" /> → <Badge text="plugsUpsert" variant="default" />. For directory launch (My Products, not social channels): <Badge text="directoryProfilesList" variant="default" /> (<Badge text="mainOnly" variant="param" />) → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryProfilesUpdate" variant="default" /> when filling copy → <Badge text="directoryListingSummary" variant="default" /> → optional <Badge text="directorySeoOverview" variant="default" />. Image and video generation MCP tools from other catalogs are not available yet.

## Channel discovery

### groupList

List business profiles (API: customers) for the authenticated workspace. Use a profile's <Badge text="id" variant="param" /> with <Badge text="integrationList" variant="default" /> when you only need channels in one profile.

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
| <Badge text="group" variant="param" /> | string | No | Business profile id (customer) from <Badge text="groupList" variant="default" />; when set, only channels in that profile are returned |

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

## Posts management

### postsList

List posts in a date window for the workspace.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="start" variant="param" /> | string | No | Start ISO timestamp; default is 30 local calendar days before today |
| <Badge text="end" variant="param" /> | string | No | End ISO timestamp; default is 30 local calendar days after today |
| <Badge text="integrationIds" variant="param" /> | string[] | No | Filter to specific connected channel ids |
| <Badge text="customerGroupId" variant="param" /> | string | No | Filter to a business profile id from <Badge text="groupList" variant="default" /> |

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

### postsReschedule

Move a post group to a new publish time. Pass any post row id from <Badge text="postsList" variant="default" /> — the whole group moves together.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="postId" variant="param" /> | string | Yes | Post row id from <Badge text="postsList" variant="default" /> or <Badge text="schedulePostTool" variant="default" /> |
| <Badge text="scheduledAt" variant="param" /> | string | Yes | New publish time (ISO-8601) |
| <Badge text="action" variant="param" /> | <Badge text="update" variant="default" /> \| <Badge text="schedule" variant="default" /> | No | <Badge text="update" variant="default" /> (default) moves <Badge text="publishDate" variant="param" /> only and preserves each row's state; <Badge text="schedule" variant="default" /> re-queues publishing and clears <Badge text="releaseId" variant="param" />, <Badge text="releaseUrl" variant="param" />, and errors |
| <Badge text="republish" variant="param" /> | boolean | No | Required <Badge text="true" variant="default" /> when <Badge text="action" variant="param" /> is <Badge text="schedule" variant="default" /> and the group already has published rows |

**Output:**

```json
{
  "success": true,
  "data": {
    "postGroup": "9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33",
    "posts": [
      {
        "id": "5b3c1d2e-9a3f-4e6b-bb12-2c0a5f1a90a1",
        "state": "QUEUE",
        "publishDate": "2026-06-15T14:30:00.000Z",
        "postGroup": "9a0a1b2c-3d4e-4f5a-9b8c-aa11bb22cc33"
      }
    ]
  }
}
```

<Callout type="tip">
<p><Badge text="postsStatus" variant="default" /> flips draft ↔ scheduled <strong>without</strong> changing the stored publish time. Use <Badge text="postsReschedule" variant="default" /> when the slot itself should move.</p>
</Callout>

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

## Directory launch

Requires a workspace plan with directory launch enabled. Tools call the same services as <Badge text="/public/directory-launch/*" variant="path" />. They manage **My Products** business profiles and browser-extension autofill — not <Badge text="schedulePostTool" variant="default" />.

<Callout type="note" title="Main profile vs directory variant">
<p>A <strong>main</strong> profile is your default product record. A <strong>directory variant</strong> is a per-site copy (for example <Badge text="peerpush" variant="default" /> or <Badge text="uneed" variant="default" />) linked to that main profile. Use <Badge text="directoryVariantsEnsure" variant="default" /> to create or open the variant; use <Badge text="directoryProfilesUpdate" variant="default" /> to fill or change copy on the main or variant row. OpenQuok does not click submit on directory sites — you launch with the extension after readiness looks good.</p>
</Callout>

| If the user asks… | Start with |
| --- | --- |
| Create or open a PeerPush / Uneed profile | <Badge text="directoryProfilesList" variant="default" /> (<Badge text="mainOnly: true" variant="param" />) → <Badge text="directoryVariantsEnsure" variant="default" /> |
| Fill or update tagline, description, or site fields | <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> |
| What is missing before I launch? | <Badge text="directoryListingSummary" variant="default" /> |
| Which launch paths exist? | <Badge text="directoryDestinationsList" variant="default" /> |

Agent prompt recipes: <a href="/docs/mcp-examples/peerpush">MCP examples — PeerPush</a>, <a href="/docs/mcp-examples/uneed">Uneed</a>.

### directoryDestinationsList

Published directory launch destinations (read-only catalog). Returns provider slugs, <Badge text="directorySiteKey" variant="param" /> values such as <Badge text="peerpush" variant="default" /> and <Badge text="uneed" variant="default" />, and start URLs. Does not submit on directory sites.

**Input:** none

**Output:** array of destination rows (provider slug, site key, start URL).

### directoryProfilesList

List business profiles for directory launch (not social <Badge text="integrationList" variant="default" /> channels). Use <Badge text="mainOnly: true" variant="param" /> before <Badge text="directoryVariantsEnsure" variant="default" /> to resolve the main <Badge text="productProfileId" variant="param" />.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="integrationCustomerId" variant="param" /> | string | No | Channel group id from <Badge text="groupList" variant="default" /> |
| <Badge text="mainOnly" variant="param" /> | boolean | No | When <Badge text="true" variant="default" />, exclude per-directory variants |

**Output:** array of profile DTOs.

### directoryProfilesGet

Load one main or variant profile: <Badge text="profileData" variant="param" />, <Badge text="directorySiteKey" variant="param" />, <Badge text="similarityToMainPercent" variant="param" /> on variants.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="productProfileId" variant="param" /> | string | Yes | Main or variant product profile id |

### directoryProfilesCreate

Create a **new main** business profile (organization comes from the token). Does not create per-site variants — call <Badge text="directoryVariantsEnsure" variant="default" /> afterward.

**Input:** <Badge text="name" variant="param" /> (required) plus optional <Badge text="integrationCustomerId" variant="param" />, <Badge text="tagline" variant="param" />, <Badge text="description" variant="param" />, <Badge text="websiteUrl" variant="param" />, <Badge text="logoUrl" variant="param" />, <Badge text="profileData" variant="param" /> object.

### directoryProfilesUpdate

Patch copy on a main or directory-variant profile (<Badge text="tagline" variant="param" />, <Badge text="description" variant="param" />, <Badge text="websiteUrl" variant="param" />, <Badge text="logoUrl" variant="param" />, <Badge text="profileData" variant="param" />). Use when the user asks to fill or revise tailored fields. Requires <Badge text="productProfileId" variant="param" /> plus at least one field to change.

### directoryVariantsEnsure

Create or return a per-directory copy of a main profile (idempotent). Typical flow: list mains with <Badge text="mainOnly" variant="param" />, then pass <Badge text="mainProductProfileId" variant="param" /> and <Badge text="directorySiteKey" variant="param" /> (<Badge text="peerpush" variant="default" />, <Badge text="uneed" variant="default" />, …). Copies the main profile on first create. Does not submit on the directory site.

**Input:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| <Badge text="mainProductProfileId" variant="param" /> | string | Yes | Main profile id (not a variant id) |
| <Badge text="directorySiteKey" variant="param" /> | string | Yes | Kebab-case site key |
| <Badge text="name" variant="param" /> | string | No | Optional variant display name |

**Output:** profile DTO plus <Badge text="created" variant="param" /> boolean.

### directoryListingSummary

Read-only launch readiness per published destination: submission status and missing profile fields before extension autofill.

**Input:** <Badge text="productProfileId" variant="param" /> (required) — main or variant id.

### directorySubmissionsList

Read-only submission history (listing URLs, completion). Optional <Badge text="productProfileId" variant="param" /> and <Badge text="destinationId" variant="param" /> filters.

## Directory SEO

Requires directory SEO on the plan. Metrics are **cached** — each domain metric includes <Badge text="checkedAt" variant="param" />; overview responses include <Badge text="manualRefreshAvailableAt" variant="param" /> before calling <Badge text="directorySeoRefresh" variant="default" />.

<Callout type="note">
<p>Directory SEO tools mirror <Badge text="/public/directory-seo/*" variant="path" />. Treat <Badge text="checkedAt" variant="param" /> as the cache timestamp, not <Badge text="updatedAt" variant="param" />.</p>
</Callout>

### directorySeoOverview

Cached directory SEO workspace overview for a **main** product profile (product domain metric and competitors). Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

**Input:** <Badge text="productProfileId" variant="param" /> (required).

### directorySeoHistory

Historical rating points for the product domain and tracked competitors.

**Input:** <Badge text="productProfileId" variant="param" /> (required), optional <Badge text="days" variant="param" /> (default <Badge text="90" variant="param" />, max <Badge text="366" variant="param" />).

### directorySeoRefresh

Manual refresh when cooldown allows (or <Badge text="force" variant="param" /> when supported).

**Input:** <Badge text="productProfileId" variant="param" /> (required), optional <Badge text="force" variant="param" /> boolean.

### directorySeoCompetitorsAdd

Add a competitor domain (workspace competitor quota applies).

**Input:** <Badge text="domain" variant="param" /> (required), optional <Badge text="label" variant="param" /> and <Badge text="sortOrder" variant="param" />.

### directorySeoCompetitorsRemove

**Input:** <Badge text="domain" variant="param" /> (required).

### directorySeoCompetitorsUpdate

**Input:** <Badge text="domain" variant="param" /> (required), <Badge text="label" variant="param" /> (nullable).

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and typical list → schedule → manage workflows" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples" description="Agent prompts for scheduling, plugs, analytics, and cross-account Threads" href="/docs/mcp-examples" />
<LinkCard title="Provider settings" description="Per-provider settings for Threads, X, and LinkedIn" href="/docs/public-api-providers" />
<LinkCard title="Posts APIs" description="REST equivalent of schedulePostTool and posts management" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="REST list, trigger, and global plug endpoints" href="/docs/apis-integrations" />
</CardGrid>
