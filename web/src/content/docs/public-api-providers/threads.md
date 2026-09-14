---
title: Threads Settings
description: OpenQuok public API provider settings for Meta Threads — 500-character cap, follow-up replies, thread finisher, internal plugs, and cross-account comments.
order: 1
lastUpdated: 2026-09-14
sidebar:
  label: Threads Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="threads" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/threads" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/threads">Meta Threads</a> |
| Character cap | **500** (main caption, follow-ups, finisher, plug text) |
| Main-post media | Text-only OK; one image or video, or a carousel |

<Callout type="note">
<p>Keys in <Badge text="providerSettingsByIntegrationId" variant="param" /> use the channel <strong>UUID</strong> from <Badge text="GET /api/v1/public/integrations" variant="default" /> — not the <Badge text="threads" variant="default" /> identifier. See the <a href="/docs/public-api-providers">Provider settings overview</a> for terminology.</p>
</Callout>

## Settings on create post

Pass per-channel options under <Badge text="providerSettingsByIntegrationId[&lt;integration-id&gt;]" variant="param" />. Threads-specific keys nest in the <Badge text="threads" variant="default" /> composer bucket. The worker reads <Badge text="threads.replies" variant="param" />, finisher fields, and plug objects from that bucket at publish time.

**Flat vs nested:** Threads follow-ups, finisher, and plugs use the nested <Badge text="threads.*" variant="param" /> bucket only — there are no flat CLI aliases for reply chains.

```json
{
  "providerSettingsByIntegrationId": {
    "<threads-integration-id>": {
      "threads": {
        "replies": [
          { "message": "Part 2", "delaySeconds": 60 }
        ],
        "enabled": true,
        "message": "Thanks for reading!",
        "internalEngagementPlug": {
          "enabled": true,
          "message": "Link in bio.",
          "delaySeconds": 300
        },
        "crossAccountPlugs": [
          {
            "plugName": "threads-cross-account-comment",
            "enabled": true,
            "delayMs": 120000,
            "integrationIds": ["<other-threads-integration-id>"],
            "fields": { "comment": "Great thread!" }
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
| <Badge text="threads.replies" variant="param" /> | array | No | Follow-up thread replies after the root post publishes |
| <Badge text="threads.replies[].message" variant="param" /> | string | Yes (per row) | Reply text; counts toward the **500**-character cap |
| <Badge text="threads.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Wait after the previous part publishes (`0` = immediately after prior step) |
| <Badge text="threads.replies[].media" variant="param" /> | array | No | Optional image or video per reply — upload first via <Badge text="POST /api/v1/public/upload" variant="path" /> |
| <Badge text="threads.enabled" variant="param" /> | boolean | No | Enable thread finisher (default off) |
| <Badge text="threads.message" variant="param" /> | string | When finisher enabled | Closing reply after all follow-ups complete |
| <Badge text="threads.internalEngagementPlug.enabled" variant="param" /> | boolean | No | Same-account delayed engagement reply |
| <Badge text="threads.internalEngagementPlug.message" variant="param" /> | string | When plug enabled | Plug reply text |
| <Badge text="threads.internalEngagementPlug.delaySeconds" variant="param" /> | number | No | Seconds after follow-ups + finisher (default varies by composer) |
| <Badge text="threads.crossAccountPlugs" variant="param" /> | array | No | Comments from other Threads channels in the workspace |

## Follow-up comments

Scheduled same-account thread replies live in <Badge text="threads.replies" variant="param" />. Each row needs <Badge text="message" variant="param" /> and <Badge text="delaySeconds" variant="param" />. Optional <Badge text="media" variant="param" /> uses the same <Badge text="&#123; id, path &#125;" variant="param" /> shape as the main post.

<Callout type="tip">
<p>Every text field — main <Badge text="body" variant="param" />, each reply, finisher, and plug comment — must stay within <strong>500</strong> characters when <Badge text="status" variant="param" /> is <Badge text="scheduled" variant="param" />. Use <Badge text="draft" variant="param" /> to store longer copy until you shorten it.</p>
</Callout>

## Internal plugs

**Internal plugs** run on the publishing channel after follow-ups and the thread finisher complete. Configure <Badge text="threads.internalEngagementPlug" variant="param" /> on the same <Badge text="providerSettingsByIntegrationId" variant="param" /> entry as the main post.

See <a href="/docs/automations/internal-plugs">Internal plugs</a> for how internal plugs differ from global channel rules.

## Cross-account plugs

After the main thread publishes, other connected Threads channels in your workspace can post a comment via <Badge text="threads.crossAccountPlugs" variant="param" />:

| Plug id | Action |
| --- | --- |
| <Badge text="threads-cross-account-comment" variant="param" /> | Comment from acting Threads channels (<Badge text="fields.comment" variant="param" />) |

Each entry needs <Badge text="plugName" variant="param" />, <Badge text="integrationIds" variant="param" /> (acting channels — not the publisher), and optional <Badge text="delayMs" variant="param" />. Acting channels need the <code>threads_manage_mentions</code> scope. See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.

## Complete example

Schedule a text post with two follow-up replies:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Big thread incoming",
    "scheduledAt": "2026-05-15T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<threads-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<threads-integration-id>": {
        "threads": {
          "replies": [
            { "message": "1/ here is the actual hot take", "delaySeconds": 60 },
            { "message": "2/ and here is the receipt", "delaySeconds": 300 }
          ]
        }
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Catalog of all ten networks, multi-channel examples, and plugs primer" href="/docs/public-api-providers" />
<LinkCard title="Threads CLI examples" description="openquok posts:create recipes for reply chains, plugs, and analytics" href="/docs/cli-examples/threads" />
<LinkCard title="Threads setup" description="Meta developer app, OAuth scopes, and backend env" href="/docs/social-integration/threads" />
<LinkCard title="Internal plugs" description="Same-account engagement after follow-ups complete" href="/docs/automations/internal-plugs" />
<LinkCard title="Threads and comments" description="Composer follow-up panel and delay semantics" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Platform limits" description="Character caps and media rules for every network" href="/docs/platforms" />
</CardGrid>
