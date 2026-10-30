# Reddit (`reddit`) — CLI examples

```bash
REDDIT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="reddit") | .id')
openquok integrations:settings "$REDDIT_ID"
```

**Connect in the dashboard first** — the CLI cannot add Reddit. In the workspace, use **Add Channel → Reddit** (manual channel; no Reddit OAuth or extension cookie connect). `GET /api/v1/public/social/reddit` returns **400**; there is no public OAuth start URL.

Run `integrations:settings` for `output.rules`, `output.maxLength`, and typed `settingsSchema`. Reddit has **no** allow-listed `integrations:trigger` tools.

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#reddit).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Manual dashboard connect | Yes | **Add Channel → Reddit** — agents cannot connect via CLI |
| Markdown body | Yes | Root `-c` / `body` caption (up to **10,000** characters) |
| Global copy-only schedule | Yes | Empty `subreddit` and `title` — shared caption only; member pastes on reddit.com when due |
| Community / profile + title | Yes | Optional `subreddit` / `title` (or `reddit.*`) for strict validation and submit URLs — `r/name`, `u/name`, or bare name (defaults to `r/`) |
| Media on handoff | Yes | Upload first (Rule 2); extension can download assets during member browser handoff — **no** server-side Reddit media API |
| Schedule / draft via API | Yes | Same `posts:create` shape as other channels |
| Member browser handoff | Yes | At due time the row becomes **awaiting member** — finish on reddit.com; extension optional (copy / open submit / autofill) |
| Mark complete | Yes | Human marks posted in dashboard or extension after submitting on reddit.com |
| Server publish | No | OpenQuok never posts to Reddit from the backend |
| Follow-up comments / plugs | No | Not supported on `reddit` |
| Channel / post analytics | No | Not available for Reddit in OpenQuok |
| Browser extension cookie connect | No | Extension assists handoff only — not Skool-style session connect |
| Public OAuth connect | No | Dashboard manual channel only |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Schedule shared caption only (any subreddit at post time) | [reddit-global-caption.json](./examples/reddit-global-caption.json) |
| Schedule with target community and title | [reddit-subreddit-title.json](./examples/reddit-subreddit-title.json) |
| Attach image(s) for handoff download | [reddit-with-image.json](./examples/reddit-with-image.json) |
| List Reddit rows awaiting member action | `openquok posts:list \| jq '.items[] \| select(.identifier=="reddit" and .state=="AWAITING_MEMBER")'` |
| See typed settings schema | `openquok integrations:settings "$REDDIT_ID"` |
| Complete the post on reddit.com | Tell the human: open the dashboard or extension handoff — **you** click Post on reddit.com, then mark complete. Do **not** assume `posts:create` means publish succeeded. |
| Complete handoff via org API key only | **Not available** — member-browser handoff completion uses dashboard session (`Bearer` token), not `opo_` public routes. Schedule with the API/CLI; human finishes in the browser. |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Reddit UUID. Nested `reddit.*` matches the web composer bucket.

| Key | Values | When |
| --- | --- | --- |
| `subreddit` | string (`r/name`, `u/name`, or bare name → `r/`) | Optional for global copy-only; **required** when any per-channel Settings field is set |
| `community` / `sub` | string | Aliases for `subreddit` |
| `title` | string (1–300 chars) | Optional for global copy-only; **required** when per-channel Settings are active |
| `reddit.subreddit` | string | Same as `subreddit` |
| `reddit.title` | string | Same as `title` |

**Rules:** Body text and markdown links live in the composer caption (`body` / `-c`), not in `title`. When `subreddit` or `title` is set, validation requires a valid community/profile and a non-empty title. After the scheduled time, status becomes **AWAITING_MEMBER** until a member posts on reddit.com and marks the row complete.

## Run an example

Replace `<integration-id>` and media placeholders from `openquok upload` / `upload-from-url`.

```bash
openquok posts:create --json ./examples/reddit-global-caption.json
openquok posts:create --json ./examples/reddit-subreddit-title.json
openquok posts:create --json ./examples/reddit-with-image.json
```

## Discover integration

```bash
openquok integrations:settings "$REDDIT_ID"
openquok posts:list | jq '.items[] | select(.identifier=="reddit") | {id, state, scheduledAt}'
```

Setup and handoff flow: [Reddit social integration](https://www.openquok.com/docs/social-integration/reddit).
