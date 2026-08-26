---
title: Media
description: Attach images and video in the OpenQuok composer — shared in Global mode or per channel when unlocked.
order: 4
lastUpdated: 2026-08-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

The composer attaches **images and video** below the caption. In **Global** mode, one attachment list is copied to every channel you selected. When a network needs its own files, unlock that channel the same way you customize a caption — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Global mode (default)

Open the composer and you are already in Global mode. Whatever you attach in the media strip is scheduled on **every** selected channel.

| Action | How |
| --- | --- |
| **Upload from device** | Toolbar image button with a <Badge text="+" variant="default" /> badge — pick files from your computer |
| **Media library** | Second image button — attach files already stored in your workspace library |
| **Design editor** | Canvas button — create or edit an image, then add it to the post |
| **Drag and drop** | Drop images or video onto the media strip (or the editor area above it) |

Files upload as soon as you add them. Reorder thumbnails in the strip; remove one with the delete control on its tile.

<Callout type="tip">
<p>Each network has its own limits on file count, size, and format. The <strong>Post Preview</strong> column and inline validation message under the media strip warn you before save. See <a href="/docs/platforms">Posting rules by platform</a>.</p>
</Callout>

## Per-channel attachments

Sometimes one channel needs a different image or video — a square crop for Instagram, a shorter clip for TikTok, or no media at all on one network while the rest keep a hero image.

The flow mirrors per-channel captions:

<Steps howToName="Attach different media on one channel">

### Focus the channel

Click that channel’s avatar at the top of the composer. The caption and media strip are locked behind the same overlay.

### Click Edit content

Unlock the channel. The media strip shows a **copy of the current Global list** — change it without affecting channels you have not customized yet.

### Edit attachments for that channel only

Add, remove, or reorder files in the media strip. Switch to another customized channel by clicking its avatar; each keeps its own list until you save.

### Save as usual

OpenQuok stores per-channel lists only for channels you edited while unlocked. Everyone else keeps the shared Global attachments.

</Steps>

<p>Channels you never unlock still receive the Global media list. Going back to Global with <strong>← Back to global</strong> drops <strong>all</strong> per-channel caption and attachment overrides — the confirm dialog is irreversible. See <a href="/docs/creating-posts/global-vs-per-channel#go-back-to-global">Go back to Global</a>.</p>

<Callout type="note" title="Templates and sets">
<p>When you define a reusable <a href="/docs/creating-posts/templates">template</a> or workspace set, authoring stays in Global mode — per-channel media overrides are not saved in the preset.</p>
</Callout>

## Preview column

The **Post Preview** on the right reflects the attachment list for the channel you are focused on in custom mode, or the shared Global list when every selected channel still uses it. If previews look wrong for one network, focus that channel and check its media strip (or unlock and adjust).

## Public API and CLI

Outside the dashboard, pass shared attachments in <Badge text="media" variant="param" /> and channel-specific lists in <Badge text="mediaByIntegrationId" variant="param" /> (keyed by integration UUID). Channels omitted from the map inherit the top-level <Badge text="media" variant="param" /> array.

Upload assets first with <Badge text="openquok upload" variant="default" /> or <Badge text="POST /public/uploads" variant="path" />, then reference the returned <code>id</code> and <code>path</code> values. Examples live in <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> and <a href="/docs/cli-usages/managing-posts">Managing posts</a>.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="One caption or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Writing the post" description="Captions and per-network previews" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Posting rules by platform" description="Image, video, and carousel limits" href="/docs/platforms" />
<LinkCard title="Uploads APIs" description="Attach media via the public API" href="/docs/apis-uploads" />
</CardGrid>
