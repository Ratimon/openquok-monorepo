---
title: Overview - MCP Examples
description: OpenQuok MCP agent workflows — prompts or examples for scheduling, posts management, analytics, plugs, directory launch, and per-platform recipes.
order: 0
lastUpdated: 2026-10-22
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Copy-pasteable recipes for AI agents using OpenQuok MCP, grouped by social channel or directory launch platform. Each social page shows what you can **ask your agent** in plain language and the tool payloads the agent builds behind the scenes — <Badge text="schedulePostTool" variant="default" />, <Badge text="postsList" variant="default" />, <Badge text="analyticsPost" variant="default" />, <Badge text="plugsUpsert" variant="default" />, and more. Directory pages use <Badge text="directoryProfilesList" variant="default" />, <Badge text="directoryVariantsEnsure" variant="default" />, <Badge text="directoryProfilesUpdate" variant="default" />, <Badge text="directoryListingSummary" variant="default" />, and <Badge text="directorySeoOverview" variant="default" /> for profiles, variants, filling copy, readiness, and cached SEO. Tool intent tables: <a href="/docs/mcp-references/tools#directory-launch">Tools reference — Directory launch</a>.

<Callout type="note">
<p>OpenQuok ships first-party <strong>social</strong> providers for <strong>Meta Threads</strong>, <strong>Facebook Page</strong>, <strong>Instagram</strong> (Business and Standalone), <strong>YouTube</strong>, <strong>TikTok</strong>, <strong>X</strong>, and <strong>LinkedIn</strong>. Additional social pages appear when new providers land in <Badge text="backend/integrations/providers/" variant="path" />.</p>
</Callout>

### Social channels

<CardGrid>
<LinkCard title="Facebook Page" description="Text, photos, link previews, and follow-up comments" href="/docs/mcp-examples/facebook" />
<LinkCard title="Instagram" description="Feed posts and reels with public image or video URLs" href="/docs/mcp-examples/instagram" />
<LinkCard title="Meta Threads" description="Scheduled posts, reply chains, and provider tools" href="/docs/mcp-examples/threads" />
<LinkCard title="YouTube" description="MP4 uploads with title, privacy, and tags" href="/docs/mcp-examples/youtube" />
<LinkCard title="TikTok" description="Videos and photo carousels with privacy settings" href="/docs/mcp-examples/tiktok" />
<LinkCard title="LinkedIn" description="Text posts, document carousels, and first-comment chains" href="/docs/mcp-examples/linkedin" />
<LinkCard title="X" description="Tweets, media, and multi-part threads" href="/docs/mcp-examples/x" />
</CardGrid>

<Callout type="note" title="Directory launch is not social posting">
<p><strong>Directory launch</strong> prepares your product on <a href="/account/products">My Products</a> for sites like <strong>PeerPush</strong> and <strong>Uneed</strong>. Agents use <Badge text="directoryProfilesList" variant="default" />, <Badge text="directoryVariantsEnsure" variant="default" />, and related tools — not <Badge text="schedulePostTool" variant="default" />. You still submit on the directory site with the browser extension.</p>
</Callout>

<Callout type="tip" title="Main profile and site copy">
<p>Your <strong>main product profile</strong> is the default record for your product. A <strong>directory variant</strong> is an optional copy for one launch site so you can tailor tagline and description for PeerPush or Uneed without changing every other destination.</p>
<p>Before <Badge text="directoryVariantsEnsure" variant="default" />, call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" />. That lists only main profiles so the agent passes the correct main id. Without <Badge text="mainOnly" variant="param" />, the response also includes site copies.</p>
<p>See <a href="/docs/getting-started/glossary#directory-launch">Glossary — Directory launch</a> for definitions.</p>
</Callout>

### Directory launch

<CardGrid>
<LinkCard title="PeerPush" description="Product profiles, peerpush variants, listing summary, and cached directory SEO" href="/docs/mcp-examples/peerpush" />
<LinkCard title="Uneed" description="Product profiles, uneed variants, listing summary, and cached directory SEO" href="/docs/mcp-examples/uneed" />
</CardGrid>

## List connected channels

After configuring your MCP client, ask:

> List my connected social media accounts

The agent calls <Badge text="integrationList" variant="default" /> and returns channel names, provider identifiers, and UUIDs. Save the UUID you need for scheduling.

## Multi-channel blast

> Publish the same announcement to all my connected channels right now.

```json
{
  "type": "now",
  "socialPost": [
    {
      "integration": "<integration-id-1>",
      "postsAndComments": ["We just shipped a new feature!"]
    },
    {
      "integration": "<integration-id-2>",
      "postsAndComments": ["We just shipped a new feature!"]
    }
  ]
}
```

Use <Badge text="integrationList" variant="default" /> to build one <Badge text="socialPost" variant="param" /> entry per channel.

## Bulk schedule across days

> Schedule five motivational posts to my X account — one per weekday next week at 10am UTC.

Each item in <Badge text="socialPost" variant="param" /> is an independent post with its own <Badge text="date" variant="param" />, content, and settings:

