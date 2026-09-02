# Provider settings (publish-time)

How to pass per-channel options on `openquok posts:create`. Feature matrices and copy-paste recipes live in each channel’s `*-examples.md` file.

**Plugs:** Internal plugs (per-post engagement automation) are configured on `posts:create`. Global plugs (likes-threshold channel rules) use `plugs:*` commands — see [plugs.md](./plugs.md).

## Two CLI paths

| Flag | Scope | Use when |
| --- | --- | --- |
| `--settings '<json>'` | Same flat keys merged into **every** `-i` UUID | One channel, or identical keys on a multi-channel post |
| `--providerSettingsByIntegrationId '<json>'` | Per-integration map `{ "<uuid>": { … } }` | Different settings per channel, or nested buckets |

Merge order per UUID: (1) `--providerSettingsByIntegrationId` entry, (2) `--settings` on top, (3) when multiple `-c` segments exist, `{bucket}.replies` is merged last (overwrites an existing `replies` key on that bucket). At publish time the worker reads **`{bucket}.replies`** only — see [Scheduled follow-up replies](#scheduled-follow-up-replies) and [Multi `-c` segments](#multi--c-segments).

```bash
# Flat keys — Instagram post type on one UUID
openquok posts:create -c "…" -s "…" -i "<integration-id>" --settings '{"post_type":"post"}'

# Per-UUID map — Facebook link on one Page only
openquok posts:create -c "…" -s "…" -i "<integration-id>" \
  --providerSettingsByIntegrationId '{"<integration-id>":{"url":"https://example.com"}}'
```

Full JSON body: `openquok posts:create --json ./examples/<file>.json` with `providerSettingsByIntegrationId` at the top level. Index: [examples/EXAMPLES.md](./examples/EXAMPLES.md).

## Nested vs flat keys

| Channel | Flat CLI keys | Nested composer bucket |
| --- | --- | --- |
| Facebook Page | `url` | `facebook.url` |
| Instagram | `post_type`, `is_trial_reel`, `graduation_strategy`, `collaborators` | `instagram.*` (camelCase in web UI) |
| Threads follow-ups / finisher / plug | — | `threads.replies`, `threads.enabled`, `threads.message`, `threads.internalEngagementPlug`, `threads.crossAccountPlugs` |
| Instagram follow-up comments | — | `instagram.replies` (text only) |
| X follow-ups / finisher / compose / cross-account repost | `who_can_reply_post`, `made_with_ai`, `paid_partnership`, `community` | `x.replies`, `x.enabled`, `x.message`, `x.whoCanReplyPost`, `x.communityUrl`, `x.crossAccountPlugs`, … |
| LinkedIn / LinkedIn Page follow-up comments | — | `linkedin.replies` (text only; `linkedin-page` uses the same bucket) |
| Facebook Page follow-up comments | — | `facebook.replies` (optional one image per reply; no video) |
| YouTube video metadata | `title`, `type`, `selfDeclaredMadeForKids`, `tags`, `thumbnail` / `thumbnailPath` | `youtube.title`, `youtube.type`, `youtube.tags`, `youtube.thumbnail`, … |
| LinkedIn / LinkedIn Page (main post) | `post_as_images_carousel`, `carousel_name` | `linkedin.postAsImagesCarousel`, `linkedin.carouselName`, `linkedin.crossAccountPlugs` |
| TikTok privacy / inbox | `privacy_level`, `content_posting_method`, `title`, `comment`, `duet`, `stitch`, … | `tiktok.privacy_level`, `tiktok.content_posting_method`, … |
| TikTok Business | same shared keys plus `music_sound_id`, `poi_id`; video `privacy_level` omitted | `tiktok-business.*` |
| Dev.to article | `title`, `tags`, `canonical`, `organization`, `series`, `main_image` / `mainImage` | `devto.title`, `devto.tags`, `devto.canonical`, `devto.organization`, `devto.series`, `devto.mainImage` |

Backend publish helpers accept **flat API keys** and **nested web buckets** where noted in each channel doc. For **scheduled follow-up replies**, always nest under the provider bucket in `--providerSettingsByIntegrationId` — that is what the worker reads at publish time (not a top-level `replies` key).

Copy-paste JSON payloads: [examples/EXAMPLES.md](./examples/EXAMPLES.md).

## Scheduled follow-up replies

Same-account reply chains after the main post publish live in `providerSettingsByIntegrationId[<integration-id>].{bucket}.replies`. Use the **provider’s bucket** — do not put LinkedIn or Facebook follow-ups under `threads.replies`.

| Provider identifier | Settings bucket | Reply media |
| --- | --- | --- |
| `threads` | `threads` | Optional (`media` on reply rows) |
| `x` | `x` | Optional |
| `instagram`, `instagram-business`, `instagram-standalone` | `instagram` | Text only |
| `linkedin`, `linkedin-page` | `linkedin` | Text only |
| `facebook` | `facebook` | Optional — max **one image** per reply, no video |

Each reply row:

```json
{
  "id": "reply-1",
  "message": "Follow-up text",
  "delaySeconds": 60,
  "media": [{ "id": "<media-id>", "path": "https://cdn.example.com/reply.jpg" }]
}
```

- `id` — stable string (UUID recommended in JSON files; CLI may omit).
- `delaySeconds` — wait **after the previous part** publishes (0 = immediately after the prior step).
- `media` — optional. Flat `media[]` or `media: { "items": [...] }` (same shapes as the main post). Omit on Instagram and LinkedIn. Upload first (Rule 2) before referencing `id` / `path`.

Examples: [threads-follow-up-replies.json](./examples/threads-follow-up-replies.json), [x-examples.md](./x-examples.md#scheduled-reply-chain-thread), [instagram-follow-up-comments.json](./examples/instagram-follow-up-comments.json), [linkedin-follow-up-comment.json](./examples/linkedin-follow-up-comment.json), [facebook-follow-up-comment.json](./examples/facebook-follow-up-comment.json).

## Internal plugs

Internal plugs run after publish — either from the same account (Threads delayed reply) or from other connected channels in the workspace (cross-account comment, repost, or reshare). Configure on the **publishing** integration’s provider bucket when creating the post.

Overview and global-plug contrast: [plugs.md](./plugs.md).

### Same-account delayed reply (Threads)

| Provider bucket | Key | Shape |
| --- | --- | --- |
| `threads` | `threads.internalEngagementPlug` | `{ "enabled": true, "message": "…", "delaySeconds": 300 }` |

Runs after follow-up replies and the thread finisher. Example: [threads-engagement-plug.json](./examples/threads-engagement-plug.json).

### Cross-account plugs (`crossAccountPlugs`)

After the publishing channel’s post goes live, **other connected channels in the same workspace** run the plug (comment, repost, etc.):

| Provider bucket | Plug identifier | Action |
| --- | --- | --- |
| `threads` | `threads-cross-account-comment` | Comment from other Threads channels (`fields.comment`) |
| `x` | `x-repost-post-users` | Repost from other X channels (no fields) |
| `linkedin` / `linkedin-page` | `linkedin-add-comment` | Comment from other LinkedIn channels (`fields.comment`) |
| `linkedin` / `linkedin-page` | `linkedin-repost-post-users` | Reshare from other LinkedIn channels |

Each entry in `crossAccountPlugs` is an object:

```json
{
  "plugName": "threads-cross-account-comment",
  "enabled": true,
  "delayMs": 0,
  "integrationIds": ["<other-integration-id>"],
  "fields": { "comment": "Nice post!" }
}
```

- `delayMs` — milliseconds after publish (0 = immediately; composer also offers 1h–24h presets).
- `integrationIds` — UUIDs of **acting** channels (must not include the publishing integration id; orchestrator skips the publisher).
- `fields` — plug-specific strings from the catalog (`comment` for Threads/LinkedIn comment plugs; `{}` for repost plugs).

Same-account Threads delayed reply stays on `threads.internalEngagementPlug` (not `crossAccountPlugs`). Legacy `threads.multiAccountEngagementPlug` is migrated to `threads.crossAccountPlugs` on load.

Examples: [threads-cross-account-plug.json](./examples/threads-cross-account-plug.json), [x-cross-account-repost.json](./examples/x-cross-account-repost.json).

## Multi `-c` segments

Repeated `-c` builds one root caption (first segment) and, when there are two or more segments, merges `{bucket}.replies` on each selected integration with `delaySeconds` derived from `-d` (**milliseconds**, default 5000). The bucket comes from the channel’s provider identifier (`threads`, `x`, `instagram`, `linkedin`, or `facebook`) via `GET /public/integrations`; when lookup fails, `threads` is used.

**Publish-time bucket:** the orchestrator reads **`{bucket}.replies`** inside each integration’s provider settings. For follow-ups that actually publish, prefer one of:

1. **`--providerSettingsByIntegrationId`** (or `--json`) with the correct nested bucket — matches the composer and MCP `schedulePostTool`.
2. **Multi `-c`** — nests under the correct bucket per `-i` UUID (same shape as nested JSON files).

**Multi-channel:** when `-i` lists more than one UUID, put follow-ups in **each** integration’s bucket inside the map. A LinkedIn Page and a Threads account on the same post need `linkedin.replies` on the LinkedIn UUID and `threads.replies` on the Threads UUID — not `threads.replies` for both.

```bash
# Nested buckets — worker + composer shape (recommended)
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Root post" \
  -i "<threads-integration-id>" \
  -i "<linkedin-integration-id>" \
  --providerSettingsByIntegrationId "$(jq -nc '
    {
      "<threads-integration-id>": { threads: { replies: [
        { id: "t1", message: "Thread part 2", delaySeconds: 60 }
      ] } },
      "<linkedin-integration-id>": { linkedin: { replies: [
        { id: "l1", message: "LinkedIn comment", delaySeconds: 90 }
      ] } }
    }
  ')"
```

```bash
# Multi -c — nests under each integration's provider bucket (Threads → threads.replies)
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Part 1" -c "Part 2" -c "Part 3" \
  -d 5000 \
  -i "<threads-integration-id>"
```

## `integrations:settings`

Always run before posting:

```bash
openquok integrations:settings <integration-id>
```

Returns `output.rules`, `output.maxLength`, `output.tools` (allow-listed `integrations:trigger` methods), and typed `settings` when the provider implements `settingsSchema()` (Dev.to does). Other channels document publish keys in their `*-examples.md` files until they ship a schema.

## Channel reference

| Channel | Examples | Primary settings |
| --- | --- | --- |
| Threads | [threads-examples.md](./threads-examples.md) | `threads.replies`, finisher, `internalEngagementPlug`, `crossAccountPlugs` |
| Facebook Page | [facebook-examples.md](./facebook-examples.md) | `url` (link preview), `facebook.replies` (optional one image per reply) |
| Instagram Login | [instagram-standalone-examples.md](./instagram-standalone-examples.md) | `post_type`, trial reel, collaborators, `instagram.replies` |
| Instagram Page | [instagram-business-examples.md](./instagram-business-examples.md) | Same as standalone + `instagram.replies` |
| YouTube | [youtube-examples.md](./youtube-examples.md) | `title`, `type`, tags, thumbnail, made-for-kids |
| LinkedIn | [linkedin-examples.md](./linkedin-examples.md) | `post_as_images_carousel`, `carousel_name` (≥2 images, no video), `linkedin.replies` |
| LinkedIn Page | [linkedin-page-examples.md](./linkedin-page-examples.md) | Same carousel keys + `linkedin.replies` + Page analytics |
| TikTok | [tiktok-examples.md](./tiktok-examples.md) | `privacy_level`, `content_posting_method`, toggles, `title` |
| TikTok Business | [tiktok-business-examples.md](./tiktok-business-examples.md) | `content_posting_method`, `music_sound_id`, `poi_id`, photo `privacy_level` |
| X | [x-examples.md](./x-examples.md) | `x.replies`, finisher, reply audience, community, labels, `crossAccountPlugs` |
| Dev.to | [devto-examples.md](./devto-examples.md) | `title`, `tags`, `canonical`, `organization`, `series`, `mainImage` + analytics |
