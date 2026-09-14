---
title: Overview — Provider settings
description: Per-channel providerSettingsByIntegrationId shapes for every social integration OpenQuok ships on the public API — identifiers, connect paths, and links to field-level reference pages.
order: 0
lastUpdated: 2026-09-14
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Terminology: Channel vs integration

<Callout type="note">
<p>The OpenQuok UI/dashboard uses the term <strong>channel</strong>, while the API and SDK use <strong>integration</strong>. They refer to the same thing — a single connected social account inside a workspace.</p>
</Callout>

## Overview

OpenQuok ships social provider integrations behind a single create-post API. Each post payload identifies its target channels through the UUIDs in <Badge text="integrationIds" variant="param" />, and any per-channel tuning lives under <Badge text="providerSettingsByIntegrationId" variant="param" /> keyed by those same UUIDs.

Customize-mode captions and attachments use <Badge text="bodiesByIntegrationId" variant="param" /> and <Badge text="mediaByIntegrationId" variant="param" /> respectively. For how the dashboard maps Global mode and per-channel content to those fields, see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

<strong>OAuth channels</strong> use the provider short identifier (for example <Badge text="threads" variant="default" />) at connect time, when you tell <a href="/docs/apis-integrations/connect">Connect Channel</a> <em>which</em> platform to authorize. <strong>Credentials channels</strong> (Dev.to) are connected in the dashboard with an API key — <Badge text="GET /api/v1/public/social/devto" variant="path" /> returns <strong>400</strong> and is not a connect URL.

Each provider page below documents the JSON shape under <Badge text="providerSettingsByIntegrationId[<uuid>]" variant="param" /> for that network — flat CLI keys, nested composer buckets, follow-up replies, and plugs where supported.

## Provider catalog

| Provider | Identifier | Connect | Setup guide |
| --- | --- | --- | --- |
| Meta Threads | <Badge text="threads" variant="default" /> | <Badge text="GET /api/v1/public/social/threads" variant="default" /> | <a href="/docs/social-integration/threads">Threads</a> |
| X | <Badge text="x" variant="default" /> | <Badge text="GET /api/v1/public/social/x" variant="default" /> | <a href="/docs/social-integration/x">X</a> |
| LinkedIn | <Badge text="linkedin" variant="default" /> | <Badge text="GET /api/v1/public/social/linkedin" variant="default" /> | <a href="/docs/social-integration/linkedin">LinkedIn</a> |
| LinkedIn Page | <Badge text="linkedin-page" variant="default" /> | <Badge text="GET /api/v1/public/social/linkedin-page" variant="default" /> | <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a> |
| Facebook Page | <Badge text="facebook" variant="default" /> | <Badge text="GET /api/v1/public/social/facebook" variant="default" /> | <a href="/docs/social-integration/facebook">Facebook</a> |
| Instagram (Business, FB-linked) | <Badge text="instagram-business" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-business" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |
| Instagram (Standalone, IG Login) | <Badge text="instagram-standalone" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-standalone" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |
| YouTube | <Badge text="youtube" variant="default" /> | <Badge text="GET /api/v1/public/social/youtube" variant="default" /> | <a href="/docs/social-integration/youtube">YouTube</a> |
| TikTok | <Badge text="tiktok" variant="default" /> | <Badge text="GET /api/v1/public/social/tiktok" variant="default" /> | <a href="/docs/social-integration/tiktok">TikTok</a> |
| Dev.to | <Badge text="devto" variant="default" /> | Dashboard API key — not <Badge text="GET /api/v1/public/social/devto" variant="default" /> | <a href="/docs/social-integration/devto">Dev.to</a> |

The <strong>Identifier</strong> column matches the <Badge text="identifier" variant="param" /> field returned by <a href="/docs/apis-integrations/integration-settings">Channel settings &amp; tools</a> for each connected channel. For OAuth providers it also matches the <Badge text=":integration" variant="param" /> path parameter on <a href="/docs/apis-integrations/connect">Connect Channel (OAuth)</a>.

When you reference a channel inside a post payload, use the channel's <strong>UUID</strong> — not its short identifier — in <Badge text="integrationIds" variant="param" /> and as the keys of <Badge text="providerSettingsByIntegrationId" variant="param" />.

<Callout type="note">
<p>The provider catalog is sourced from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/integrationManager.ts"><Badge text="backend/integrations/integrationManager.ts" variant="path" /></DocsExternalLink>. Re-fetching <Badge text="GET /api/v1/public/integrations" variant="default" /> is the safest way to see what's available in any given OpenQuok deployment.</p>
</Callout>

Character limits, media requirements, and composer rules for each network are summarized in <a href="/docs/platforms">Platform limits</a>.

<Callout type="tip">
<p>Rather than memorizing field names, fill out a real post in the <a href="/account/payload-wizard">Payload Wizard</a>, click <strong>Copy scheduled payload</strong>, and inspect the <Badge text="providerSettingsByIntegrationId" variant="param" /> object — it is always the source of truth for what the backend currently accepts (and the cleanest way to spot the difference between platform-specific settings and cross-provider features like Follow-up comments).</p>
</Callout>

## Provider settings reference

