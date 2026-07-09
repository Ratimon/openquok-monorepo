# Threads (Meta) — CLI examples

```bash
TH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
openquok integrations:settings "$TH_ID"
```

Run `integrations:settings` for `output.maxLength` (500) and allow-listed `output.tools`. Server-side media and Graph behavior: [threads-publish.md](./threads-publish.md). Settings mechanics: [provider-settings.md](./provider-settings.md).

JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#threads).

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
| Cross-account comments | Yes | `threads.crossAccountPlugs` (`threads-cross-account-comment`) |
| Missing `release_id` recovery | Yes | `posts:missing` → `posts:connect` |
| Channel / post analytics | Yes | `analytics:platform`, `analytics:post` |
| Cross-post to other channels | Yes | Separate `-i` UUIDs and per-channel settings |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Post text only | [threads-text-only.json](./examples/threads-text-only.json) |
| Post with image or video | [threads-with-image.json](./examples/threads-with-image.json) |
| Post a carousel | [threads-media-carousel.json](./examples/threads-media-carousel.json) |
| Schedule a reply chain / thread | [threads-follow-up-replies.json](./examples/threads-follow-up-replies.json) |
| End with a “thanks for reading” reply | [threads-thread-finisher.json](./examples/threads-thread-finisher.json) |
| Schedule a delayed engagement comment | [threads-engagement-plug.json](./examples/threads-engagement-plug.json) |
| Comment from other Threads channels after publish | [threads-cross-account-plug.json](./examples/threads-cross-account-plug.json) |
| Fix analytics on a “missing” post | [Reconnect missing post](#reconnect-missing-post) |
| Debug vague Meta/media errors | [threads-publish.md](./threads-publish.md) |
| Check channel limits / tools | `openquok integrations:settings "$TH_ID"` |

## Provider settings (`threads` bucket)

Use nested keys under `threads` in `--providerSettingsByIntegrationId` (matches composer and orchestrator).

| Key | Shape | When |
| --- | --- | --- |
| `threads.replies` | `[{ "id": "…", "message": "…", "delaySeconds": 60 }]` | Follow-up replies after root post publishes |
| `threads.enabled` | `true` \| `false` | Enable thread finisher (default off) |
| `threads.message` | string | Finisher text when `enabled` is true |
| `threads.internalEngagementPlug` | `{ "enabled": true, "message": "…", "delaySeconds": 300 }` | Same-account engagement reply after replies + finisher |
| `threads.crossAccountPlugs` | `[{ "plugName": "threads-cross-account-comment", "enabled": true, "delayMs": 0, "integrationIds": ["<other-integration-id>"], "fields": { "comment": "…" } }]` | Comments from other Threads channels in the workspace |

Cross-account shape and plug ids: [provider-settings.md](./provider-settings.md#cross-account-plugs-crossaccountplugs).

## Run an example

Upload media first (Rule 2), replace placeholders in the JSON file, then:

```bash
openquok posts:create --json ./examples/threads-text-only.json
```

At publish time the backend turns each stored object key into a **public `https://` URL** and Meta’s servers **fetch** that URL. Prefer **JPEG or PNG**; **SVG is rejected** (see [threads-publish.md](./threads-publish.md)).

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
