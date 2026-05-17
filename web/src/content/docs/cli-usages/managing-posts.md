---
title: Managing Posts
description: Create, list, delete, and reconnect Openquok posts/post group from the command line.
order: 1
lastUpdated: 2026-05-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The <Badge text="posts:*" variant="default" /> commands wrap the <a href="/docs/apis-posts">Posts APIs</a>. They drive every step of the publishing lifecycle: pick channels and a schedule time, create a post group, iterate on it, then delete it or reconnect it to its provider-native id once it is published.

<Callout type="note" title="Post groups vs. post rows">
<p>A <strong>post group</strong> is the multi-channel composition the UI calls a post; its id is returned as <code>postGroup</code> from <Badge text="posts:create" variant="default" /> and on list rows. Full <strong>get / update / delete group</strong> over HTTP is for the signed-in app only — use the workspace or session <code>/posts/group/…</code> APIs. The CLI uses <strong>post row</strong> ids from <Badge text="posts:list" variant="default" /> for <Badge text="posts:status" variant="default" />, <Badge text="posts:delete" variant="default" />, <Badge text="posts:missing" variant="default" />, and <Badge text="posts:connect" variant="default" />.</p>
</Callout>

## Create a post

The simplest case: one channel, one body, one scheduled timestamp. You can use short flags (<code>-c</code>, <code>-s</code>, <code>-i</code>, …) or the long names that match <Badge text="POST /public/posts" variant="path" />.

```bash
openquok posts:create \
  -c "Hello from Openquok" \
  -s "2026-01-15T12:00:00Z" \
  -i "<integration-id>"
```

| Flag | Description |
| --- | --- |
| <Badge text="-c" variant="param" /> <Badge text="--content" variant="param" /> | Post body. Repeat for thread-style segments; extra segments map to provider <code>replies</code> when supported (see <a href="/docs/cli-examples/threads">Threads examples</a>). Long form: <Badge text="--body" variant="param" />. |
| <Badge text="-s" variant="param" /> <Badge text="--date" variant="param" /> | Schedule time (ISO-8601, required unless <Badge text="-j" variant="param" />). Same as <Badge text="--scheduledAt" variant="param" />. |
| <Badge text="-t" variant="param" /> <Badge text="--type" variant="param" /> | <code>schedule</code> (default) or <code>draft</code> — maps to API <code>scheduled</code> / <code>draft</code>. Long form: <Badge text="--status" variant="param" /> <code>scheduled</code> \| <code>draft</code>. |
| <Badge text="-i" variant="param" /> <Badge text="--integrations" variant="param" /> | Comma-separated channel ids (required unless <Badge text="-j" variant="param" />). Same as <Badge text="--integrationIds" variant="param" />. |
| <Badge text="-m" variant="param" /> <Badge text="--media" variant="param" /> | Comma-separated storage paths or URLs per flag (the CLI supplies a placeholder media id when you did not run upload). Values from repeated <code>-m</code> are merged into the root post's <code>media</code> list. Prefer upload JSON; for attachments on individual follow-up lines use <a href="/docs/cli-examples/threads">Threads examples</a> or <Badge text="-j" variant="param" />. |
| <Badge text="-d" variant="param" /> <Badge text="--delay" variant="param" /> | Milliseconds between segments when using multiple <code>-c</code> (default <code>5000</code>); converted to reply <code>delaySeconds</code>. |
| <Badge text="--settings" variant="param" /> | Platform-specific settings JSON; merged into each selected integration. |
| <Badge text="-j" variant="param" /> <Badge text="--json" variant="param" /> | Path to a JSON file whose root object is the full <Badge text="POST /public/posts" variant="path" /> body (skips other flags). |
| <Badge text="--bodiesByIntegrationId" variant="param" /> | JSON object keyed by integration UUID; each value is the per-channel body override. |
| <Badge text="--providerSettingsByIntegrationId" variant="param" /> | JSON map of provider-specific settings (see <a href="/docs/cli-examples">CLI Examples</a>). |
| <Badge text="--tagNames" variant="param" /> | Comma-separated workspace tag names. |
| <Badge text="--repeatInterval" variant="param" /> | Backend repeat enum (e.g. <code>weekly</code>). |
| <Badge text="-n" variant="param" /> <Badge text="--note" variant="param" /> | Human review checklist / todo for the account kanban (agent creates only; max 2000 chars). Same field as <Badge text="posts:review-todo" variant="default" />. |

