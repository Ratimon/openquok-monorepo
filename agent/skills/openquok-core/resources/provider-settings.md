# Provider settings (publish-time)

How to pass per-channel options on `openquok posts:create`. Feature matrices and copy-paste recipes live in each channel’s `*-examples.md` file.

**Plugs:** Internal plugs (per-post engagement automation) are configured on `posts:create`. Global plugs (likes-threshold channel rules) use `plugs:*` commands — see [plugs.md](./plugs.md).

## Two CLI paths

| Flag | Scope | Use when |
| --- | --- | --- |
| `--settings '<json>'` | Same flat keys merged into **every** `-i` UUID | One channel, or identical keys on a multi-channel post |
| `--providerSettingsByIntegrationId '<json>'` | Per-integration map `{ "<uuid>": { … } }` | Different settings per channel, or nested buckets |

Merge order per UUID: (1) `--providerSettingsByIntegrationId` entry, (2) `--settings` on top, (3) when multiple `-c` segments exist, a top-level `replies` array is merged last (overwrites an existing top-level `replies` key).

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
| Instagram follow-up comments | — | `instagram.replies` |
| X follow-ups / finisher / compose / cross-account repost | `who_can_reply_post`, `made_with_ai`, `paid_partnership`, `community` | `x.replies`, `x.enabled`, `x.message`, `x.whoCanReplyPost`, `x.communityUrl`, `x.crossAccountPlugs`, … |
| YouTube video metadata | `title`, `type`, `selfDeclaredMadeForKids`, `tags`, `thumbnail` / `thumbnailPath` | `youtube.title`, `youtube.type`, `youtube.tags`, `youtube.thumbnail`, … |
| LinkedIn / LinkedIn Page | `post_as_images_carousel`, `carousel_name` | `linkedin.postAsImagesCarousel`, `linkedin.carouselName`, `linkedin.crossAccountPlugs` |
| TikTok privacy / inbox | `privacy_level`, `content_posting_method`, `title`, `comment`, `duet`, `stitch`, … | `tiktok.privacy_level`, `tiktok.content_posting_method`, … |

Backend publish helpers accept **flat API keys** and **nested web buckets** where noted in each channel doc. For Threads and Instagram **scheduled follow-ups**, use the nested bucket (`threads` / `instagram`) in `--providerSettingsByIntegrationId` — that is what the worker reads at publish time.

Copy-paste JSON payloads: [examples/EXAMPLES.md](./examples/EXAMPLES.md).

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

Repeated `-c` builds one root caption (first segment) and, when there are two or more segments, merges a top-level `replies[]` with `delaySeconds` derived from `-d` (**milliseconds**, default 5000). Prefer explicit nested `threads.replies` or `instagram.replies` when scheduling Meta follow-ups so settings match the composer and orchestrator.

## `integrations:settings`

Always run before posting:

```bash
openquok integrations:settings <integration-id>
```

Returns `output.rules`, `output.maxLength`, `output.tools` (allow-listed `integrations:trigger` methods). Typed publish keys are documented in channel example files until `settingsSchema()` is implemented on each provider.

## Channel reference

| Channel | Examples | Primary settings |
| --- | --- | --- |
| Threads | [threads-examples.md](./threads-examples.md) | `threads.replies`, finisher, `internalEngagementPlug`, `crossAccountPlugs` |
| Facebook Page | [facebook-examples.md](./facebook-examples.md) | `url` (link preview) |
| Instagram Login | [instagram-standalone-examples.md](./instagram-standalone-examples.md) | `post_type`, trial reel, collaborators |
| Instagram Page | [instagram-business-examples.md](./instagram-business-examples.md) | Same as standalone |
| YouTube | [youtube-examples.md](./youtube-examples.md) | `title`, `type`, tags, thumbnail, made-for-kids |
| LinkedIn | [linkedin-examples.md](./linkedin-examples.md) | `post_as_images_carousel`, `carousel_name` (≥2 images, no video) |
| LinkedIn Page | [linkedin-page-examples.md](./linkedin-page-examples.md) | Same carousel keys + Page analytics |
| TikTok | [tiktok-examples.md](./tiktok-examples.md) | `privacy_level`, `content_posting_method`, toggles, `title` |
| X | [x-examples.md](./x-examples.md) | `x.replies`, finisher, reply audience, community, labels, `crossAccountPlugs` |
