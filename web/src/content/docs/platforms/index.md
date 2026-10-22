---
title: Overview - Rules by Different Platforms
description: Platform rules for OpenQuok — social posting (connect, media, settings, analytics) and directory launch (product profiles, site keys, extension autofill).
order: 0
lastUpdated: 2026-10-22
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok documents **two platform families** in this tab: **social posting** (schedule posts to networks) and **directory launch** (prepare listings on product directories). They share the word *channel* in marketing, but the connect model and rules differ.

## Social posting rules

> What each connected social channel accepts before OpenQuok sends a post.

Different social networks have different rules on caption length, attachment count, and extra fields. OpenQuok ships **ten** social posting channels today.

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
<a href="/channels/skool" title="Skool"><img src="/docs/_assets/platforms/socials/skool.svg" alt="Skool" width="32" height="32" /></a>
</p>

This section is the reference how they disagree when you write in the dashboard, schedule through the API, or use MCP tools.

<Callout type="tip">
<p>For step-by-step connect flows, see <a href="/docs/channels/connect">Connect a channel</a>. For operator developer apps on self-host, see <a href="/docs/social-integration">Social integrations</a>. For JSON field names on create post, see <a href="/docs/public-api-providers">Provider settings</a>.</p>
</Callout>

## Names in the app vs API

The dashboard and marketing site use short labels. Programmatic tools use fixed identifiers: a **channel key** for each **social** connection, and a **directory site key** for each **directory launch** destination on product profiles.

### Social posting (channel key)

| What you see | Channel key |
| --- | --- |
| **Instagram** | <Badge text="instagram-business" variant="param" /> or <Badge text="instagram-standalone" variant="param" /> |
| **Facebook** / **Facebook Page** | <Badge text="facebook" variant="param" /> |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> |
| **Dev.to** | <Badge text="devto" variant="param" /> |
| **Bluesky** | <Badge text="bluesky" variant="param" /> |
| **Skool** | <Badge text="skool" variant="param" /> |

Most other social networks use the same name in the app and in the API (for example <Badge text="threads" variant="param" />, <Badge text="tiktok" variant="param" />, <Badge text="x" variant="param" />). The full social table is in <a href="/docs/platforms/connect-rules">Connect rules</a>.

### Directory launch (directory site key)

Directory destinations are not social integrations. The API and MCP use <Badge text="directorySiteKey" variant="param" /> (same value as the public catalog slug) on main and variant product profiles — not <Badge text="integrationId" variant="param" /> or post scheduling fields.

| What you see | Directory site key |
| --- | --- |
| **PeerPush** | <Badge text="peerpush" variant="param" /> |
| **Uneed** | <Badge text="uneed" variant="param" /> |

New directory catalog rows follow the same pattern. Slugs and connect steps are in <a href="/docs/platforms/connect-rules#directory-launch-platforms">Connect rules → Directory launch platforms</a>.

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
| **Skool** | <Badge text="skool" variant="param" /> | Yes | Comment (when the group allows; see composer) |
| **YouTube**, **TikTok**, **Dev.to** | <Badge text="youtube" variant="param" />, <Badge text="tiktok" variant="param" />, <Badge text="devto" variant="param" /> | No | — |

Facebook **Stories** do not support follow-up comments. How to add rows and delays in the composer is in <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>. Attachment and length rules for follow-ups are in <a href="/docs/platforms/media-rules">Media rules</a>.

## How rules are enforced

OpenQuok checks posts in two places:

1. **Composer** — The post editor blocks invalid combinations before you schedule. The preview column and messages under the media strip show many issues early.
2. **Publish** — The backend runs the same rules when a scheduled post goes out. The API and MCP enforce length limits on **schedule**; **draft** may store longer text.

Upload limits (file size and format) are separate from per-network rules. See <a href="/docs/creating-posts/media#limits-and-formats">Media → Limits and formats</a>.

## Directory launch platforms

> Product profile fields and readiness — not composer caption length or <Badge text="POST /public/posts" variant="path" />.

**Directory launch** destinations help you list on product directories such as PeerPush and Uneed. You work on <a href="/account/products">My Products</a>.

OpenQuok stores your pitch, shows **listing readiness**, and the **browser extension** autofills the directory form. **You** review the page and click submit on the directory site.

<p class="not-prose flex flex-wrap items-center gap-3">
<a href="/channels/peerpush" title="PeerPush"><img src="/icons/link-directory/peerpush.svg" alt="PeerPush" width="32" height="32" /></a>
<a href="/channels/uneed" title="Uneed"><img src="/icons/link-directory/uneed.svg" alt="Uneed" width="32" height="32" /></a>
</p>

| Topic | Social posting | Directory launch |
| --- | --- | --- |
| **Where you work** | Composer, calendar, kanban | <a href="/account/products">My Products</a> |
| **How you connect** | OAuth, API key, or extension for **posting** | Business profile + <a href="/docs/installation/chrome-extension">browser extension</a> (no OAuth to the directory) |
| **API identifier** | <strong>Channel key</strong> (for example <Badge text="threads" variant="param" />) | <strong>Directory site key</strong> (for example <Badge text="peerpush" variant="param" />, <Badge text="uneed" variant="param" />) on product profiles |
| **What “rules” mean here** | Caption length, media count, provider settings | Required profile fields, variants per site, submission tracking |
| **Programmatic surface** | <Badge text="POST /public/posts" variant="path" />, MCP <Badge text="schedulePostTool" variant="default" /> | <Badge text="/public/directory-launch/*" variant="path" />, MCP <Badge text="directory*" variant="default" /> tools |

<Callout type="note">
<p>Directory destinations appear on the <a href="/channels#public-directory-channels-hub-heading">Channels hub</a> and may show as tiles in <strong>Add Channel</strong> when you wire a launch to a profile. They do not add a social integration UUID for scheduling.</p>
</Callout>

<p>Workflow: <a href="/docs/directory-submission">Directory submission</a>. Per-site field notes: <a href="/docs/directory-integration">Directory integration</a>. Connect and site keys: <a href="/docs/platforms/connect-rules#directory-launch-platforms">Connect rules → Directory launch platforms</a>. Terms: <a href="/docs/getting-started/glossary#directory-launch">Glossary → Directory launch</a>.</p>

## In this section

<CardGrid>
<LinkCard title="Connect rules" description="How you connect each channel in Add Channel and channel keys" href="/docs/platforms/connect-rules" />
<LinkCard title="Media rules" description="Media, character caps, follow-up attachments, and caption editors" href="/docs/platforms/media-rules" />
<LinkCard title="Per-channel settings" description="Composer Settings fields per network" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Analytics" description="Account and per-post insights by network and channel key" href="/docs/platforms/analytics" />
<LinkCard title="Directory submission" description="My Products workflow, extension handoff, and track submissions" href="/docs/directory-submission" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Creating posts" description="Composer flow, save options, and cross-links" href="/docs/creating-posts" />
<LinkCard title="Connect a channel" description="OAuth, credentials, and browser extension flows" href="/docs/channels/connect" />
<LinkCard title="Directory integration" description="How directory destinations differ from OAuth social channels" href="/docs/directory-integration" />
<LinkCard title="Channels overview" description="Social connect vs directory launch in one workspace" href="/docs/channels" />
<LinkCard title="Provider settings" description="Public API identifier and payload reference" href="/docs/public-api-providers" />
<LinkCard title="CLI examples" description="Copy-paste openquok recipes by network" href="/docs/cli-examples" />
</CardGrid>
