---
title: Reddit
description: Add Reddit as a manual channel in OpenQuok, draft in the workspace, and complete posts on reddit.com yourself.
order: 12
lastUpdated: 2026-10-28
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="note">
<p>Self-host installs do <strong>not</strong> register a Reddit OAuth app for workspace posting. You add Reddit as a <strong>manual channel</strong> from the dashboard. OpenQuok never stores your Reddit login or session cookies on the server.</p>
</Callout>

OpenQuok drafts and schedules Reddit posts in your workspace. When a post is due, OpenQuok marks it <strong>awaiting member</strong> and notifies you. You finish the post on <DocsExternalLink href="https://www.reddit.com/">reddit.com</DocsExternalLink> yourself — copy from the dashboard or extension, open the submit page, and optionally use the OpenQuok extension to autofill title and body. <strong>You</strong> review and click Post. OpenQuok does not publish to Reddit from the backend.

<Callout type="warning">
<p>Autofill on reddit.com may break if Reddit changes its submit UI. OpenQuok does not guarantee autofill. Autofill does <strong>not</strong> click Submit for you.</p>
</Callout>

## Prerequisites

1. A workspace where you can use <Badge text="Add Channel" variant="new" />.
2. Optional but recommended for due-time handoff: the <strong>OpenQuok browser extension</strong> — see <a href="/docs/installation/chrome-extension">Browser extension</a> (same dashboard session as the side panel; no Reddit cookie connect).
3. When you post, sign in to Reddit in the browser profile you use for reddit.com.

## Connect Reddit

<Steps
	howToName="Add Reddit to OpenQuok"
	howToDescription="Create a manual Reddit channel from the dashboard without Reddit OAuth or extension cookie connect."
>

### Add the channel

In your workspace, open <Badge text="Add Channel" variant="new" /> → <strong>Reddit</strong>. Confirm the manual-channel notice. You can optionally set a <strong>channel label</strong> so the integration row is easy to spot in the composer. Labels must be <strong>unique among Reddit channels</strong> in this workspace (not across Facebook, X, and other platforms). If you leave the label blank, OpenQuok uses <Badge text="Reddit" variant="param" /> and only one unnamed Reddit channel is allowed.

OpenQuok saves the channel with an empty server token — there is no Reddit API login step.

### Optional: install the extension

If you want <strong>Copy</strong>, <strong>Open submit</strong>, and <strong>Autofill</strong> when posts are due, install the extension and sign in to OpenQuok from the side panel. The extension does <strong>not</strong> read Reddit cookies for OpenQuok API calls and does <strong>not</strong> refresh a Reddit session on the server.

</Steps>

## Draft and publish flows

| Mode | Composer | When due | You on reddit.com |
| --- | --- | --- | --- |
| <strong>Global</strong> (shared caption) | Reddit selected; <strong>Settings</strong> can stay empty (no subreddit required to save) | Row moves to <strong>awaiting member</strong> | Copy caption (and optional title if set in Settings); paste into any subreddit you choose |
| **Per-channel Settings** | Focus Reddit → <strong>Settings</strong>: community or profile (<Badge text="r/name" variant="param" /> or <Badge text="u/name" variant="param" />), title; body and links in the composer caption | Same | <strong>Open submit</strong> to the matching text submit page; extension <strong>Autofill</strong> fills title and body — you click <strong>Post</strong>, then <strong>Mark posted</strong> |

Composer field reference: <a href="/docs/platforms/per-channel-settings">Per-channel settings</a>. Global vs Settings-only differences: <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Features

### Supported

| Feature | Details |
| --- | --- |
| Manual channel connect | <strong>Add Channel</strong> → Reddit in the dashboard — no OAuth, no Reddit cookies on the server |
| Draft and schedule | Composer and API create rows like other channels; at due time Reddit rows await member action |
| Markdown body | Caption uses the markdown editor (up to <strong>10,000</strong> characters) |
| Global copy-only posts | Empty subreddit and title in Settings — schedule shared caption only; complete manually on reddit.com |
| Community, title | Optional in <strong>Settings</strong> when you want strict validation and submit URLs — stored as <Badge text="r/name" variant="param" /> or <Badge text="u/name" variant="param" /> (bare names default to <Badge text="r/" variant="param" />). Keys <Badge text="subreddit" variant="param" /> / <Badge text="reddit.subreddit" variant="param" />, <Badge text="title" variant="param" /> / <Badge text="reddit.title" variant="param" />. Post body and hyperlinks use the composer caption (toolbar link button or markdown). |
| Member browser handoff | Extension can copy, open submit, and autofill on the Reddit submit page; you submit manually |
| Mark complete | After you post, mark the row complete so OpenQuok sets status to published (optional post URL) |

### Not supported

| Feature | Notes |
| --- | --- |
| Server publish | OpenQuok never calls Reddit’s API to post from the backend |
| OAuth connect (workspace) | No operator Reddit app or backend OAuth keys for this channel in v1 |
| Browser extension cookie connect | Reddit is not a cookie-session channel like Skool — extension assists publish only |
| Public OAuth URL | <Badge text="GET /api/v1/public/social/reddit" variant="path" /> returns <strong>400</strong>; connect in the dashboard |
| Invite links | OAuth redirect networks only — members add Reddit from the dashboard themselves |
| Follow-up comments | No threaded comment publish on Reddit |
| Account or post analytics | No Reddit metrics in OpenQuok |
| Channel plugs | Auto-repost and cross-account plugs are not available on <Badge text="reddit" variant="param" /> |
| DMs, replies, mod mail | v1 covers subreddit post submit assist only |
| Automatic session refresh | No <Badge text="POST /api/v1/integrations/extension-refresh" variant="path" /> for Reddit |

## Deferred and out of scope

| Area | Notes |
| --- | --- |
| Reddit OAuth / Data API posting | Future work — not shipped for manual complete v1 |
| Flair picker | Best-effort later; not required for v1 |
| Auto-detect post URL | Optional navigation watch to pre-fill completion |
| Rich media autofill | Text posts first; image upload follows Reddit’s live submit UI |

<Callout type="note">
<p>Multi-channel groups still schedule Reddit with OAuth channels: API networks publish on time while Reddit rows move to <strong>awaiting member</strong> until you submit on reddit.com and mark complete.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Browser extension" description="Side panel Social tab — copy, open submit, autofill when due" href="/docs/installation/chrome-extension" />
<LinkCard title="Connect a channel" description="OAuth, credentials, manual channel, and extension-assisted publish" href="/docs/channels/connect" />
<LinkCard title="Connect rules" description="Reddit channel key and manual channel connect type" href="/docs/platforms/connect-rules" />
<LinkCard title="Per-channel settings" description="Subreddit, title, and post type in composer Settings" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Global vs per-channel" description="Shared caption vs Reddit Settings for subreddit and title" href="/docs/creating-posts/global-vs-per-channel" />
</CardGrid>
