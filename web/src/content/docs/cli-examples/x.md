---
title: X
description: OpenQuok CLI examples for X — tweets, media, thread replies, and analytics.
order: 8
lastUpdated: 2026-06-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="x" variant="default" /> |
| Max content length | 280 weighted (4000 when Verified) |
| Required attachments | None — text-only posts publish |
| OAuth | OAuth 1.0a (Native App, Read + Write) |
| OAuth setup | <a href="/docs/social-integration/x">X setup guide</a> |

```bash
X_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="x") | .id')
```

## Simple text post

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Hello from OpenQuok!" \
  -i "$X_ID"
```

## Post with images

X accepts up to four images per post. Upload assets and pass returned id/path values:

```bash
MEDIA=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Launch day." \
  -i "$X_ID" \
  -m "$MEDIA"
```

<Callout type="tip" title="Weighted character counting">
<p>X counts URLs and some characters differently than plain length. OpenQuok validates weighted length before publish — use the web composer preview or check limits with <Badge text="integrations:settings" variant="default" />.</p>
</Callout>

## Scheduled reply chain (thread)

<Badge text="providerSettings.x.replies[]" variant="param" /> carries follow-up replies that publish as quote-less replies after the root tweet:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Thread 1/2: Why we built OpenQuok" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    {
      ($id): {
        x: {
          replies: [
            { message: "Thread 2/2: What is next", delaySeconds: 120 }
          ]
        }
      }
    }
  ')"
```

### Thread finisher

Enable a closing reply with <Badge text="x.enabled" variant="param" /> and <Badge text="x.message" variant="param" />:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Main tweet" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    {
      ($id): {
        x: {
          enabled: true,
          message: "Thanks for reading!"
        }
      }
    }
  ')"
```

## Compose settings (reply audience, community, labels)

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Community update" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    {
      ($id): {
        x: {
          whoCanReplyPost: "following",
          madeWithAi: true
        }
      }
    }
  ')"
```

Flat CLI keys are also accepted (e.g. <Badge text="who_can_reply_post" variant="param" />, <Badge text="made_with_ai" variant="param" />).

## Analytics

```bash
openquok analytics:platform "$X_ID" -d 7
```

When <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> is true on the backend, analytics return empty series.

## Related

<CardGrid>
<LinkCard title="X setup guide" description="OAuth 1.0a app type, redirect URI, and env vars" href="/docs/social-integration/x" />
<LinkCard title="Managing posts" description="posts:create, posts:list, and status commands" href="/docs/cli-usages/managing-posts" />
</CardGrid>
