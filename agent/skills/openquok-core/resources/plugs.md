# Plugs — internal and global

OpenQuok **plugs** automate engagement after a post goes live. They are included on all paid plans (see [pricing](https://www.openquok.com/pricing)).

| Type | Scope | When it runs | Configure via CLI |
| --- | --- | --- | --- |
| **Internal plugs** | Per post (compose time) | After publish — same account or other connected channels in the workspace | Yes — `providerSettingsByIntegrationId` on `posts:create` |
| **Global plugs** | Per channel (account rules) | When a published post crosses a likes threshold; checks every 6h, up to 3 runs | Yes — `plugs:catalog`, `plugs:list`, `plugs:upsert`, `plugs:activate`, `plugs:delete` |

Provider support is plug-based only — not every channel has plugs. Facebook, Instagram, YouTube, and TikTok do **not** expose internal or global plugs today.

---

## Internal plugs

Boost engagement from **the publishing channel** or **other connected channels in the same workspace** after the post is live.

### Same-account (Threads only)

Schedule an extra reply from the **same** Threads channel after follow-up replies and the thread finisher complete.

| Provider bucket | Key | Example |
| --- | --- | --- |
| `threads` | `threads.internalEngagementPlug` | `{ "enabled": true, "message": "…", "delaySeconds": 300 }` |

Example: [threads-engagement-plug.json](./examples/threads-engagement-plug.json).

### Cross-account

Other connected channels act on the post (comment, repost, reshare). Configure on the **publishing** integration’s provider bucket via `crossAccountPlugs`.

| Provider bucket | Plug id | Action |
| --- | --- | --- |
| `threads` | `threads-cross-account-comment` | Comment from other Threads channels (`fields.comment`) |
| `x` | `x-repost-post-users` | Repost from other X channels |
| `linkedin` / `linkedin-page` | `linkedin-add-comment` | Comment from other LinkedIn channels (`fields.comment`) |
| `linkedin` / `linkedin-page` | `linkedin-repost-post-users` | Reshare from other LinkedIn channels |

Each `crossAccountPlugs` entry:

```json
{
  "plugName": "threads-cross-account-comment",
  "enabled": true,
  "delayMs": 0,
  "integrationIds": ["<acting-integration-id>"],
  "fields": { "comment": "Nice post!" }
}
```

- `delayMs` — milliseconds after publish (0 = immediately; composer offers 1h–24h presets).
- `integrationIds` — UUIDs of **acting** channels from `openquok integrations:list` (must not include the publishing integration).
- `fields` — plug-specific strings (`comment` for comment plugs; `{}` for repost/reshare plugs).

Examples: [threads-cross-account-plug.json](./examples/threads-cross-account-plug.json), [x-cross-account-repost.json](./examples/x-cross-account-repost.json).

Full key reference: [provider-settings.md](./provider-settings.md#internal-plugs).

---

## Global plugs

Channel-level rules that fire when a **published** post reaches a **likes threshold** (e.g. 100 likes). The orchestrator re-checks every **6 hours**, up to **3 times** per post.

| Channel | Rules available |
| --- | --- |
| Threads | Auto plug post — publish a reply when likes ≥ threshold |
| X | Auto repost — repost when likes ≥ threshold; Auto plug post — reply when likes ≥ threshold |
| LinkedIn Page | Auto repost — reshare when likes ≥ threshold; Auto plug post — comment when likes ≥ threshold |

Personal LinkedIn (`linkedin`) has internal plugs only — no global plug catalog.

### CLI commands

```bash
# Discover plug types and field names for a provider
openquok plugs:catalog | jq '.plugs[] | select(.identifier=="threads")'

# List saved rules on a channel
openquok plugs:list <integration-id>

# Create a Threads auto-reply at 100 likes
openquok plugs:upsert <integration-id> \
  --func autoPlugPost \
  --fields '[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for reading!"}]'

# Pause or resume a rule
openquok plugs:activate <plug-id> --activated false

# Remove a rule
openquok plugs:delete <plug-id>
```

Use `methodName` from `plugs:catalog` as `--func`. Field names match the catalog `fields[].name` entries (`likesAmount`, `post`, …).

The web app **Account → Plugs** (`/account/plugs`) offers the same rules with a UI.

---

## Quick reference by channel

| Channel | Internal plugs | Global plugs | Channel doc |
| --- | --- | --- | --- |
| Threads | Same-account reply, cross-account comment | Auto plug post | [threads-examples.md](./threads-examples.md) |
| X | Cross-account repost | Auto repost, auto plug post | [x-examples.md](./x-examples.md) |
| LinkedIn | Cross-account comment, cross-account reshare | — | [linkedin-examples.md](./linkedin-examples.md) |
| LinkedIn Page | Cross-account comment, cross-account reshare | Auto repost, auto plug post | [linkedin-page-examples.md](./linkedin-page-examples.md) |
