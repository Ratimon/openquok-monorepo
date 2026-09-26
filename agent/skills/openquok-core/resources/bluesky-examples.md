# Bluesky — CLI examples

```bash
BSKY_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="bluesky") | .id')
openquok integrations:settings "$BSKY_ID"
```

Run `integrations:settings` for `output.maxLength` (300) and `rules`. Settings mechanics: [provider-settings.md](./provider-settings.md).

JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#bluesky).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text-only post | Yes | No attachment required |
| Images | Yes | Up to **4** per main post or follow-up — upload first (Rule 2) |
| Video | Yes | **1** MP4 per post — never mixed with images |
| 300-grapheme cap | Yes | Main `body`, each `bluesky.replies[].message` on schedule |
| Scheduled follow-up replies | Yes | `bluesky.replies[]` with `delaySeconds`; optional `media` per reply |
| Mention autocomplete | Yes | Composer `@handle`; publish uses facets |
| Channel / post analytics | No | Not exposed in OpenQuok for Bluesky |
| Cross-post to other channels | Yes | Separate `-i` UUIDs per channel |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Post text only | [bluesky-text-only.json](./examples/bluesky-text-only.json) |
| Post with images | [bluesky-images.json](./examples/bluesky-images.json) |
| Schedule a follow-up reply | [bluesky-follow-up.json](./examples/bluesky-follow-up.json) |
| Check channel limits | `openquok integrations:settings "$BSKY_ID"` |

## Provider settings (`bluesky` bucket)

Use nested keys under `bluesky` in `--providerSettingsByIntegrationId` (matches composer and orchestrator).

| Key | Shape | When |
| --- | --- | --- |
| `bluesky.replies` | `[{ "id": "…", "message": "…", "delaySeconds": 60, "media": [...] }]` | Follow-up replies after the root post publishes |

No flat CLI aliases — follow-ups use the `bluesky` bucket only.

### Reply media (`bluesky.replies[].media`)

Optional on each reply row. Same shapes as the main post. Upload first (Rule 2); the worker resolves `path` to a public URL before upload to the host.

- Up to four images or one MP4 per reply — not mixed.
- Omit `media` for text-only follow-ups.

**Follow-up with image** (upload first, then nest under `bluesky.replies`):

```bash
REPLY_MEDIA=$(openquok upload ./reply.png | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -c "Main post text." \
  -i "$BSKY_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$BSKY_ID" --argjson media "$REPLY_MEDIA" '
    { ($id): { bluesky: { replies: [
      { id: "reply-1", message: "Reply with image.", delaySeconds: 120, media: $media }
    ] } } }
  ')"
```

Connect in the dashboard with service URL, handle, and app password — see [social integration docs](https://www.openquok.com/docs/social-integration/bluesky) (no `GET /public/social/bluesky` connect URL).
