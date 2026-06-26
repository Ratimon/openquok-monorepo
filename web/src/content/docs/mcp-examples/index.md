---
title: Overview - MCP Examples
description: OpenQuok MCP agent workflows — prompts and  payloads, organized by social platform.
order: 0
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Copy-pasteable recipes for AI agents using OpenQuok MCP. Each page shows what you can **ask your agent** in plain language and the <Badge text="schedulePostTool" variant="default" /> / <Badge text="triggerTool" variant="default" /> payloads the agent builds behind the scenes.

Workflow patterns follow a multi-step flow — list channels, read platform schema, then schedule — on OpenQuok's v1 tool surface.

<Callout type="note">
<p>OpenQuok ships first-party providers for <strong>Meta Threads</strong>, <strong>Facebook Page</strong>, <strong>Instagram</strong> (Business and Standalone), <strong>YouTube</strong>, <strong>TikTok</strong>, <strong>X</strong>, and <strong>LinkedIn</strong>. Additional pages appear here when new providers land in <Badge text="backend/integrations/providers/" variant="path" />.</p>
</Callout>

<CardGrid>
<LinkCard title="Facebook Page" description="Text, photos, link previews, and follow-up comments" href="/docs/mcp-examples/facebook" />
<LinkCard title="Instagram" description="Feed posts and reels with public image or video URLs" href="/docs/mcp-examples/instagram" />
<LinkCard title="Meta Threads" description="Scheduled posts, reply chains, and provider tools" href="/docs/mcp-examples/threads" />
<LinkCard title="YouTube" description="MP4 uploads with title, privacy, and tags" href="/docs/mcp-examples/youtube" />
<LinkCard title="TikTok" description="Videos and photo carousels with privacy settings" href="/docs/mcp-examples/tiktok" />
<LinkCard title="LinkedIn" description="Text posts, document carousels, and first-comment chains" href="/docs/mcp-examples/linkedin" />
<LinkCard title="X" description="Tweets, media, and multi-part threads" href="/docs/mcp-examples/x" />
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

## Conventions used in these pages

- Replace <Badge text="&lt;integration-id&gt;" variant="param" /> (and suffixed variants like <Badge text="&lt;threads-integration-id&gt;" variant="param" />) with UUIDs from <Badge text="integrationList" variant="default" />.
- Agent prompts use natural language — see <a href="/docs/getting-started-for-mcp">MCP introduction</a> for the canonical prompt shape (<Badge text="action" variant="param" /> to <Badge text="channel" variant="param" /> <Badge text="when" variant="param" />: <Badge text="body" variant="param" />).
- <Badge text="attachments" variant="param" /> must be public <Badge text="https://" variant="new" /> URLs. OpenQuok downloads each URL, uploads it to your workspace media storage, then attaches it to the post.

<Callout type="warning" title="Rate limits">
<p>Public API and MCP share the same <strong>30 requests per hour</strong> limit per token. Batch multi-channel schedules into one <Badge text="schedulePostTool" variant="default" /> call when possible.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and the four v1 tools" href="/docs/getting-started-for-mcp" />
<LinkCard title="Tools reference" description="Full input tables for schedulePostTool and triggerTool" href="/docs/mcp-references/tools" />
<LinkCard title="Client setup" description="Connect Cursor, Claude Code, or Codex to OpenQuok MCP" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="CLI examples" description="The same workflows with the openquok CLI" href="/docs/cli-examples" />
</CardGrid>
