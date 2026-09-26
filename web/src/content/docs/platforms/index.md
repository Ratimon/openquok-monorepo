---
title: Overview - Rules by Different Platforms
description: Diffetent Rules for the OpenQuok social scheduler — naming, connect flows, media and caption rules, and analytics by network.
order: 0
lastUpdated: 2026-09-22
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Posting rules by network

> What each connected channel accepts before OpenQuok sends a post.

Diferent platforms has diffetent rules on caption length, attachment count, and extra fields. OpenQuok ships **eleven** channels today.

<p class="not-prose flex flex-wrap items-center gap-3">
<a href="/channels/facebook" title="Facebook Page"><img src="/docs/_assets/platforms/socials/facebook.svg" alt="Facebook Page" width="32" height="32" /></a>
<a href="/channels/threads" title="Threads"><img src="/docs/_assets/platforms/socials/threads.svg" alt="Threads" width="32" height="32" /></a>
<a href="/channels/instagram" title="Instagram"><img src="/docs/_assets/platforms/socials/instagram.svg" alt="Instagram" width="32" height="32" /></a>
<a href="/channels/linkedin" title="LinkedIn"><img src="/docs/_assets/platforms/socials/linkedin.svg" alt="LinkedIn" width="32" height="32" /></a>
<a href="/channels/x" title="X"><img src="/docs/_assets/platforms/socials/x.svg" alt="X" width="32" height="32" /></a>
<a href="/channels/youtube" title="YouTube"><img src="/docs/_assets/platforms/socials/youtube.svg" alt="YouTube" width="32" height="32" /></a>
<a href="/channels/tiktok" title="TikTok"><img src="/docs/_assets/platforms/socials/tiktok.svg" alt="TikTok" width="32" height="32" /></a>
<a href="/channels/devto" title="Dev.to"><img src="/docs/_assets/platforms/socials/devto.svg" alt="Dev.to" width="32" height="32" /></a>
<a href="/channels/bluesky" title="Bluesky"><img src="/docs/_assets/platforms/socials/bluesky.svg" alt="Bluesky" width="32" height="32" /></a>
</p>

This section is the reference how they disagree when you write in the dashboard, schedule through the API, or use MCP tools.

<Callout type="tip">
<p>For step-by-step connect flows, see <a href="/docs/channels/connect">Connect a channel</a>. For operator developer apps on self-host, see <a href="/docs/social-integration">Social integrations</a>. For JSON field names on create post, see <a href="/docs/public-api-providers">Provider settings</a>.</p>
</Callout>

## Names in the app vs API

The dashboard and marketing site use short labels. The public API, CLI, MCP tools, and integration list use a fixed **channel key** for each connection.

| What you see | Channel key |
| --- | --- |
| **Instagram** | <Badge text="instagram-business" variant="param" /> or <Badge text="instagram-standalone" variant="param" /> |
| **Facebook** / **Facebook Page** | <Badge text="facebook" variant="param" /> |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> |
| **Dev.to** | <Badge text="devto" variant="param" /> |
| **Bluesky** | <Badge text="bluesky" variant="param" /> |

Most other networks use the same name in the app and in the API (for example <Badge text="threads" variant="param" />, <Badge text="tiktok" variant="param" />, <Badge text="x" variant="param" />). The full list with channel keys is in <a href="/docs/platforms/connect-rules">Connect rules</a>.

When you select two Instagram connections or two LinkedIn connections in one post, OpenQuok treats them as one **family** each. Shared caption and media must pass the **stricter** rules in that family. See <a href="/docs/platforms/media-rules">Media rules</a> and <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Extra parts after the main post

OpenQuok uses a few glossaries for multi-part posts. This table shows how OpenQuok defined it across different platform.

| Term in OpenQuok | What it means |
| --- | --- |
| <Badge text="Main post" variant="param" /> | The caption and media that publish first |
| <Badge text="Follow-up comments" variant="param" /> | Extra rows you add in the composer after the main post, each with its own delay |
| <Badge text="Thread reply" variant="param" /> | On **Threads** and **X**, a follow-up publishes as another post in the same thread |
| <Badge text="Comment" variant="param" /> | On **Instagram**, **LinkedIn**, and **Facebook**, a follow-up publishes as a comment on the main post |
| <Badge text="Thread finisher" variant="param" /> | On **X** (and thread-style channels), an optional closing reply after all follow-ups |
| <Badge text="Plugs" variant="param" /> | Automations after publish — not the same as follow-up comments. See <a href="/docs/automations/internal-plugs">Internal plugs</a> and <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> |

This table then shows whether you can add multi-part in the post editor, and which glossary term applies when OpenQuok publishes them.

| Network | Channel key | Follow-up comments | What OpenQuok calls the extra part |
| --- | --- | --- | --- |
| **Threads**, **X**, **Bluesky** | <Badge text="threads" variant="param" />, <Badge text="x" variant="param" />, <Badge text="bluesky" variant="param" /> | Yes | Thread reply (media allowed on follow-ups) |
| **Instagram** (both), **LinkedIn** (both) | <Badge text="instagram-business" variant="param" />, <Badge text="instagram-standalone" variant="param" />, <Badge text="linkedin" variant="param" />, <Badge text="linkedin-page" variant="param" /> | Yes | Comment (text only on follow-ups) |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | Yes | Comment (one image per follow-up, no video) |
| **YouTube**, **TikTok**, **Dev.to** | <Badge text="youtube" variant="param" />, <Badge text="tiktok" variant="param" />, <Badge text="devto" variant="param" /> | No | — |

Facebook **Stories** do not support follow-up comments. How to add rows and delays in the composer is in <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>. Attachment and length rules for follow-ups are in <a href="/docs/platforms/media-rules">Media rules</a>.

## How rules are enforced

OpenQuok checks posts in two places:

1. **Composer** — The post editor blocks invalid combinations before you schedule. The preview column and messages under the media strip show many issues early.
2. **Publish** — The backend runs the same rules when a scheduled post goes out. The API and MCP enforce length limits on **schedule**; **draft** may store longer text.

Upload limits (file size and format) are separate from per-network rules. See <a href="/docs/creating-posts/media#limits-and-formats">Media → Limits and formats</a>.

## In this section

<CardGrid>
<LinkCard title="Connect rules" description="How you connect each channel in Add Channel and channel keys" href="/docs/platforms/connect-rules" />
<LinkCard title="Media rules" description="Media, character caps, follow-up attachments, and caption editors" href="/docs/platforms/media-rules" />
<LinkCard title="Per-channel settings" description="Composer Settings fields per network" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Analytics" description="Account and per-post insights by network and channel key" href="/docs/platforms/analytics" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Creating posts" description="Composer flow, save options, and cross-links" href="/docs/creating-posts" />
<LinkCard title="Connect a channel" description="OAuth redirect and credentials flows" href="/docs/channels/connect" />
<LinkCard title="Provider settings" description="Public API identifier and payload reference" href="/docs/public-api-providers" />
<LinkCard title="CLI examples" description="Copy-paste openquok recipes by network" href="/docs/cli-examples" />
</CardGrid>