<CardGrid>
<LinkCard title="Threads Settings" description="500-char cap, follow-up replies, internal plugs, and cross-account comments" href="/docs/public-api-providers/threads" />
<LinkCard title="X Settings" description="Reply audience, community, disclosures, thread finisher, and cross-account reposts" href="/docs/public-api-providers/x" />
<LinkCard title="LinkedIn Settings" description="Image carousel, carousel name, follow-up comments, and cross-account plugs" href="/docs/public-api-providers/linkedin" />
<LinkCard title="LinkedIn Page Settings" description="Same settings shape as personal LinkedIn — page-specific connect and analytics" href="/docs/public-api-providers/linkedin-page" />
<LinkCard title="Facebook Page Settings" description="Embedded URL on text posts and follow-up comments with optional image" href="/docs/public-api-providers/facebook" />
<LinkCard title="Instagram Business Settings" description="Post type, trial reels, collaborators, and follow-up comments (Business, FB-linked)" href="/docs/public-api-providers/instagram-business" />
<LinkCard title="Instagram Standalone Settings" description="Same settings shape as Business — IG Login connect path" href="/docs/public-api-providers/instagram-standalone" />
<LinkCard title="YouTube Settings" description="Title, privacy, tags, made-for-kids, and custom thumbnail" href="/docs/public-api-providers/youtube" />
<LinkCard title="TikTok Settings" description="Direct post vs inbox upload, privacy, photo title, and brand toggles" href="/docs/public-api-providers/tiktok" />
<LinkCard title="Dev.to Settings" description="Title, tags, canonical URL, organization, and cover image" href="/docs/public-api-providers/devto" />
</CardGrid>

## Plugs and follow-up comments

Some optional features apply across **multiple** providers without being a single-network setting. They still live on <Badge text="providerSettingsByIntegrationId[<channel-uuid>]" variant="param" /> for the **publishing** channel.

- **Follow-up comments** — same-account replies or comments after the main post publishes. Bucket keys differ per platform (for example <Badge text="threads.replies" variant="param" /> or <Badge text="instagram.replies" variant="param" />). Field tables and JSON examples are on each provider page that supports them.
- **Internal plugs** — same-account engagement after follow-ups complete. See <a href="/docs/automations/internal-plugs">Internal plugs</a> and <a href="/docs/public-api-providers/threads#internal-plugs">Threads Settings → Internal plugs</a>.
- **Cross-account plugs** — comments or reposts from other connected channels in your workspace. See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> and the Threads, X, and LinkedIn provider pages for catalog plug ids and example payloads.

<Callout type="note">
<p><strong>Global plugs</strong> (auto-repost or auto-reply when likes cross a threshold) are channel-level rules — not part of the create-post payload. Configure them with <Badge text="GET /public/plug-catalog" variant="path" /> and <Badge text="POST /public/integration-plugs/:id" variant="path" />, or via <Badge text="openquok plugs:*" variant="default" /> commands. See <a href="/docs/getting-started-for-public-api#plugs">Public API → Plugs</a>.</p>
</Callout>

## Multi-channel examples

All examples target <Badge text="POST /api/v1/public/posts" variant="default" />, sent with the <Badge text="Authorization" variant="default" /> header described in <a href="/docs/getting-started-for-public-api#authentication">Authentication</a>. Replace each <Badge text="YOUR_..._UUID" variant="param" /> placeholder with a real channel UUID from <Badge text="GET /api/v1/public/integrations" variant="default" />.

### Per-channel body override

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

### Per-channel media override

Upload each asset first, then pass shared defaults in <Badge text="media" variant="param" /> and channel-specific lists in <Badge text="mediaByIntegrationId" variant="param" />:

```json
{
  "body": "Same announcement everywhere.",
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_THREADS_CHANNEL_UUID", "YOUR_INSTAGRAM_CHANNEL_UUID"],
  "isGlobal": false,
  "media": [{ "id": "img-global", "path": "FILE_PATH_FROM_UPLOAD" }],
  "mediaByIntegrationId": {
    "YOUR_THREADS_CHANNEL_UUID": [{ "id": "img-threads", "path": "THREADS_FILE_PATH" }],
    "YOUR_INSTAGRAM_CHANNEL_UUID": [{ "id": "img-ig", "path": "INSTAGRAM_FILE_PATH" }]
  }
}
```

Channels omitted from <Badge text="mediaByIntegrationId" variant="param" /> inherit the top-level <Badge text="media" variant="param" /> array for their post row.

## Related Section(s)

<CardGrid>
<LinkCard title="Public API Overview" description="Authentication, channel groups, global plugs, SDK quickstart, and the Payload Wizard" href="/docs/getting-started-for-public-api" />
<LinkCard title="Integrations APIs" description="Connect / inspect / trigger endpoints around connected channels" href="/docs/apis-integrations" />
<LinkCard title="Posts APIs" description="Schedule, update, and delete post groups against connected channels" href="/docs/apis-posts" />
<LinkCard title="Platform limits" description="Character caps, media rules, and follow-up comment support by network" href="/docs/platforms" />
<LinkCard title="Global vs per-channel" description="How isGlobal, bodiesByIntegrationId, and mediaByIntegrationId map to the composer" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="CLI examples" description="Copy-paste openquok recipes by network" href="/docs/cli-examples" />
</CardGrid>
