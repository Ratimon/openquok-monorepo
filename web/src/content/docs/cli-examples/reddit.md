---
title: Reddit
description: OpenQuok CLI examples for Reddit — manual channel connect, markdown body, subreddit and title settings, media handoff, and awaiting-member completion on reddit.com.
order: 13
lastUpdated: 2026-10-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="reddit" variant="default" /> |
| Max body length | 10,000 characters (<Badge text="-c" variant="param" /> markdown) |
| Optional settings | <strong>Subreddit</strong> (<Badge text="r/name" variant="param" /> or <Badge text="u/name" variant="param" />), <strong>title</strong> (required when Settings are in use) |
| Connect | Dashboard <strong>Add Channel</strong> → Reddit (manual — not <Badge text="GET /public/social/reddit" variant="path" />) |
| When due | Row moves to <strong>awaiting member</strong> — you post on reddit.com; optional extension assists |
| Setup guide | <a href="/docs/social-integration/reddit">Reddit</a> |

```bash
REDDIT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="reddit") | .id')
```

Add Reddit from the workspace first. The CLI cannot create a manual channel or complete member-browser handoff — a human finishes the submit form on reddit.com (and may use the <a href="/docs/installation/chrome-extension">browser extension</a> for copy, open submit, autofill, and media download).

<Callout type="warning">
<p>Scheduling via API or CLI does <strong>not</strong> publish to Reddit. After due time, list posts with <Badge text="AWAITING_MEMBER" variant="param" /> status and complete in the dashboard or extension — there is no public API route for <Badge text="member-browser-complete" variant="param" /> today.</p>
</Callout>

## Global caption (no subreddit in settings)

Schedule shared markdown only — pick the subreddit when you paste on reddit.com:

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "**Markdown body** — complete this post on reddit.com when the row is awaiting member." \
  -i "$REDDIT_ID"
```

## Subreddit and title

Use nested <Badge text="reddit" variant="default" /> settings or flat keys (same as the composer):

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Body and [links](https://example.com) stay in the caption." \
  -i "$REDDIT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$REDDIT_ID" '
    { ($id): { reddit: { subreddit: "r/openquok", title: "Weekly product update" } } }
  ')"
```

Flat keys on <Badge text="--settings" variant="param" />:

```bash
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Same shape with flat subreddit and title keys." \
  -i "$REDDIT_ID" \
  --settings '{"subreddit":"openquok","title":"Release notes"}'
```

Discover valid keys with:

```bash
openquok integrations:settings "$REDDIT_ID"
```

## Post with images

Upload first, then attach <Badge text="media[].path" variant="param" /> on the post. OpenQuok stores the file for handoff — it does not upload to Reddit’s API:

```bash
MEDIA=$(openquok upload ./screenshot.png | jq -c '[.data | {id, path: (.path // .filePath)}]')

openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -t schedule \
  -c "Screenshot walkthrough — download from the extension at due time if needed." \
  -i "$REDDIT_ID" \
  -m "$MEDIA" \
  --settings '{"subreddit":"r/openquok","title":"New feature screenshot"}'
```

## JSON examples

| File | Scenario |
| --- | --- |
| `reddit-global-caption.json` | Markdown body only — no subreddit in settings |
| `reddit-subreddit-title.json` | Nested `reddit.subreddit` and `reddit.title` |
| `reddit-with-image.json` | `media[]` plus flat subreddit and title |

Copy from the <Badge text="openquok-core" variant="default" /> skill after install: <Badge text="resources/examples/reddit-*.json" variant="path" /> (see <a href="/docs/getting-started-for-cli">Get Started for CLI</a>).

```bash
openquok posts:create --json ./examples/reddit-subreddit-title.json
```

Agent task tables and pitfalls: skill resource <Badge text="reddit-examples.md" variant="path" /> in the installed skill bundle.

## Related

<CardGrid>
<LinkCard title="Reddit setup" description="Manual channel connect and member browser handoff" href="/docs/social-integration/reddit" />
<LinkCard title="Media rules" description="Reddit body cap and handoff media" href="/docs/platforms/media-rules" />
<LinkCard title="CLI examples index" description="All channel recipes" href="/docs/cli-examples" />
<LinkCard title="Managing posts" description="posts:create flags and provider settings" href="/docs/cli-usages/managing-posts" />
</CardGrid>
