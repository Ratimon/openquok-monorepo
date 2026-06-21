# Instagram — business (`instagram-business`)

Professional Instagram account connected via **Facebook Login for Business** (Page-linked). Confirm keys with `integrations:settings` for your workspace row.

```bash
IG_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-business") | .id')
openquok integrations:settings "$IG_BUSINESS_ID"
```

Posting behavior matches **Instagram (Standalone)** — only OAuth and token host differ. See [instagram-standalone-examples.md](./instagram-standalone-examples.md) for the same recipes with `instagram-standalone`.

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#instagram).

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Post a feed image | [instagram-feed-post.json](./examples/instagram-feed-post.json) |
| Post a carousel | [instagram-carousel.json](./examples/instagram-carousel.json) |
| Publish a Reel | [instagram-reel.json](./examples/instagram-reel.json) |
| Publish a Story | [instagram-story.json](./examples/instagram-story.json) |
| Test a Trial Reel with collaborators | [instagram-trial-reel.json](./examples/instagram-trial-reel.json) |
| Add text comments after publish | [instagram-follow-up-comments.json](./examples/instagram-follow-up-comments.json) |
| Check limits and tools | `openquok integrations:settings "$IG_BUSINESS_ID"` |

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Feed image post | Yes | At least one attachment required for `scheduled` |
| Carousel (2–10 items) | Yes | Auto when `-m` has multiple attachments and `post_type` is not `story` |
| Reel (single video) | Yes | One `.mp4` attachment → Reels surface |
| Story | Yes | `post_type: "story"`; one attachment; no collaborators |
| Trial Reel | Yes | `is_trial_reel` + single MP4; not combinable with Stories |
| Collaborators (max 3) | Yes | Feed/Reel **single** media only — not carousel, not Stories |
| Graduation strategy | Yes | `MANUAL` or `SS_PERFORMANCE` when `is_trial_reel` is true |
| Text follow-up comments | Yes | `instagram.replies` in provider settings |
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
| `instagram.replies` | `[{ "id": "…", "message": "…", "delaySeconds": 60 }]` | `[]` | Scheduled text comments (nested bucket in JSON) |

## Run an example

Use the same JSON files with an `instagram-business` integration UUID:

```bash
openquok posts:create --json ./examples/instagram-feed-post.json
```