### Draft instead of scheduling

```bash
openquok posts:create \
  -c "Review before publishing" \
  -s "2026-01-15T12:00:00Z" \
  -t draft \
  -i "<integration-id>"
```

### Agent draft with a human review todo

When an AI agent creates a draft for a human to approve, pass <Badge text="--note" variant="param" /> so the checklist appears on the account kanban (filter **Agent**). The CLI always sets <Badge text="isAgent: true" variant="param" /> on create. Update the note later with <Badge text="posts:review-todo" variant="default" />; humans clear the agent flag when they mark reviewed in the dashboard.

```bash
openquok posts:create \
  -c "Launch week announcement" \
  -s "2026-01-15T12:00:00Z" \
  -t draft \
  -i "<integration-id>" \
  --note "Confirm CTA URL and UTM params before scheduling"
```

See <a href="/docs/apis-posts/review-todo">Update Review Todo</a> and <a href="/docs/installation/development-environment#smoke-test-post-kanban-review-cli--web">Development environment → Kanban smoke test</a>.

### Post for Different Body per Channel

Pass `--bodiesByIntegrationId` to customize each row; the canonical `--body` becomes a fallback:

```bash
openquok posts:create \
  -s "2026-01-15T12:00:00Z" \
  -i "<threads-integration-id>,<instagram-integration-id>" \
  -c "Fallback body" \
  --bodiesByIntegrationId '{"<threads-integration-id>":"Threads-only caption","<instagram-integration-id>":"Instagram-only caption #photography"}'
```

### Post and Attach media

Upload the asset first (returns `data.id` and `data.path`), then pass them back as JSON:

```bash
MEDIA=$(openquok upload ./photo.jpg | jq -c '{id: .data.id, path: .data.filePath}')

openquok posts:create \
  -s "2026-01-15T12:00:00Z" \
  -c "Check this out!" \
  -i "<integration-id>" \
  -m "[${MEDIA}]"
```

### Threads and follow-up comments

Pass <Badge text="-c" variant="param" /> more than once to build a **chain of messages**: the first becomes the main <code>body</code>; each extra <Badge text="-c" variant="param" /> becomes a scheduled follow-up in <code>replies</code> (with <code>message</code> and <code>delaySeconds</code>).

Providers that support that shape (for example Threads) are covered in depth on <a href="/docs/cli-examples/threads">CLI Examples → Threads</a>.

You can still repeat <Badge text="-m" variant="param" /> for paths or upload JSON blobs; the CLI **collects them into one root-level <code>media</code> array** on the post. If a follow-up line needs its **own** media, build <code>providerSettingsByIntegrationId</code> by hand, use <Badge text="-j" variant="param" /> with a full JSON body, or follow the jq recipes on the Threads page.

```bash
openquok posts:create \
  -c "Thread 1/3" -m "image1.jpg" \
  -c "Thread 2/3" -m "image2.jpg" \
  -c "Thread 3/3" \
  -s "2026-01-15T10:00:00Z" \
  -i "<integration-id>"
```

Use <Badge text="-d" variant="param" /> to set the gap **in milliseconds** between consecutive follow-ups (default <code>5000</code> when omitted).

```bash
openquok posts:create \
  -c "First segment" \
  -c "Second segment" \
  -c "Third segment" \
  -s "2026-01-15T10:00:00Z" \
  -d 2000 \
  -i "<integration-id>"
```

<Callout type="note" title="One integration id for scripted threads">
<p>The shorthand above assumes a <strong>single</strong> channel UUID in <code>-i</code> so the follow-up <code>replies</code> map cleanly. For multiple channels in one command, the same <code>replies</code> payload is merged into each integration's provider settings — only use that when it matches how you want every platform to behave.</p>
</Callout>

<Callout type="warning" title="Per-platform media rules">
<p>Instagram requires at least one attachment for <code>scheduled</code> posts; Threads accepts text-only. Each provider has its own validation — Check with <a href="/docs/cli-usages/integrations">`openquok integrations:settings`</a> before you script a batch.</p>
</Callout>

### Multi-channel post (same body)

Send one canonical <Badge text="--body" variant="param" /> / <Badge text="-c" variant="param" /> to every channel by listing several integration ids in a single comma-separated <Badge text="-i" variant="param" /> argument (same wire shape as <code>integrationIds: string[]</code> on <Badge text="POST /public/posts" variant="path" />).

