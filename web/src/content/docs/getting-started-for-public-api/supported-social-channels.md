---
title: Supported social channels
description: Social channels Openquok currently supports — Meta Threads and Instagram (Business + Standalone) — plus the per-channel settings shape behind the public API.
order: 1
lastUpdated: 2026-07-19
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Terminology

<Callout type="note" title="Channel vs integration">
<p>The Openquok UI/dashboard uses the term <strong>channel</strong>, while the API and SDK use <strong>integration</strong>. They refer to the same thing — a single connected social account inside a workspace.</p>
</Callout>

## Overview

Openquok currently ships with **3 social provider integrations** behind a single create-post API. Each post payload identifies its target channels through the UUIDs in <Badge text="integrationIds" variant="param" />, and any per-channel tuning lives under <Badge text="providerSettingsByIntegrationId" variant="param" /> keyed by those same UUIDs. The provider's short identifier (for example <Badge text="threads" variant="default" /> or <Badge text="instagram-standalone" variant="default" />) is used **only** at OAuth start time, when you tell <a href="/docs/apis-integrations/connect">Connect Channel</a> *which* platform to authorize.

## Providers (3 total)

| Provider | Identifier | OAuth start route | Setup guide |
| --- | --- | --- | --- |
| Meta Threads | <Badge text="threads" variant="default" /> | <Badge text="GET /api/v1/public/social/threads" variant="default" /> | <a href="/docs/social-integration/threads">Threads</a> |
| Instagram (Business, FB-linked) | <Badge text="instagram-business" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-business" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |
| Instagram (Standalone, IG Login) | <Badge text="instagram-standalone" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-standalone" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |

The **Identifier** column matches the <Badge text=":integration" variant="param" /> path parameter on <a href="/docs/apis-integrations/connect">Connect Channel (OAuth)</a> and the <Badge text="identifier" variant="param" /> field returned by <a href="/docs/apis-integrations/integration-settings">Channel settings &amp; tools</a> for each connected channel. When you reference a channel inside a post payload, use the channel's **UUID** — not its short identifier — in <Badge text="integrationIds" variant="param" /> and as the keys of <Badge text="providerSettingsByIntegrationId" variant="param" />.

<Callout type="note" title="More providers will land in the same shape">
<p>The provider catalog is sourced from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/integrationManager.ts"><Badge text="backend/integrations/integrationManager.ts" variant="path" /></DocsExternalLink>. Re-fetching <Badge text="GET /api/v1/public/integrations" variant="default" /> is the safest way to see what's available in any given Openquok deployment.</p>
</Callout>

## Per-channel settings

<Badge text="providerSettingsByIntegrationId" variant="param" /> is a JSON map keyed by integration UUID. Each value is an object whose shape depends on the provider behind that channel.

To make it easy to scan what each platform needs — and to keep this page maintainable as we add more providers — the rest of this section splits providers into two groups: those that **need** provider-specific fields, and those that don't. When a new provider ships, add a row to whichever table it belongs in (and an `####` field reference below if it has custom settings) — no new tabs, no per-provider sub-pages.

### Platforms with custom settings (2)

These providers accept (or require) a per-channel <Badge text="providerSettingsByIntegrationId[<channel-uuid>]" variant="param" /> object with provider-specific fields:

| Platform | Identifier | Key settings |
| --- | --- | --- |
| Instagram (Business, FB-linked) | <Badge text="instagram-business" variant="default" /> | <Badge text="post_type" variant="param" />, <Badge text="collaborators" variant="param" />, <Badge text="is_trial_reel" variant="param" />, <Badge text="graduation_strategy" variant="param" /> |
| Instagram (Standalone, IG Login) | <Badge text="instagram-standalone" variant="default" /> | <Badge text="post_type" variant="param" />, <Badge text="collaborators" variant="param" />, <Badge text="is_trial_reel" variant="param" />, <Badge text="graduation_strategy" variant="param" /> |

#### Instagram (Business + Standalone)

Both Instagram variants accept the **same** per-channel settings; pick the variant that matches how the channel was originally connected.

| Field | Type | Notes |
| --- | --- | --- |
| <Badge text="post_type" variant="param" /> | string | Set to `"story"` to publish as a Stories item. Omit (or any other value) for a regular feed post / reel. |
| <Badge text="is_trial_reel" variant="param" /> | boolean | When `true`, the upload is created as a Trial Reel (videos only). |
| <Badge text="graduation_strategy" variant="param" /> | string | Used only with `is_trial_reel: true`. Defaults to `"MANUAL"`. |
| <Badge text="collaborators" variant="param" /> | array of objects | IG usernames invited as collaborators (feed posts and reels only — **not** stories). Each item carries a <Badge text="label" variant="param" /> (string) field with the username. |

