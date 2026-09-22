---
title: X Settings
description: OpenQuok public API provider settings for X — reply audience, community, disclosures, thread finisher, follow-up replies, and cross-account reposts.
order: 2
lastUpdated: 2026-09-14
sidebar:
  label: X Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="x" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/x" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/x">X</a> |
| Character cap | **280** (standard) or **4,000** (verified) — **weighted** counting for links and mentions |
| Main-post media | Text-only OK; up to **4 images** <strong>or</strong> one video (≤140 s); never mixed |

<Callout type="note">
<p>OpenQuok publishes X posts as <strong>plain text</strong> even when the composer uses the HTML editor. Weighted length applies on <Badge text="status: scheduled" variant="param" /> — see <a href="/docs/creating-posts/writing-the-post#character-count">Character count</a>.</p>
</Callout>

## Settings on create post

Nest X-specific keys under the <Badge text="x" variant="default" /> bucket in <Badge text="providerSettingsByIntegrationId[&lt;integration-id&gt;]" variant="param" />. Flat API keys merge at publish time for compose settings.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="who_can_reply_post" variant="param" /> | <Badge text="x.whoCanReplyPost" variant="param" /> | Reply audience |
| <Badge text="community" variant="param" /> | <Badge text="x.communityUrl" variant="param" /> | Post into an X community (URL or id) |
| <Badge text="made_with_ai" variant="param" /> | <Badge text="x.madeWithAi" variant="param" /> | Made with AI disclosure |
| <Badge text="paid_partnership" variant="param" /> | <Badge text="x.paidPartnership" variant="param" /> | Paid partnership disclosure |
| — | <Badge text="x.replies" variant="param" /> | Scheduled follow-up replies |
| — | <Badge text="x.enabled" variant="param" /> / <Badge text="x.message" variant="param" /> | Thread finisher |
| — | <Badge text="x.crossAccountPlugs" variant="param" /> | Cross-account reposts |

```json
{
  "providerSettingsByIntegrationId": {
    "<x-integration-id>": {
      "who_can_reply_post": "following",
      "x": {
        "replies": [
          { "message": "2/2 — payoff", "delaySeconds": 90 }
        ],
        "enabled": true,
        "message": "Thanks for reading!",
        "crossAccountPlugs": [
          {
            "plugName": "x-repost-post-users",
            "enabled": true,
            "delayMs": 0,
            "integrationIds": ["<other-x-integration-id>"],
            "fields": {}
          }
        ]
      }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="who_can_reply_post" variant="param" /> / <Badge text="x.whoCanReplyPost" variant="param" /> | string | No | <Badge text="following" variant="default" />, <Badge text="mentionedUsers" variant="default" />, <Badge text="subscribers" variant="default" />, or <Badge text="verified" variant="default" /> |
| <Badge text="community" variant="param" /> / <Badge text="x.communityUrl" variant="param" /> | string | No | Community URL or id resolved at publish |
| <Badge text="made_with_ai" variant="param" /> / <Badge text="x.madeWithAi" variant="param" /> | boolean | No | AI-generated content label |
| <Badge text="paid_partnership" variant="param" /> / <Badge text="x.paidPartnership" variant="param" /> | boolean | No | Paid partnership label |
| <Badge text="x.replies" variant="param" /> | array | No | Quote-less follow-up tweets |
| <Badge text="x.replies[].message" variant="param" /> | string | Yes (per row) | Reply text (weighted length) |
| <Badge text="x.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Delay after previous part |
| <Badge text="x.replies[].media" variant="param" /> | array | No | Up to **4 images** or one video per reply |
| <Badge text="x.enabled" variant="param" /> | boolean | No | Thread finisher |
| <Badge text="x.message" variant="param" /> | string | When finisher enabled | Closing reply text |
| <Badge text="x.crossAccountPlugs" variant="param" /> | array | No | Reposts from other X channels |

## Follow-up comments

Same-account quote-less replies use <Badge text="x.replies" variant="param" />. Optional <Badge text="media" variant="param" /> per row follows the same upload rules as the main post (up to four images or one video).

## Cross-account plugs

| Plug id | Action |
| --- | --- |
| <Badge text="x-repost-post-users" variant="param" /> | Repost from other X channels in the workspace (no <Badge text="fields" variant="param" />) |

Configure on the **publishing** channel's <Badge text="x.crossAccountPlugs" variant="param" /> array. See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.

## Complete example

Post with reply audience and a two-part thread:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "1/2 — setup",
    "scheduledAt": "2026-05-15T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<x-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<x-integration-id>": {
        "x": {
          "whoCanReplyPost": "following",
          "replies": [
            { "message": "2/2 — payoff", "delaySeconds": 90 }
          ]
        }
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="All networks, authentication, and multi-channel payloads" href="/docs/public-api-providers" />
<LinkCard title="X CLI examples" description="openquok recipes for images, threads, and cross-account reposts" href="/docs/cli-examples/x" />
<LinkCard title="X setup" description="OAuth app, callback URL, and env keys" href="/docs/social-integration/x" />
<LinkCard title="Cross-account plugs" description="Acting channels, delayMs, and plug catalog" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Threads and comments" description="Follow-up delay semantics across networks" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media rules" description="X media rules and character caps" href="/docs/platforms/media-rules" />
</CardGrid>
