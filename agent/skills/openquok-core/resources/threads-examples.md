# Threads (Meta) — CLI examples

```bash
TH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
openquok integrations:settings "$TH_ID"
```

Run `integrations:settings` for `output.maxLength` (500) and allow-listed `output.tools`. Server-side media and Graph behavior: [threads-publish.md](./threads-publish.md). Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text-only post | Yes | No attachment required |
| Single image or video | Yes | Upload first (Rule 2); prefer JPEG/PNG; **SVG rejected** |
| Media carousel | Yes | Multiple `-m` items → carousel container |
| 500-character cap | Yes | Provider trims overflow before publish |
| Scheduled follow-up replies | Yes | `threads.replies[]` with `delaySeconds` |
| Thread finisher | Yes | `threads.enabled` + `threads.message` |
| Delayed engagement reply | Yes | `threads.internalEngagementPlug` (same account) |
| Missing `release_id` recovery | Yes | `posts:missing` → `posts:connect` |
| Channel / post analytics | Yes | `analytics:platform`, `analytics:post` |
| Cross-post to other channels | Yes | Separate `-i` UUIDs and per-channel settings |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Post text only | [Text-only](#text-only) |
| Post with image or video | [With image](#with-image-rule-2) |
| Post a carousel | [Media carousel](#media-carousel) |
| Schedule a reply chain / thread | [Follow-up replies](#scheduled-follow-up-replies) |
| End with a “thanks for reading” reply | [Thread finisher](#thread-finisher) |
| Schedule a delayed engagement comment | [Delayed engagement plug](#delayed-engagement-plug) |
| Fix analytics on a “missing” post | [Reconnect missing post](#reconnect-missing-post) |
| Debug vague Meta/media errors | [threads-publish.md](./threads-publish.md) |
| Check channel limits / tools | `openquok integrations:settings "$TH_ID"` |

## Provider settings (`threads` bucket)

Use nested keys under `threads` in `--providerSettingsByIntegrationId` (matches composer and orchestrator).

| Key | Shape | When |
| --- | --- | --- |
| `threads.replies` | `[{ "message": "…", "delaySeconds": 60 }]` | Follow-up replies after root post publishes |
| `threads.enabled` | `true` \| `false` | Enable thread finisher (default off) |
| `threads.message` | string | Finisher text when `enabled` is true |
| `threads.internalEngagementPlug` | `{ "enabled": true, "message": "…", "delaySeconds": 300 }` | Same-account engagement reply after replies + finisher |

## Text-only

```bash
openquok posts:create \
  -c "Launch post" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID"
```

## With image (Rule 2)

At publish time the backend turns each stored object key into a **public `https://` URL** and Meta’s servers **fetch** that URL. Prefer **JPEG or PNG**; **SVG is rejected** (see [threads-publish.md](./threads-publish.md)).

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Shipped today 🚀" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID"
```

## Media carousel

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))
openquok posts:create \
  -c "Carousel drop" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID"
```

## Scheduled follow-up replies

```bash
openquok posts:create \
  -c "Thread 1/3: Why we built this" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TH_ID" '
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

## Thread finisher

Closing reply after scheduled follow-ups (e.g. “Thanks for reading!”).

```bash
openquok posts:create \
  -c "Thread 1/2: A short story" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TH_ID" '
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

## Delayed engagement plug

Same-account reply scheduled after the reply chain and finisher.

```bash
openquok posts:create \
  -c "Big announcement! 🧵" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TH_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TH_ID" '
    {
      ($id): {
        threads: {
          internalEngagementPlug: {
            enabled: true,
            message: "Have questions? Reply here and I will get back to you.",
            delaySeconds: 300
          }
        }
      }
    }
  ')"
```

## Reconnect missing post

Threads sometimes omits `release_id` immediately after publish. Openquok stores `missing` until you link the real id.

```bash
POST_ID=$(openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z" \
  | jq -r --arg id "$TH_ID" '
    .[]
    | select(.integration_id==$id and .release_id=="missing")
    | .id
  ' \
  | head -n1)

openquok posts:missing "$POST_ID" | jq '.[] | {id, url}'
openquok posts:connect "$POST_ID" -r "<threads-release-id>"
openquok analytics:post "$POST_ID" -d 7
```

## Discover integration and analytics

```bash
openquok integrations:settings "$TH_ID"
openquok analytics:platform "$TH_ID" -d 30
```