```bash
openquok posts:create \
  -c "Posting everywhere!" \
  -s "2026-01-15T12:00:00Z" \
  -i "<integration-id-1>,<integration-id-2>,<integration-id-3>"
```

When channels need different copy, use <Badge text="--bodiesByIntegrationId" variant="param" /> (see above) instead of relying on a single body.

### Platform-specific settings

Some providers expect extra fields (post type, subreddit, thread replies, and so on). The CLI accepts a JSON object with <Badge text="--settings" variant="param" /> and merges it into <code>providerSettingsByIntegrationId</code> for **each** integration id you passed with <Badge text="-i" variant="param" />. Deeper per-channel control lives in <Badge text="--providerSettingsByIntegrationId" variant="param" />; keys from <Badge text="--settings" variant="param" /> override the same keys from that map when both are present.

```bash
openquok posts:create \
  -c "Check out this discussion" \
  -s "2026-01-15T12:00:00Z" \
  --settings '{"subreddit":[{"value":{"subreddit":"programming","title":"My Post","type":"text"}}]}' \
  -i "<integration-id>"
```

Discover valid shapes with <a href="/docs/cli-usages/integrations"><code>openquok integrations:settings &lt;integration-id&gt;</code></a> and the <a href="/docs/cli-usages/integrations">Integrations</a> CLI page.

### Create from a JSON file

For posts with detailed platform-specific content (large <code>providerSettingsByIntegrationId</code>, many tags, or bodies per channel), use the <a href="/account/payload-wizard">Payload Wizard</a> to build the request and copy a JSON body:

```bash
openquok posts:create -j post.json
```

Example <code>post.json</code> (placeholders only — replace ids and timestamps with values from your workspace):

```json
{
  "scheduledAt": "2026-01-15T12:00:00.000Z",
  "status": "scheduled",
  "body": "Short default caption when a channel has no override.",
  "integrationIds": [
    "<integration-id-1>",
    "<integration-id-2>"
  ],
  "bodiesByIntegrationId": {
    "<integration-id-1>": "Short version for channel A.",
    "<integration-id-2>": "Longer version for channel B."
  },
  "providerSettingsByIntegrationId": {
    "<integration-id-1>": {
      "replies": [{ "message": "Follow-up only on this channel", "delaySeconds": 60 }]
    },
    "<integration-id-2>": {
      "__type": "instagram"
    }
  },
  "tagNames": ["launch-week"]
}
```

<Callout type="note" title="JSON is the public API, not provider-specific">
<p>The file mirrors <code>PublicCreatePostDto</code> in the SDK: an <code>integrationIds</code> array, optional <code>body</code> / <code>bodiesByIntegrationId</code> / <code>media</code> / <code>providerSettingsByIntegrationId</code>, plus <code>scheduledAt</code> and <code>status</code>. There is no separate nested <code>posts</code> array keyed by provider name in this endpoint.</p>
</Callout>

## List posts


```bash
openquok posts:list
```

### List posts (Filter by Date Range)

Override the window with explicit ISO timestamps:

```bash
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z"
```

Same window with the long names: <Badge text="--start" variant="param" /> / <Badge text="--end" variant="param" />.

<Callout type="note" title="Defaults in CLI">
<p><Badge text="GET /public/posts/list" variant="path" /> requires <code>start</code> and <code>end</code>. The CLI fills omitted flags with ±30 local calendar days from today (ISO UTC on the wire). Optional <code>customerGroupId</code> narrows by channel group. SDK and raw HTTP clients must send both dates; see <a href="/docs/apis-posts/list">List Posts</a>.</p>
</Callout>


Filter to specific channels by passing a comma-separated list of integration ids:

```bash
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z" \
  -i "<integration-id-1>,<integration-id-2>"
```

### List posts (Filter by customer group)

Use the channel-group id from your workspace (row id in <code>integration_customers</code>; assign integrations to groups in the dashboard). The CLI sends it as the <code>customerGroupId</code> query parameter on <Badge text="GET /public/posts/list" variant="path" />.

```bash
openquok posts:list --customer <customer-group-id>
```

<p>Alias for <Badge text="--customerGroupId" variant="param" /> (channel-group id).</p>

You can combine <code>--customerGroupId</code> with <code>-i</code> / <code>--integrationIds</code>: only integrations that belong to **both** the group and the CSV are queried.