Instagram requires **at least one** image or video for any post with `status: "scheduled"` — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/instagram/instagramStandaloneProvider.ts"><Badge text="instagramStandaloneProvider.ts" variant="path" /></DocsExternalLink>. Captions are capped at <Badge text="2200 chars" variant="default" />.

### Platforms without custom settings (1)

These providers don't need a <Badge text="providerSettingsByIntegrationId" variant="param" /> entry — just include the channel UUID in <Badge text="integrationIds" variant="param" /> and send a top-level <Badge text="body" variant="param" /> (plus optional <Badge text="media" variant="param" />):

| Platform | Identifier |
| --- | --- |
| Meta Threads | <Badge text="threads" variant="default" /> |

Threads is hard-capped at <Badge text="500 chars" variant="default" /> per item — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/threadsProvider.ts"><Badge text="backend/integrations/providers/threadsProvider.ts" variant="path" /></DocsExternalLink>.

### Cross-provider features

Some optional features apply across **multiple** providers without being a "platform setting" of any one of them. They live on the same <Badge text="providerSettingsByIntegrationId[<channel-uuid>]" variant="param" /> object, but their shape is the same wherever they're supported.

#### Follow-up replies

Both Threads and Instagram support an optional **follow-up reply / comment** chain that is posted from the same channel after the original goes live. The bucket key on <Badge text="providerSettingsByIntegrationId[<channel-uuid>]" variant="param" /> differs per platform, but the item shape is identical (see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/posts/CreateSocialPost.presenter.svelte.ts"><Badge text="CreateSocialPost.presenter.svelte.ts" variant="path" /></DocsExternalLink>).

| Provider | Bucket key | Item shape |
| --- | --- | --- |
| Meta Threads | <Badge text="threads.replies" variant="param" /> | array of objects with <Badge text="message" variant="param" /> (string) and <Badge text="delaySeconds" variant="param" /> (number) — replies on the original thread |
| Instagram (Business + Standalone) | <Badge text="instagram.replies" variant="param" /> | array of objects with <Badge text="message" variant="param" /> (string) and <Badge text="delaySeconds" variant="param" /> (number) — comments threaded under the published media |

See [Schedule a Threads post with a follow-up reply](#schedule-a-threads-post-with-a-follow-up-reply) below for the exact JSON.

#### Internal plugs

**Internal plugs** boost engagement after publish — from the same channel or from other connected channels in the workspace. Configure them on <Badge text="providerSettingsByIntegrationId[<channel-uuid>]" variant="param" /> when you call <Badge text="POST /public/posts" variant="path" /> (or <Badge text="openquok posts:create" variant="default" />).

| Provider | Bucket / plug id | What it does |
| --- | --- | --- |
| Meta Threads | <Badge text="threads.internalEngagementPlug" variant="param" /> | Same-account reply after follow-up replies complete |
| Meta Threads | <Badge text="threads-cross-account-comment" variant="param" /> via <Badge text="crossAccountPlugs" variant="param" /> | Comment from other Threads channels |
| X | <Badge text="x-repost-post-users" variant="param" /> via <Badge text="crossAccountPlugs" variant="param" /> | Repost from other X channels |
| LinkedIn / LinkedIn Page | <Badge text="linkedin-add-comment" variant="param" />, <Badge text="linkedin-repost-post-users" variant="param" /> | Cross-account comment or reshare |

Example — same-account Threads engagement plug on create:

```json
{
  "providerSettingsByIntegrationId": {
    "YOUR_THREADS_CHANNEL_UUID": {
      "threads": {
        "internalEngagementPlug": {
          "enabled": true,
          "message": "Thanks for reading — link in bio!",
          "delaySeconds": 300
        }
      }
    }
  }
}
```

For cross-account plugs, each entry in <Badge text="crossAccountPlugs" variant="param" /> needs <Badge text="plugName" variant="param" />, <Badge text="integrationIds" variant="param" /> (acting channels — not the publisher), and plug-specific <Badge text="fields" variant="param" />. See <a href="/docs/cli-examples/threads">Threads CLI examples</a> and <a href="/docs/cli-examples/x">X CLI examples</a>.

<Callout type="note" title="Global plugs are separate">
<p><strong>Global plugs</strong> (auto-repost or auto-reply when likes cross a threshold) are channel-level rules — not part of the create-post payload. Configure them with <Badge text="GET /public/plug-catalog" variant="path" /> and <Badge text="POST /public/integration-plugs/:id" variant="path" />, or via <Badge text="openquok plugs:*" variant="default" /> commands. See <a href="/docs/getting-started-for-public-api#plugs">Public API → Plugs</a>.</p>
</Callout>

<Callout type="note" title="Discover the exact shape with the Payload Wizard">
<p>Rather than memorizing field names, fill out a real post in the <a href="/account/payload-wizard">Payload Wizard</a>, click <strong>Copy scheduled payload</strong>, and inspect the <Badge text="providerSettingsByIntegrationId" variant="param" /> object — it is always the source of truth for what the backend currently accepts (and the cleanest way to spot the difference between platform-specific settings and cross-provider features like follow-up replies).</p>
</Callout>

## Quick examples

All examples target <Badge text="POST /api/v1/public/posts" variant="default" />, sent with the <Badge text="Authorization" variant="default" /> header described in <a href="/docs/getting-started-for-public-api#authentication">Authentication</a>. Replace each <Badge text="YOUR_..._UUID" variant="param" /> placeholder with a real channel UUID from <Badge text="GET /api/v1/public/integrations" variant="default" />.

### Schedule a text post to Threads

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Hello from the Openquok API!",
    "scheduledAt": "2026-05-15T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["YOUR_THREADS_CHANNEL_UUID"],
    "isGlobal": true
  }'
```

### Upload an image and post it to Instagram

Instagram needs publicly reachable media, so first upload through <Badge text="POST /api/v1/public/upload" variant="default" /> and reuse the returned <Badge text="filePath" variant="param" /> in the <Badge text="media" variant="param" /> array of the post call.

```bash
# 1) Upload the image (multipart field name: file)
curl -X POST https://api.openquok.com/api/v1/public/upload \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -F "file=@photo.jpg"

# Response:
# {
#   "success": true,
#   "data": { "id": "img-123", "filePath": "...", "publicUrl": "..." },
#   "message": "Media uploaded successfully"
# }

# 2) Schedule a feed post that references the upload
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Beautiful sunset 🌅 #photography",
    "scheduledAt": "2026-05-15T18:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["YOUR_INSTAGRAM_CHANNEL_UUID"],
    "isGlobal": true,
    "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }]
  }'
