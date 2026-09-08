---
title: Meta Threads
description: OpenQuok CLI examples for Meta Threads — single posts, reply chains, the reconciliation flow, and per-post analytics.
order: 3
lastUpdated: 2026-09-08
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
| OAuth scopes | <code>threads_basic</code>, <code>threads_content_publish</code>, <code>threads_manage_replies</code>, <code>threads_manage_insights</code>, <code>threads_manage_mentions</code> |
| OAuth setup | <a href="/docs/social-integration/threads">Meta Threads</a> |

```bash
THREADS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
```

## Simple text post

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Hello Threads!" \
  -i "$THREADS_ID"
```

## Post with media

Threads accepts at most one image or video per post. Upload the asset and pass the returned id/path:

```bash
MEDIA=$(openquok upload ./hero.png | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Launch day. 🚀" \
  -i "$THREADS_ID" \
  -m "$MEDIA"
```

<Callout type="tip" title="500-character truncation is silent">
<p>The Threads provider trims content to its 500-character ceiling before publishing. Inspect the rendered preview via the web UI, or check the row's <code>content</code> after publish with <a href="/docs/cli-usages/managing-posts">`openquok posts:list`</a> to confirm the result.</p>
</Callout>

## Scheduled reply chain (thread + follow-ups)

<Badge text="providerSettings.threads.replies[]" variant="param" /> carries follow-up replies that publish from the same account a fixed number of seconds after the root post. Pass them on <Badge text="posts:create" variant="default" /> with <Badge text="--providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Thread 1/3: Why we built OpenQuok" \
  -i "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$THREADS_ID" '
    {
      ($id): {
        threads: {
          replies: [
            { message: "Thread 2/3: The architecture", delaySeconds: 60 },
            { message: "Thread 3/3: What is next",      delaySeconds: 120 }
          ]
        }
      }
    }
  ')"
```

### Follow-up reply with image or video

Upload the reply attachment first, then nest `media` on the matching `replies[]` row (same `{ id, path }` shape as the main post). Threads supports images and video on follow-ups:

```bash
REPLY_MEDIA=$(openquok upload ./thread-slide.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Thread 1/2: Why we built OpenQuok" \
  -i "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc \
    --arg id "$THREADS_ID" \
    --argjson media "$REPLY_MEDIA" '
    {
      ($id): {
        threads: {
          replies: [
            { message: "Thread 2/2: Architecture diagram", delaySeconds: 60, media: $media }
          ]
        }
      }
    }
  ')"
```

JSON recipe: <Badge text="threads-follow-up-reply-with-image.json" variant="path" /> in the agent skill examples folder (`agent/skills/openquok-core/resources/examples/`).

### Add a "finisher" reply

Enable a closing reply (e.g. "Thanks for reading!") by toggling <Badge text="providerSettings.threads.enabled" variant="param" /> and providing a message:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Thread 1/2: A short story" \
  -i "$THREADS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$THREADS_ID" '
    {
      ($id): {
        threads: {
          enabled: true,
          message: "Thanks for reading — like and follow for more!",
          replies: [
            { message: "Thread 2/2: The punchline", delaySeconds: 30 }
          ]
        }
      }
    }
  ')"
```

### Delayed engagement reply

<Badge text="providerSettings.threads.internalEngagementPlug" variant="param" /> schedules a same-account engagement reply (a self-comment that boosts engagement signals) some seconds after publish:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Big announcement! 🧵" \
  -i "$THREADS_ID" \
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

### Cross-account comments

<Badge text="providerSettings.threads.crossAccountPlugs" variant="param" /> schedules comments from <strong>other Threads channels</strong> in the same workspace after the publishing channel’s post goes live. Use plug name <Badge text="threads-cross-account-comment" variant="default" /> and list acting channel UUIDs in <Badge text="integrationIds" variant="param" /> (not the publishing channel).

Connect two or more Threads integrations, then pass settings on the <strong>publishing</strong> integration id:

```bash
THREADS_PUBLISH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id' | head -n1)
THREADS_OTHER_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id' | sed -n '2p')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Main thread from our brand account" \
  -i "$THREADS_PUBLISH_ID" \
  --providerSettingsByIntegrationId "$(jq -nc \
    --arg publish "$THREADS_PUBLISH_ID" \
    --arg other "$THREADS_OTHER_ID" '
    {
      ($publish): {
        threads: {
          crossAccountPlugs: [
            {
              plugName: "threads-cross-account-comment",
              enabled: true,
              delayMs: 120000,
              integrationIds: [$other],
              fields: { comment: "Great thread — sharing from our other account." }
            }
          ]
        }
      }
    }
  ')"
```

<Callout type="note" title="Same account vs cross-account">
<p><Badge text="threads.internalEngagementPlug" variant="param" /> (above) runs a delayed reply from the <strong>publishing</strong> channel. <Badge text="threads.crossAccountPlugs" variant="param" /> runs actions from <strong>other</strong> connected channels. <Badge text="delayMs" variant="param" /> is in milliseconds (<code>120000</code> = two minutes; <code>300000</code> = five minutes; the web composer defaults to two minutes for Threads).</p>
</Callout>

<Callout type="warning" title="Mentions scope (cross-account only)">
<p>When the acting channel is <strong>not</strong> the publisher, OpenQuok publishes the comment using the <Badge text="threads_manage_mentions" variant="default" /> OAuth scope. Add it in your Meta app, then <strong>reconnect</strong> every acting Threads integration so stored tokens include the new scope.</p>
<p>Meta's allowed usage is replying to posts where the acting account is <strong>@mentioned</strong>. OpenQuok calls the reply API with the acting channel's <Badge text="threads_manage_mentions" variant="default" /> token and does not modify the root caption. Use a short <Badge text="delayMs" variant="param" /> (for example <code>120000</code>) so the root post is fully live before the comment runs.</p>
<p>Cross-account comments also need <strong>Advanced Access</strong> for <Badge text="threads_manage_mentions" variant="default" /> via Meta App Review (screencast: OAuth grant including the scope → publish → other workspace channel comments). Until that is approved, replies involving non-tester accounts may fail in production.</p>
</Callout>

## Reconnect a "missing" Threads post

Threads occasionally fails to return a <Badge text="release_id" variant="param" /> immediately after publish; OpenQuok stores it as <Badge text="missing" variant="param" /> and per-post analytics stay locked until you link the real id manually.

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

openquok posts:connect "$POST_ID" -r "7321456789012345678"

openquok analytics:post "$POST_ID" -d 7
```

## Per-channel analytics

```bash
openquok analytics:platform "$THREADS_ID" -d 30 \
  | jq '.[] | {label, percentageChange}'
```

```bash
openquok analytics:post <post-id> -d 30 \
  | jq '.[] | {label, latest: .data[-1].total}'
```

## Related

<CardGrid>
<LinkCard title="Meta Threads setup" description="Configure the Meta app, OAuth redirects, scopes, and tester roles" href="/docs/social-integration/threads" />
<LinkCard title="Managing Posts" description="Create, list, and schedule posts with the full flag reference" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Media Upload" description="Upload from disk or mirror a public URL before attaching a single image or video" href="/docs/cli-usages/media-upload" />
<LinkCard title="Analytics" description="Review channel and post performance after content goes live" href="/docs/cli-usages/analytics" />
</CardGrid>