To find post rows whose provider id could not be mapped yet (database column <code>release_id</code> is the string <code>missing</code>; JSON responses use <code>releaseId</code>), see <a href="#connecting-missing-posts">Connecting missing posts</a>.

## Connecting missing posts

Some platforms do not return a stable published asset id right away. The worker then stores <code>release_id = 'missing'</code> on the row; the list API exposes that as <code>releaseId: "missing"</code> (camelCase). Per-post analytics stay blocked until you link the row to the real provider id.

<Callout type="note" title="When `posts:missing` returns nothing">
<p>The backend only calls a provider-specific enumerator when the integration implements the optional <code>missing</code> hook and the row still has <code>release_id === "missing"</code>. Otherwise the list-missing endpoint returns <code>data.items: []</code>. See <a href="/docs/apis-posts/missing">Get missing content</a>.</p>
</Callout>

### List available content

```bash
openquok posts:missing <post-id>
```

The CLI prints the API envelope, for example:

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "example-provider-release-id", "url": "https://example.com/preview-cover.jpeg" },
      { "id": "example-provider-release-id-alt", "url": "https://example.com/preview-cover-2.jpeg" }
    ]
  }
}
```

Narrow to id and preview URL:

```bash
openquok posts:missing <post-id> | jq '.data.items[] | {id, url}'
```

### Connect a post

After you pick the matching provider id from the list above, connect the row:

```bash
openquok posts:connect <post-id> -r "example-provider-release-id"
```

### Full workflow

```bash
# 1. Find post rows that still need a release id (unwrap data.posts from the list response)
openquok posts:list \
  --start "2026-01-01T00:00:00Z" \
  --end "2026-02-01T00:00:00Z" \
  | jq '.data.posts[] | select(.releaseId == "missing") | {id, content, integrationId}'

# 2. Ask the provider for recent candidates (replace <post-id>)
openquok posts:missing <post-id> | jq '.data.items'

# 3. Link the correct provider id
openquok posts:connect <post-id> -r "example-provider-release-id"

# 4. Confirm per-post analytics resolve (pick a window the CLI accepts)
openquok analytics:post <post-id> -d 7
```

## Update, and delete a post

### Changing post status

Move a post between <code>draft</code> and <code>scheduled</code> **without changing its publish date**. Pass any **post row** id from <Badge text="posts:list" variant="default" /> (the <code>id</code> field — the same identifier you use for <Badge text="posts:delete" variant="default" />).

```bash
openquok posts:status <post-id> -s draft
openquok posts:status <post-id> -s schedule
```

| Flag | Description |
| --- | --- |
| <Badge text="-s" variant="param" /> <Badge text="--status" variant="param" /> | <code>draft</code> — moves a scheduled group back to draft and **terminates** any in-flight publishing workflow, so it will not publish until you promote it again. <code>schedule</code> or <code>scheduled</code> — promotes a draft into the publishing queue and **(re)starts** the workflow so it publishes at the **stored** time. |

Use this when you want to pause a scheduled post without deleting it, or hand a draft to the scheduler once it is ready.

### Deleting posts

```bash
openquok posts:delete <post-id>
```

Soft-deletes the **post row** you name and the **whole post group** it belongs to (a row never publishes in isolation). To target a group by id alone, use the workspace; the public API deletes by row id (`DELETE /public/posts/{postId}`).


## End-to-end workflow

```bash
INTEGRATION_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')

MEDIA=$(openquok upload ./hero.png | jq -c '{id: .data.id, path: .data.filePath}')

POST_ID=$(openquok posts:create \
  -s "2026-01-20T15:00:00Z" \
  -t schedule \
  -c "Scheduled with media" \
  -i "$INTEGRATION_ID" \
  -m "[${MEDIA}]" \
  | jq -r '.data.posts[0].id')

openquok posts:status "$POST_ID" -s draft
```

## Related

<CardGrid>
<LinkCard title="Integrations" description="Connect accounts, find integration IDs, and dynamic options for each channel" href="/docs/cli-usages/integrations" />
<LinkCard title="Media Upload" description="Upload images or files from your machine and attach them when you create or schedule posts" href="/docs/cli-usages/media-upload" />
<LinkCard title="Analytics" description="Review how published posts performed after they go live" href="/docs/cli-usages/analytics" />
<LinkCard title="Posts APIs" description="Call the API for the same create, update, and list workflows as the CLI" href="/docs/apis-posts" />
</CardGrid>