```

### Publish an Instagram story with collaborators

```json
{
  "body": "",
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_INSTAGRAM_CHANNEL_UUID"],
  "isGlobal": true,
  "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "YOUR_INSTAGRAM_CHANNEL_UUID": {
      "post_type": "story",
      "collaborators": [{ "label": "openquok" }]
    }
  }
}
```

### Multi-channel post with per-channel body override

```json
{
  "body": "Same announcement everywhere.",
  "bodiesByIntegrationId": {
    "YOUR_INSTAGRAM_CHANNEL_UUID": "Same announcement everywhere — but with #hashtags for the gram"
  },
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_THREADS_CHANNEL_UUID", "YOUR_INSTAGRAM_CHANNEL_UUID"],
  "isGlobal": false
}
```

When <Badge text="isGlobal" variant="param" /> is `false`, channels listed in <Badge text="bodiesByIntegrationId" variant="param" /> use their override; the rest fall back to the top-level <Badge text="body" variant="param" />.

### Schedule a Threads post with a follow-up reply

```json
{
  "body": "Big thread incoming 🧵",
  "scheduledAt": "2026-05-15T10:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_THREADS_CHANNEL_UUID"],
  "isGlobal": true,
  "providerSettingsByIntegrationId": {
    "YOUR_THREADS_CHANNEL_UUID": {
      "threads": {
        "replies": [
          { "message": "1/ here is the actual hot take", "delaySeconds": 60 },
          { "message": "2/ and here is the receipt", "delaySeconds": 300 }
        ]
      }
    }
  }
}
```

## Related Section(s)

<CardGrid>
<LinkCard title="Public API Overview" description="Authentication, channel groups, global plugs, SDK quickstart, and the Payload Wizard" href="/docs/getting-started-for-public-api" />
<LinkCard title="Integrations APIs" description="Connect / inspect / trigger endpoints around connected channels" href="/docs/apis-integrations" />
<LinkCard title="Threads CLI examples" description="Follow-up replies, internal plugs, and cross-account comments" href="/docs/cli-examples/threads" />
<LinkCard title="Social integration" description="Backend env vars and Meta dashboard setup for each provider" href="/docs/social-integration" />
</CardGrid>
