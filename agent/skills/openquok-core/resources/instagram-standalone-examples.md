# Instagram — standalone (`instagram-standalone`)

Professional Instagram account connected via **Instagram Login** (no Facebook Page required).

```bash
IG_STANDALONE_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-standalone") | .id')
openquok integrations:settings "$IG_STANDALONE_ID"
```

Always run `integrations:settings` for required fields and allow-listed `output.tools` before posting. Posting behavior matches **Instagram (Business)** — see [instagram-business-examples.md](./instagram-business-examples.md) for the same feature matrix with `instagram-business`.

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

Flat JSON merged into `providerSettingsByIntegrationId` for each `-i` UUID.

| Key | Values | Default | When |
| --- | --- | --- | --- |
| `post_type` | `"post"` \| `"story"` | `"post"` | Story vs feed/Reel |
| `is_trial_reel` | `true` \| `false` | `false` | Trial Reel (feed only, one video) |
| `graduation_strategy` | `"MANUAL"` \| `"SS_PERFORMANCE"` | `"MANUAL"` | Trial Reel graduation |
| `collaborators` | `["user1","user2"]` or `[{"label":"user1"}]` | `[]` | Max 3; not with carousel or Stories |


## Feed post

```bash
IMAGE=$(openquok upload ./image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Caption #hashtag" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$IMAGE" \
  -i "<instagram-standalone-uuid>"
```

## Carousel

```bash
MEDIA=$(for f in ./slides/*.jpg; do
  openquok upload "$f" | jq -c '{id: .data.id, path: (.data.path // .data.filePath)}'
done | jq -s .)

openquok posts:create \
  -c "Slide deck 1/N → N/N" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -m "$MEDIA" \
  -i "<instagram-standalone-uuid>"
```

## Reel (single MP4)

```bash
REEL=$(openquok upload ./reel.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "New reel" \
  -s "2026-01-01T12:00:00Z" \
  -m "$REEL" \
  -i "<instagram-standalone-uuid>"
```

## Story

```bash
STORY=$(openquok upload ./story.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"story"}' \
  -m "$STORY" \
  -i "<instagram-standalone-uuid>"
```

## Trial Reel + collaborators

```bash
VIDEO=$(openquok upload ./trial.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Testing with non-followers first" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"is_trial_reel":true,"graduation_strategy":"MANUAL","collaborators":["partner_account"]}' \
  -m "$VIDEO" \
  -i "<instagram-standalone-uuid>"
```

## Text follow-up comments

```bash
openquok posts:create \
  -c "Root caption" -m "$IMAGE" \
  -c "Follow-up comment 1" \
  -c "Follow-up comment 2" \
  -s "2026-01-01T12:00:00Z" \
  -d 60000 \
  -i "<instagram-standalone-uuid>"
```
