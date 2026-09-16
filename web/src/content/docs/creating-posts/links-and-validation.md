---
title: Links and validation
description: Links in the OpenQuok post composer, save-time checks, and how to fix validation errors before you schedule or publish.
order: 8
lastUpdated: 2026-09-14
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Links and validation

> Links in the caption, link fields in Settings, and what blocks save before you schedule.

OpenQuok checks your post before you save. This page covers **links in the caption**, **link fields in Settings**, and **what blocks a draft or schedule**.

For the character counter and editor modes, see <a href="/docs/creating-posts/writing-the-post">Writing the post</a>. For one caption vs per-network text, see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Links in the caption

How you add a link depends on the editor mode. See <a href="/docs/creating-posts/writing-the-post#editor-by-platform">Editor by platform</a>.

### Standard mode

In the plain textarea, type or paste a full URL (for example <code>https://example.com/page</code>). The URL is part of the caption text. OpenQuok does not check the URL shape or fetch a preview card.

The toolbar **Link** button appears only in **Markdown** and **HTML** unlock modes.

### Markdown and HTML unlock

When a channel unlocks a rich editor (**Dev.to**, **X**), use the toolbar **Link** button to wrap selected text.

| Input | Result |
| --- | --- |
| <code>https://…</code> or <code>http://…</code> | Stored as given |
| <code>example.com/path</code> | Normalized to <code>https://example.com/path</code> |
| Root-relative path such as <code>/docs/platforms</code> | Kept as a same-site path |

OpenQuok rejects <code>ftp://</code>, <code>file://</code>, <code>mailto:</code>, and bare email addresses. You see a toast: <strong>That link is not allowed. Use http(s) URLs or relative paths.</strong>

At publish, **Dev.to** receives Markdown. **X** still receives plain text — formatting and link markup are stripped. Check **Post Preview** before you schedule.

<Callout type="note">
<p>No live link preview, as OpenQuok does not crawl URLs in the composer. <strong>Post Preview</strong> is a layout mock, not a live unfurl from the destination site.</p>
</Callout>

## Link fields in Settings

Some networks need a URL in **Settings** beside Post Preview, not only in the caption.

| Network | Setting | When it applies |
| --- | --- | --- |
| **Facebook Page** | **Embedded URL** | Optional link preview on text-only posts — ignored when photos or video are attached |
| **Dev.to** | **Canonical URL** | Optional cross-post canonical; must be a valid <code>http</code> or <code>https</code> URL at save time |
| **X** | **Community URL** | Optional — post into an X community when the URL matches X’s community link format |

You can open **Settings** for a channel without unlocking its caption. Other required fields (YouTube title, Dev.to tags, Instagram post type, and more) live in the same panel.

## Validation

OpenQuok validates a post against every selected channel before save. If any channel fails, nothing is saved. You see a toast, or red text under the caption or media strip.

The same checks run on the server when you submit. You cannot bypass them by editing the request.

### What usually fails

| Error | Cause |
| --- | --- |
| Empty content | A selected channel has no text and the platform requires some |
| Too long | Over the character limit for that platform — the counter badge turns red |
| Missing setting | A required per-platform field is empty: YouTube title, Dev.to tags, Instagram post type, and similar |
| Media rules | Wrong number or type of attachments for the platform |
| Channel state | No workspace, no channel selected, or a channel needs reconnect |

Media limits are checked separately. See <a href="/docs/creating-posts/media">Media</a>.

### Fixing them

For length, unlock the tight channel and write a shorter caption. Do not cut the text for every network. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

For media, check the platform rules first. See <a href="/docs/platforms">Posting rules by platform</a>.

For required settings, focus the channel and fill the **Settings** panel. The platform refuses the post without those fields.

<Callout type="warning" title="Standard textarea: no URL lint">
<p>In <strong>Standard</strong> mode, a bad or broken URL does not show an inline error. OpenQuok checks link shape only when you use the rich-editor <strong>Link</strong> button or a <strong>Settings</strong> URL field at save. If a network rejects the link, you see the failure on publish or in post status.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Writing the post" description="Editor modes, toolbar, and character count" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Global vs per-channel" description="One caption or per-network overrides" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Threads and comments" description="Put a link in a follow-up comment" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media" description="Attachments and inline media validation" href="/docs/creating-posts/media" />
<LinkCard title="Posting rules by platform" description="Character limits and media rules" href="/docs/platforms" />
</CardGrid>
