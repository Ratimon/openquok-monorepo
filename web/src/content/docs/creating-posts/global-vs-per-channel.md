---
title: Global vs per-channel
description: Write one caption for every channel in OpenQuok, or unlock a network when it needs its own platform-specific settings.
order: 1
lastUpdated: 2026-08-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

When you schedule to more than one channel, you usually want the **same message everywhere**. OpenQuok starts you in **Global** mode for exactly that: one caption, one set of attachments, synced across every channel you picked.

![Global Mode](/docs/_assets/creating-posts/first-global-edit.webp)

Sometimes one network needs different words or attachments — a shorter line for X, a square image for Instagram, or a formal tone on LinkedIn. Focus that channel and unlock it. From then on, that channel has its own caption and media while the rest stay on the shared draft.

![Per Channel Mode](/docs/_assets/creating-posts/unlock-per-channel.webp)


## Where this lives in the editor

At the top of the composer, next to **Targets for this post**:

| Control | What it does |
| --- | --- |
| **Globe** button | Global mode — one caption and one attachment list for all selected channels |
| **Channel avatars** | In Global mode, click one to focus it and customize. In per-channel mode, click to switch which network you are editing |

The **Post Preview** column on the right always shows how each selected channel will look.

## The default: write once

Open the composer and you are already in Global mode. The globe is highlighted. Whatever you type in the main box and whatever you attach in the media strip go to **every** channel you selected.

Keep editing in Global so future caption and attachment changes stay in one place.

<Callout type="tip">
<p>Images and video you attach in Global mode go to every selected channel. Some networks accept fewer files or different formats; the preview and character counter warn you before save. See <a href="/docs/creating-posts/media">Media</a> and <a href="/docs/platforms">Posting rules by platform</a>.</p>
</Callout>

## Customize one channel

When one network needs its own caption or attachments:

<Steps howToName="Customize one channel in the composer">

### Select your channels

Turn on every channel that should receive this post — or pick a <a href="/docs/channels/channel-groups">channel group</a> to select a whole brand at once.

### Click the channel avatar

Click the avatar for the network you want to change. The editor shows **Editing a Specific Network** and the caption and media strip are locked.

### Click Edit content

<p>Click <strong>Edit content</strong> on the overlay. You can now edit that channel’s caption and attachments without changing the others. The media strip starts as a copy of the current Global list.</p>

![Unlock the editor to customize one channel](/docs/_assets/glossary/exit-global-mode.webp)

### Switch between customized channels

<p>While you stay in per-channel mode, click another avatar to edit that network’s version. Each customized channel keeps its own text and media until go back to Global.</p>

</Steps>

After you unlock, changes on that channel **no longer** follow the Global caption or attachment list. Editing Global later will **not** update a channel already customized.

## Go back to Global

<p>When you are focused on one network, use <strong>← Back to global</strong>. OpenQuok asks you to confirm — going back drops <strong>all</strong> per-channel caption and attachment and returns to the shared draft.</p>

<p>If you only needed different <strong>settings</strong> (a YouTube title, Dev.to tags, an Instagram post type) and not different words, you can often stay in Global and open <strong>Settings</strong> beside the preview instead. See <a href="/docs/creating-posts/links-and-validation">Links and validation</a> and <a href="/docs/platforms">Posting rules by platform</a>.</p>

## What works per-channel only

Some things only make sense on one network:

| Item | Why |
| --- | --- |
| **Different caption** | Unlock the channel and edit its text |
| **Different attachments** | Unlock the channel and edit the media strip — other channels keep the Global list until they are customized too |
| **Provider settings** | YouTube title, Dev.to series, Instagram post type, X reply audience — open **Settings** while that channel is focused |
| **Character limit** | The counter follows the focused channel (X uses a weighted count) |
| **LinkedIn company mentions** | Use the LinkedIn toolbar control while that channel is focused |
| **@ mentions** | On a customized **X**, **LinkedIn**, or **LinkedIn Page** channel, type <Badge text="@" variant="param" /> and pick from the suggestion list (or use the toolbar <Badge text="@" variant="param" /> button) |

<p>In Global mode, the toolbar <Badge text="@" variant="param" /> button is disabled — focus a channel, unlock it with <strong>Edit content</strong>, then type <Badge text="@" variant="param" /> followed by at least two characters to search X or LinkedIn accounts. Use the arrow keys and <strong>Enter</strong> or <strong>Tab</strong> to pick a row.</p>

## When to stay Global vs customize

<Tabs items={["Stay in Global", "Customize"]} variant="line">
<TabItem label="Stay in Global">

<ul>
<li>The same announcement and attachments should go everywhere</li>
<li>Only the <strong>settings</strong> differ (title, tags, post type) — not the caption or media</li>
<li>You expect to edit the copy or files again later and want one place to change them</li>
</ul>

</TabItem>
<TabItem label="Customize">

<ul>
<li>One network needs a shorter or longer version and the character counter complains</li>
<li>Hashtag or tone conventions differ between the channels you selected</li>
<li>One channel should mention someone, include a link another network strips, or use a different image or video</li>
</ul>

</TabItem>
</Tabs>

## Quick Tip: Use Templates !

<p>If you often use the same channels and make the same caption or media changes, save that as a <a href="/docs/creating-posts/templates">template</a>. Next time, open the template and your channels, captions, and attachments are already filled in.</p>

## Agents, CLI, and API

The same idea applies outside the dashboard:

| Layer | How it maps |
| --- | --- |
| **Dashboard** | Global mode → one <code>body</code> and one attachment list; customized channels → caption and media overrides per integration id |
| **Public API** | <code>body</code> and <code>media</code> plus optional <code>bodiesByIntegrationId</code> and <code>mediaByIntegrationId</code> keyed by channel UUID |
| **CLI** | <Badge text="--bodiesByIntegrationId" variant="param" /> and <Badge text="--mediaByIntegrationId" variant="param" /> for per-channel captions and attachments; <Badge text="--providerSettingsByIntegrationId" variant="param" /> for settings |

See <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> and <a href="/docs/cli-usages/managing-posts">Managing posts</a> for request shapes and examples.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Writing the post" description="Captions, toolbar, and per-network previews" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Media" description="Attach images and video in the composer" href="/docs/creating-posts/media" />
<LinkCard title="Links and validation" description="Character limits and save-time errors" href="/docs/creating-posts/links-and-validation" />
<LinkCard title="Threads and comments" description="Multi-part posts and follow-up replies" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Templates" description="Saved composer presets" href="/docs/creating-posts/templates" />
<LinkCard title="Posting rules by platform" description="Per-network fields and media rules" href="/docs/platforms" />
<LinkCard title="Glossary" description="Global mode and provider settings defined" href="/docs/getting-started/glossary" />
</CardGrid>
