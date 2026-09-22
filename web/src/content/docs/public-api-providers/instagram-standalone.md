---
title: Instagram Standalone Settings
description: OpenQuok public API provider settings for Instagram Standalone (IG Login) — same post type, trial reel, and collaborator fields as Business.
order: 7
lastUpdated: 2026-09-14
sidebar:
  label: Instagram Standalone Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="instagram-standalone" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/instagram-standalone" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/instagram">Instagram</a> |
| Character cap | **2,200** |
| Main-post media | **≥1** attachment required for <Badge text="status: scheduled" variant="param" />; story/trial reel = **1** item; carousel ≤**10** |

<Callout type="note">
<p><Badge text="instagram-standalone" variant="default" /> uses <strong>Instagram Login</strong> — no Facebook Page required at connect time. The <Badge text="providerSettingsByIntegrationId" variant="param" /> shape is <strong>identical</strong> to <Badge text="instagram-business" variant="default" />. See <a href="/docs/public-api-providers/instagram-business">Instagram Business Settings</a> for the full field table and story example.</p>
</Callout>

## Settings on create post

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="post_type" variant="param" /> | <Badge text="instagram.postType" variant="param" /> | Feed/Reel vs Story |
| <Badge text="is_trial_reel" variant="param" /> | <Badge text="instagram.isTrialReel" variant="param" /> | Trial Reel |
| <Badge text="graduation_strategy" variant="param" /> | <Badge text="instagram.graduationStrategy" variant="param" /> | Trial reel graduation |
| <Badge text="collaborators" variant="param" /> | <Badge text="instagram.collaborators" variant="param" /> | Collaborator invites |
| — | <Badge text="instagram.replies" variant="param" /> | Text follow-up comments |

```json
{
  "providerSettingsByIntegrationId": {
    "<instagram-integration-id>": {
      "is_trial_reel": true,
      "graduation_strategy": "MANUAL",
      "instagram": {
        "replies": [
          { "message": "Trial reel — tell us what you think!", "delaySeconds": 120 }
        ]
      }
    }
  }
}
```

## Field reference

See <a href="/docs/public-api-providers/instagram-business#field-reference">Instagram Business Settings → Field reference</a> for types, defaults, and constraints. Both identifiers share the same backend resolver.

## Follow-up comments

Use <Badge text="instagram.replies" variant="param" /> on the standalone channel UUID. Follow-ups are **text only**.

## Complete example

Trial reel with one video (upload MP4 first):

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Testing this format with you first.",
    "scheduledAt": "2026-05-15T18:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<instagram-integration-id>"],
    "isGlobal": true,
    "media": [{ "id": "reel-1", "path": "FILE_PATH_FROM_UPLOAD" }],
    "providerSettingsByIntegrationId": {
      "<instagram-integration-id>": {
        "is_trial_reel": true,
        "graduation_strategy": "MANUAL"
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Instagram Business Settings" description="Full field table for Business (FB-linked) connect" href="/docs/public-api-providers/instagram-business" />
<LinkCard title="Provider settings overview" description="Hub catalog and authentication" href="/docs/public-api-providers" />
<LinkCard title="Instagram CLI examples" description="openquok recipes — swap in standalone UUID" href="/docs/cli-examples/instagram" />
<LinkCard title="Instagram setup" description="IG Login app and redirect URI" href="/docs/social-integration/instagram" />
<LinkCard title="Media rules" description="Story, reel, and carousel rules" href="/docs/platforms/media-rules" />
</CardGrid>
