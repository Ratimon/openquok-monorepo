---
title: Overview
description: How to write and schedule posts in OpenQuok — the post editor, channels, media, previews, and scheduling.
order: 0
lastUpdated: 2026-08-25
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

Most of your time in OpenQuok happens in the **post editor** — we also call it the **composer**.

![Post Editor](/docs/_assets/getting-started/3-compose-your-post.webp)

On Home and the calendar it opens as a modal. The same editor powers <Badge text="Payload Wizard" variant="default" /> at <a href="/account/payload-wizard">/account/payload-wizard</a> for developers who want to copy a JSON payload for the public API.

## Where to open it

| Action | Where |
| --- | --- |
| <Badge text="Create Post" variant="new" /> | <a href="/account">Home</a> |
| Click a day or empty slot | <a href="/account/calendar">Calendar</a> |
| <Badge text="Select a template" variant="default" /> | Home — restores a saved <a href="/docs/creating-posts/templates">template</a> |
| Open an existing post | <a href="/account">Home</a> kanban or <a href="/account/calendar">calendar</a> — see <a href="/docs/calendar-and-posts/moving-posts">Moving posts</a> |

You need at least one connected channel before the editor is useful. See <a href="/docs/channels/connect">Connect a channel</a>.

## How the editor is laid out

The editor is one window with three main areas and a footer bar.

| Area | What you do there |
| --- | --- |
| **Top** | Pick which channels receive this post. You can select a <a href="/docs/channels/channel-groups">channel group</a> to turn on every channel in that brand at once. |
| **Left** | <a href="/docs/creating-posts/writing-the-post">Write the caption</a>, use the toolbar, add <a href="/docs/creating-posts/media">media</a>, open per-network **Settings** (<a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>), and build <a href="/docs/creating-posts/threads-and-comments">threads or follow-up replies</a>. |
| **Right** | <a href="/docs/creating-posts/writing-the-post#post-preview">Post Preview</a> — a live look at how each selected channel will render the post. |
| **Footer** | <a href="/docs/creating-posts/tags">Tags</a>, repeat schedule, date and time, and save buttons — see <a href="/docs/creating-posts/scheduling">Scheduling</a> for <Badge text="Save as draft" variant="default" />, <Badge text="Add to calendar" variant="new" />, and <Badge text="Publish now" variant="new" />. |

The preview column is worth a glance. Line breaks, image crops, and titles that truncate on one network often show up there before you schedule.

<Callout type="tip">
<p>By default you write in <strong>Global</strong> mode: one caption shared across every channel you selected. Click a channel avatar to focus it, then <strong>Edit content</strong> when that network needs its own text or fields. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>
</Callout>

## Typical flow

<Steps
	howToName="How to schedule Posts"
	howToDescription="How to write and schedule posts in OpenQuok"
>

### Choose channels

Click the avatars at the top. Picking a <a href="/docs/channels/channel-groups">channel group</a> selects all of that group’s channels in one go.

### Write the post

**Global** mode (globe button) is the default. What you write there goes to every selected channel. See <a href="/docs/creating-posts/writing-the-post">Writing the post</a> for the caption box, toolbar, and character count, and <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a> when one network needs different text.

### Add media (optional)

Drag a file in, paste an image, or pick from your <a href="/account/media">media library</a>. See <a href="/docs/creating-posts/media">Media</a>.

### Fill network-specific fields

Some channels need extra details — a YouTube title, Dev.to tags, an Instagram post type. Open **Settings** beside the preview when a channel is focused. The editor blocks save until required fields are filled. See <a href="/docs/platforms">Posting rules by platform</a> and <a href="/docs/creating-posts/links-and-validation">Links and validation</a>.

### Pick a time and save

Choose a date and time in the footer, then save as a draft, add to the calendar, or publish immediately. See <a href="/docs/creating-posts/scheduling">Scheduling</a>.

</Steps>

## Starting from a template

If you saved <a href="/docs/creating-posts/templates">templates</a> at <a href="/account/templates">/account/templates</a>, OpenQuok can offer one when you start a new post. A template brings back a channel selection, caption, media, tags, and provider settings so you do not rebuild the same bundle every week.