```json
{
  "type": "schedule",
  "date": "2026-06-30T10:00:00.000Z",
  "socialPost": [
    {
      "integration": "<x-integration-id>",
      "postsAndComments": ["Monday motivation"],
      "settings": { "who_can_reply_post": "everyone" }
    }
  ]
}
```

Repeat with different <Badge text="date" variant="param" /> values (or ask the agent to batch multiple entries in one <Badge text="schedulePostTool" variant="default" /> call).

## List and manage posts

> Show me all scheduled posts for the next two weeks.

The agent calls <Badge text="postsList" variant="default" /> with <Badge text="start" variant="param" /> and <Badge text="end" variant="param" /> ISO timestamps. Use <Badge text="postsStatus" variant="default" /> to flip a row between draft and scheduled at the same time, <Badge text="postsReschedule" variant="default" /> to move the publish slot, <Badge text="postsDelete" variant="default" /> to remove it, or <Badge text="postsReviewTodo" variant="default" /> to set a kanban review note.

> Move post X to tomorrow at 2pm UTC

> Find a free slot on my Threads channel next week.

The agent calls <Badge text="postsFindSlot" variant="default" /> with the channel UUID, then passes the returned <Badge text="date" variant="param" /> into <Badge text="schedulePostTool" variant="default" />.

## Per-post analytics

> How did my Threads post from last Tuesday perform over the last 30 days?

1. Call <Badge text="postsList" variant="default" /> to find the <Badge text="postId" variant="param" />.
2. Call <Badge text="analyticsPost" variant="default" /> with <Badge text="days: 30" variant="param" />.

If <Badge text="release_id" variant="param" /> is <Badge text="missing" variant="default" />, call <Badge text="postsMissing" variant="default" /> then <Badge text="postsConnect" variant="default" /> before analytics will return data.

## Global plugs

> Create a global plug on my X channel that auto-replies when a post hits 50 likes.

See <a href="/docs/mcp-examples/threads">MCP examples — Threads</a>, <a href="/docs/mcp-examples/x">X</a>, and <a href="/docs/mcp-examples/linkedin">LinkedIn</a> for <Badge text="plugsCatalog" variant="default" /> → <Badge text="plugsUpsert" variant="default" /> walkthroughs. Global plugs are supported on Threads, X, and LinkedIn Page only. Cross-account comments on create use <Badge text="schedulePostTool.settings" variant="param" /> instead — see <a href="/docs/mcp-examples/threads">Threads cross-account example</a>.

## Directory launch and SEO

> List my directory product profiles, ensure a PeerPush variant for my main profile, and show which directories are ready to launch.

The agent calls <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly" variant="param" />, <Badge text="directoryVariantsEnsure" variant="default" /> with <Badge text="directorySiteKey" variant="param" /> <Badge text="peerpush" variant="default" />, then <Badge text="directoryListingSummary" variant="default" /> for readiness per destination. See <a href="/docs/mcp-examples/peerpush">MCP examples — PeerPush</a> and <a href="/docs/mcp-examples/uneed">Uneed</a> for per-site prompts.

> What are my directory SEO ratings and when were they last checked?

Call <Badge text="directorySeoOverview" variant="default" /> with your main <Badge text="productProfileId" variant="param" />. Use <Badge text="checkedAt" variant="param" /> on each metric and <Badge text="manualRefreshAvailableAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## Conventions used in these pages

- Replace <Badge text="&lt;integration-id&gt;" variant="param" /> (and suffixed variants like <Badge text="&lt;threads-integration-id&gt;" variant="param" />) with UUIDs from <Badge text="integrationList" variant="default" />.
- Agent prompts use natural language — see <a href="/docs/getting-started-for-mcp">MCP introduction</a> for the canonical prompt shape (<Badge text="action" variant="param" /> to <Badge text="channel" variant="param" /> <Badge text="when" variant="param" />: <Badge text="body" variant="param" />).
- <Badge text="attachments" variant="param" /> must be public <Badge text="https://" variant="new" /> URLs. OpenQuok downloads each URL, uploads it to your workspace media storage, then attaches it to the post.

<Callout type="tip" title="Attach media in chat">
<p>Instead of pasting a public URL in your prompt, you can attach an image or video file directly in your MCP client chat (paste, drag-and-drop, or the attachment control). The agent uploads the file and fills <Badge text="attachments" variant="param" /> before calling <Badge text="schedulePostTool" variant="default" />.</p>
</Callout>

<Callout type="warning" title="Rate limits">
<p>Public API and MCP share the same <strong>30 requests per hour</strong> limit per token. Batch multi-channel schedules into one <Badge text="schedulePostTool" variant="default" /> call when possible.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and list → schedule → manage workflows" href="/docs/getting-started-for-mcp" />
<LinkCard title="Tools reference" description="Full input tables for every MCP tool" href="/docs/mcp-references/tools" />
<LinkCard title="Client setup" description="Connect Cursor, Claude Code, or Codex to OpenQuok MCP" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="CLI examples" description="The same workflows with the openquok CLI" href="/docs/cli-examples" />
</CardGrid>
