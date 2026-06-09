# Instagram — business (`instagram-business`)

Professional Instagram account connected via **Facebook Login for Business** (Page-linked). Confirm keys with `integrations:settings` for your workspace row.

```bash
IG_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-business") | .id')
openquok integrations:settings "$IG_BUSINESS_ID"
```

Posting behavior matches **Instagram (Standalone)** — only OAuth and token host differ. See [instagram-standalone-examples.md](./instagram-standalone-examples.md) for the same recipes with `instagram-standalone`.

Settings mechanics: [provider-settings.md](./provider-settings.md).

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Post a feed image | [Feed post](#feed-post) |
| Post a carousel | [Carousel](#carousel) |
| Publish a Reel | [Reel (single MP4)](#reel-single-mp4) |
| Publish a Story | [Story](#story) |
| Test a Trial Reel with collaborators | [Trial Reel + collaborators](#trial-reel--collaborators) |
| Add text comments after publish | [Text follow-up comments](#text-follow-up-comments) or `instagram.replies` in settings |
| Check limits and tools | `openquok integrations:settings "$IG_BUSINESS_ID"` |

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Feed image post | Yes | At least one attachment required for `scheduled` |
| Carousel (2–10 items) | Yes | Auto when `-m` has multiple attachments and `post_type` is not `story` |
| Reel (single video) | Yes | One `.mp4` attachment → Reels surface |
| Story | Yes | `--settings '{"post_type":"story"}'`; one attachment; no collaborators |
| Trial Reel | Yes | `is_trial_reel` + single MP4; not combinable with Stories |
| Collaborators (max 3) | Yes | Feed/Reel **single** media only — not carousel, not Stories |
| Graduation strategy | Yes | `MANUAL` or `SS_PERFORMANCE` when `is_trial_reel` is true |
| Text follow-up comments | Yes | Multi-segment `-c` (text-only on Instagram) or `replies[]` in provider settings |
| Story link stickers | No | — |
| Automatic comment auto-reply | No | — |

## Provider settings (`--settings`)

Flat JSON merged into `providerSettingsByIntegrationId` for each `-i` UUID. Run `integrations:settings` to confirm allow-listed keys in your workspace.

| Key | Values | Default | When |
| --- | --- | --- | --- |
| `post_type` | `"post"` \| `"story"` | `"post"` | Story vs feed/Reel |
| `is_trial_reel` | `true` \| `false` | `false` | Trial Reel (feed only, one video) |
| `graduation_strategy` | `"MANUAL"` \| `"SS_PERFORMANCE"` | `"MANUAL"` | Trial Reel graduation |
| `collaborators` | `["user1","user2"]` or `[{"label":"user1"}]` | `[]` | Max 3; not with carousel or Stories |
| `instagram.replies` | `[{ "message": "…", "delaySeconds": 60 }]` | `[]` | Scheduled text comments after publish (nested bucket in `--providerSettingsByIntegrationId`) |

## Feed post

```bash
IMAGE=$(openquok upload ./image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Caption #hashtag" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$IMAGE" \
  -i "<instagram-business-uuid>"
```

## Carousel

Pass 2–10 attachments; caption applies to the whole carousel. Do not combine with `collaborators`.

```bash
MEDIA=$(for f in ./slides/*.jpg; do
  openquok upload "$f" | jq -c '{id: .data.id, path: (.data.path // .data.filePath)}'
done | jq -s .)

openquok posts:create \
  -c "Slide deck 1/N → N/N" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$MEDIA" \
  -i "<instagram-business-uuid>"
```

## Reel (single MP4)

```bash
REEL=$(openquok upload ./reel.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "New reel" \
  -s "2026-01-01T12:00:00Z" \
  -m "$REEL" \
  -i "<instagram-business-uuid>"
```

## Story

```bash
STORY=$(openquok upload ./story.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"story"}' \
  -m "$STORY" \
  -i "<instagram-business-uuid>"
```

## Trial Reel + collaborators

```bash
VIDEO=$(openquok upload ./trial.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Testing with non-followers first" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"is_trial_reel":true,"graduation_strategy":"SS_PERFORMANCE","collaborators":["partner_account"]}' \
  -m "$VIDEO" \
  -i "<instagram-business-uuid>"
```

## Text follow-up comments

Instagram thread segments are **text-only** (no media on follow-ups). `-d` is **milliseconds** between segments.

```bash
openquok posts:create \
  -c "Root caption" -m "$IMAGE" \
  -c "Follow-up comment 1" \
  -c "Follow-up comment 2" \
  -s "2026-01-01T12:00:00Z" \
  -d 60000 \
  -i "<instagram-business-uuid>"
```
