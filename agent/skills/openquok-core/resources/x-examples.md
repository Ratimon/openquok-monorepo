# X — CLI examples

```bash
X_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="x") | .id')
openquok integrations:settings "$X_ID"
```

Run `integrations:settings` for `output.maxLength` (280 or 4000 when Verified) and allow-listed `output.tools`. Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text-only post | Yes | Weighted 280 chars (4000 Verified) |
| Up to 4 images | Yes | Upload first (Rule 2); JPEG/PNG/GIF |
| One video | Yes | MP4/MOV; ≤140s UI validation |
| Thread replies | Yes | `x.replies[]` with `delaySeconds` |
| Thread finisher | Yes | `x.enabled` + `x.message` |
| Who can reply | Yes | `who_can_reply_post` / `x.whoCanReplyPost` |
| Community post | Yes | Community URL → `community_id` at publish |
| Made with AI / Paid partnership | Yes | Content disclosure labels |
| Channel / post analytics | Yes | `analytics:platform`, `analytics:post` (unless `DISABLE_X_ANALYTICS`) |
| Cross-account repost | Yes | `x.crossAccountPlugs` (`x-repost-post-users`) |
| Cross-post to other channels | Yes | Separate `-i` UUIDs and per-channel settings |

## Agent tasks

| User wants to… | Section |
| --- | --- |
| Post text only | [Simple text post](#simple-text-post) |
| Post with images | [Post with images](#post-with-images) |
| Schedule a reply chain | [Scheduled reply chain](#scheduled-reply-chain-thread) |
| End with a finisher reply | [Thread finisher](#thread-finisher) |
| Restrict who can reply | [Compose settings](#compose-settings-reply-audience-community-labels) |
| Repost from other X channels after publish | [x-cross-account-repost.json](./examples/x-cross-account-repost.json) |
| Check channel limits | `openquok integrations:settings "$X_ID"` |

## Provider settings (`x` bucket)

Use nested keys under `x` in `--providerSettingsByIntegrationId` (matches composer and orchestrator).

| Key | Shape | When |
| --- | --- | --- |
| `x.replies` | `[{ "id": "…", "message": "…", "delaySeconds": 60 }]` | Follow-up replies after root tweet |
| `x.enabled` | `true` \| `false` | Enable thread finisher |
| `x.message` | string | Finisher text when `enabled` is true |
| `x.whoCanReplyPost` | `following` \| `mentionedUsers` \| `subscribers` \| `verified` | Reply audience |
| `x.communityUrl` | string | Community URL or id |
| `x.madeWithAi` | boolean | Made with AI label |
| `x.paidPartnership` | boolean | Paid partnership label |
| `x.crossAccountPlugs` | `[{ "plugName": "x-repost-post-users", "enabled": true, "delayMs": 0, "integrationIds": ["<other-integration-id>"], "fields": {} }]` | Repost from other X channels after publish |

Cross-account shape and plug ids: [provider-settings.md](./provider-settings.md#cross-account-plugs-crossaccountplugs).

Flat CLI keys (`who_can_reply_post`, `made_with_ai`, `community`, etc.) merge with the nested bucket at publish time.

## Simple text post

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Hello from OpenQuok!" \
  -i "$X_ID"
```

## Post with images

```bash
MEDIA=$(openquok upload ./photo.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Launch day." \
  -i "$X_ID" \
  -m "$MEDIA"
```

## Scheduled reply chain (thread)

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "1/2 — setup" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    { ($id): { x: { replies: [
      { message: "2/2 — payoff", delaySeconds: 90 }
    ] } } }
  ')"
```

## Thread finisher

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Main tweet" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    { ($id): { x: { enabled: true, message: "Thanks for reading!" } } }
  ')"
```

## Compose settings (reply audience, community, labels)

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -c "Update for the community" \
  -i "$X_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$X_ID" '
    { ($id): { x: { whoCanReplyPost: "following", madeWithAi: true } } }
  ')"
```

## Analytics

```bash
openquok analytics:platform "$X_ID" -d 7
```

Human docs: [cli-examples/x.md](../../../web/src/content/docs/cli-examples/x.md) (repo path for agents with file access).
