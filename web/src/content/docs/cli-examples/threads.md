---
title: Meta Threads
description: End-to-end Openquok CLI recipes for Meta Threads — single posts, reply chains, the missing release_id reconciliation flow, and per-post analytics.
order: 1
lastUpdated: 2026-05-12
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
| OAuth scopes | <code>threads_basic</code>, <code>threads_content_publish</code>, <code>threads_manage_replies</code>, <code>threads_manage_insights</code> |
| OAuth setup | <a href="/docs/social-integration/threads">Meta Threads</a> |

```bash
THREADS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
```

## Simple text post

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T10:00:00Z" \
  --status scheduled \
  --body "Hello Threads!" \
  --integrationIds "$THREADS_ID"
```

## Post with media

Threads accepts at most one image or video per post. Upload the asset and pass the returned id/path:

```bash
MEDIA=$(openquok upload ./hero.png | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  --scheduledAt "2026-01-15T10:00:00Z" \
  --body "Launch day. 🚀" \
  --integrationIds "$THREADS_ID" \
  --media "$MEDIA"
```

<Callout type="tip" title="500-character truncation is silent">
<p>The Threads provider trims content to its 500-character ceiling before publishing. Inspect the rendered preview via the web UI, or check the row's <code>content</code> after publish with <a href="/docs/cli-usages/managing-posts">`openquok posts:list`</a> to confirm the result.</p>
</Callout>

## Scheduled reply chain (thread + follow-ups)

`providerSettings.threads.replies[]` carries follow-up replies that publish from the same account a fixed number of seconds after the root post. Pass them on `posts:create` with `--providerSettingsByIntegrationId`:

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T10:00:00Z" \
  --body "Thread 1/3: Why we built Openquok" \
  --integrationIds "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$THREADS_ID" '
    {
      ($id): {
        replies: [
          { message: "Thread 2/3: The architecture", delaySeconds: 60 },
          { message: "Thread 3/3: What is next",      delaySeconds: 120 }
        ]
      }
    }
  ')"
```

### Add a "finisher" reply

Enable a closing reply (e.g. "Thanks for reading!") by toggling `providerSettings.threads.enabled` and providing a message:

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T10:00:00Z" \
  --body "Thread 1/2: A short story" \
  --integrationIds "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$THREADS_ID" '
    {
      ($id): {
        enabled: true,
        message: "Thanks for reading — like and follow for more!",
        replies: [
          { message: "Thread 2/2: The punchline", delaySeconds: 30 }
        ]
      }
    }
  ')"
```

### Delayed engagement reply

`providerSettings.threads.internalEngagementPlug` schedules a same-account engagement reply (a self-comment that boosts engagement signals) some seconds after publish:

```bash
openquok posts:create \
  --scheduledAt "2026-01-15T10:00:00Z" \
  --body "Big announcement! 🧵" \
  --integrationIds "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$THREADS_ID" '
    {
      ($id): {
        internalEngagementPlug: {
          enabled: true,
          message: "Have questions? Reply here and I will get back to you.",
          delaySeconds: 300
        }
      }
    }
  ')"
```

## Reconnect a "missing" Threads post

Threads occasionally fails to return a `release_id` immediately after publish; Openquok stores it as <Badge text="missing" variant="default" /> and per-post analytics stay locked until you link the real id manually.

```bash
POST_ID=$(openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end   "2026-02-01T00:00:00Z" \
  | jq -r --arg id "$THREADS_ID" '
    .[]
    | select(.integration_id==$id and .release_id=="missing")
    | .id
  ' \
  | head -n1)

openquok posts:missing "$POST_ID" | jq '.[] | {id, url}'

openquok posts:connect "$POST_ID" --releaseId "7321456789012345678"

openquok analytics:post "$POST_ID" -d 7
```

## Per-channel analytics

```bash
openquok analytics:platform "$THREADS_ID" -d 30 \
  | jq '.[] | {label, percentageChange}'
```

```bash
openquok analytics:post 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d -d 30 \
  | jq '.[] | {label, latest: .data[-1].total}'
```

## Related

<CardGrid>
<LinkCard title="Meta Threads setup" description="Meta for Developers app, OAuth redirect, scopes, and tester roles" href="/docs/social-integration/threads" />
<LinkCard title="Managing Posts" description="Generic flag reference for `posts:create` and the reconcile workflow" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Analytics" description="Look-back windows, response shape, and `jq` recipes" href="/docs/cli-usages/analytics" />
</CardGrid>
