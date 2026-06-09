# Provider settings (publish-time)

How to pass per-channel options on `openquok posts:create`. Feature matrices and copy-paste recipes live in each channel’s `*-examples.md` file.

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

Full JSON body: `openquok posts:create --json ./post.json` with `providerSettingsByIntegrationId` at the top level.

## Nested vs flat keys

| Channel | Flat CLI keys | Nested composer bucket |
| --- | --- | --- |
| Facebook Page | `url` | `facebook.url` |
| Instagram | `post_type`, `is_trial_reel`, `graduation_strategy`, `collaborators` | `instagram.*` (camelCase in web UI) |
| Threads follow-ups / finisher / plug | — | `threads.replies`, `threads.enabled`, `threads.message`, `threads.internalEngagementPlug` |
| Instagram follow-up comments | — | `instagram.replies` |

Backend publish helpers accept **flat API keys** and **nested web buckets** where noted in each channel doc. For Threads and Instagram **scheduled follow-ups**, use the nested bucket (`threads` / `instagram`) in `--providerSettingsByIntegrationId` — that is what the worker reads at publish time.

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
| Threads | [threads-examples.md](./threads-examples.md) | `threads.replies`, finisher, `internalEngagementPlug` |
| Facebook Page | [facebook-examples.md](./facebook-examples.md) | `url` (link preview) |
| Instagram Login | [instagram-standalone-examples.md](./instagram-standalone-examples.md) | `post_type`, trial reel, collaborators |
| Instagram Page | [instagram-business-examples.md](./instagram-business-examples.md) | Same as standalone |