You can always continue without a template and pick channels manually.

## Starting from a signature

<a href="/docs/settings/signatures">Signatures</a> are reusable sign-offs — a CTA, hashtag line, or link block. Append one from the editor toolbar, or mark a signature to auto-add when the composer opens.

## Threads, tags, and plugs

| Topic | Where in the editor |
| --- | --- |
| Multi-part posts and timed replies | <Badge text="Follow-up comments" variant="default" /> under the caption; <Badge text="Settings" variant="default" /> for finisher and plugs — see <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> |
| Campaign labels | Footer tags — see <a href="/docs/creating-posts/tags">Tags</a> |
| Follow-up after publish | <Badge text="Plug settings" variant="default" /> — see <a href="/docs/automations/plugs">Plugs</a> |

## AI and automation

You can draft from the editor with built-in writing tools, or queue posts from an agent, the CLI, or the public API. Everything lands in the same review queue on Home and the calendar. See <a href="/docs/creating-posts/ai-generation">AI generation</a>, <a href="/docs/getting-started-for-mcp">MCP</a>, and <a href="/docs/getting-started-for-public-api">Public API</a>.

Platforms are adding AI labels, scans, and community rules — but a draft can still read like a template even when no detector flags it.

Our free <a href="/tools/humanizer">Humanizer</a> rewrites social copy in the browser so it sounds more natural (no account required). The signed-in composer also includes **Humanize** in the editor toolbar. Read <a href="/blog/platforms-are-adding-ai-labels-detectors-and-bans-your-draft-can-still-sound-like-a-machine">why readable copy and platform disclosure are different problems</a>.

## Leaving without saving

Closing the composer asks you to confirm — unsaved work is discarded. If you need to step away, use <Badge text="Save as draft" variant="default" /> instead. Drafts stay on Home under **Drafted posts** and never publish until you schedule them. See <a href="/docs/creating-posts/scheduling">Scheduling</a>.

## Payload Wizard (developers)

<p><Badge text="Payload Wizard" variant="default" /> at <a href="/account/payload-wizard">/account/payload-wizard</a> shows the same editor on a full page. Compose as usual, then copy JSON for <Badge text="POST /api/v1/public/posts" variant="path" />. Settings → <Badge text="Developers" variant="default" /> → <strong>Access</strong> links here. See <a href="/docs/getting-started-for-public-api">Public API</a> for auth and request shape.</p>

## In this section

<CardGrid>
<LinkCard title="Global vs per-channel" description="One caption for every channel or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Writing the post" description="Captions, the toolbar, and per-network previews in detail" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Threads and comments" description="Multi-part posts and follow-up replies" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media" description="Attach images and video in the composer" href="/docs/creating-posts/media" />
<LinkCard title="AI generation" description="Draft posts with agents, MCP, and the public API" href="/docs/creating-posts/ai-generation" />
<LinkCard title="Scheduling" description="Pick a publish time and save as draft or scheduled" href="/docs/creating-posts/scheduling" />
<LinkCard title="Links and validation" description="Link previews, character limits, and save-time errors" href="/docs/creating-posts/links-and-validation" />
<LinkCard title="Tags" description="Colored labels on posts for campaigns and filters" href="/docs/creating-posts/tags" />
<LinkCard title="Templates" description="Saved composer presets for repeat workflows" href="/docs/creating-posts/templates" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Quickstart" description="First channel and first scheduled post in five steps" href="/docs/getting-started/quickstart" />
<LinkCard title="Tour the app" description="Sidebar, Home, calendar, and where the composer opens" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Glossary" description="Global mode, provider settings, and calendar vs kanban" href="/docs/getting-started/glossary" />
<LinkCard title="Channels" description="Connect, group, and maintain social accounts" href="/docs/channels" />
<LinkCard title="Posting rules by platform" description="Character limits, media rules, and per-network settings" href="/docs/platforms" />
<LinkCard title="Calendar and posts" description="Moving posts, actions, and client approvals" href="/docs/calendar-and-posts" />
</CardGrid>
