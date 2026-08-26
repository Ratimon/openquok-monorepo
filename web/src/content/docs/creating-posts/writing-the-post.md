---
title: Writing the post
description: Write captions in the OpenQuok social scheduler — toolbar, character count, mentions, AI tools, and per-network Post Preview.
order: 2
lastUpdated: 2026-08-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

The **left column** of the post editor is where you write the post. A plain-text caption box sits above the composes toolbars, indluding medias, signatures, styling, and AI helpers.

The **Post Preview** column on the right shows how each selected channel will render your caption and attachments before you save.

## The caption box

The main editor is a single **textarea**. Type or paste your caption; line breaks stay as you entered them.

Network-specific link rules are checked at save time and in **Settings**; see <a href="/docs/creating-posts/links-and-validation">Links and validation</a>.

<Callout type="warning">
<p>Closing the composer without saving discards your caption and attachments. Save a <strong>draft</strong> or <strong>schedule</strong> the post before you leave — see <a href="/docs/creating-posts/scheduling">Scheduling</a> and the <a href="/docs/creating-posts">Creating posts overview</a>.</p>
</Callout>

OpenQuok keeps <strong>up to 100 undo steps</strong> in the caption box. Use <strong>Ctrl+Z</strong> / <strong>Cmd+Z</strong> to undo and <strong>Ctrl+Shift+Z</strong> / <strong>Cmd+Shift+Z</strong> (or <strong>Ctrl+Y</strong> on Windows) to redo, or use the <strong>Undo</strong> and <strong>Redo</strong> buttons on the toolbar. Undo covers typing and toolbar changes — formatting, emoji, signatures, and AI insert or replace. History is <strong>per channel caption</strong>: switching channels swaps stacks; closing the composer clears everything. Save a <strong>draft</strong> if you need to come back later.

## Toolbar at a glance

The toolbar sits below the caption box. The same controls appear for every channel (except the LinkedIn company button, which only shows when a LinkedIn channel is focused).

| Group | Buttons | Notes |
| --- | --- | --- |
| **Media** | Device upload, Media library, Design editor | Full walkthrough in <a href="/docs/creating-posts/media">Media</a> |
| **Reusable text** | Signatures | Opens a modal to insert a saved sign-off |
| **AI** | AI Writer, Summarizer, Sound more human | Chrome on-device APIs — see below |
| **History** | Undo, Redo | Up to 100 steps; disabled when there is nothing to undo or redo |
| **Inline styling** | Underline, Italic, Bold, Emoji, Hashtag, <Badge text="@" variant="param" /> | Bold, italic, and underline use Unicode glyphs, not platform HTML |
| **LinkedIn only** | Company mention | Shown when a LinkedIn or LinkedIn Page channel is focused |

On the **public guest composer** (Humanizer and similar tools), device upload still works locally. **Media library**, **Design editor**, **Signatures**, and **LinkedIn company** show a lock badge — sign in or sign up to use workspace features.

## Text styling (bold, italic, underline)

Select text in the caption box, then click **Bold**, **Italic**, or **Underline** on the toolbar. OpenQuok replaces the selection with **Unicode styled characters** — they look bold or italic in the OpenQuok preview, but some networks may render them as normal letters.

This is not the same as native rich text on X, WordPress, or LinkedIn. If a network strips or ignores styled Unicode, shorten or rephrase the line instead of relying on formatting.

## Emoji and hashtags

Click **Emoji** to open the picker and insert at the cursor. You can also paste emoji from your system keyboard.

The **Hashtag** button inserts <code>#</code> at the cursor so you can type the tag name immediately. Hashtags are plain text — no autocomplete list.

## Character count

A <code>count/limit</code> badge under the caption box tracks how much you have written.

| Mode | What the counter shows |
| --- | --- |
| **Global** (globe highlighted, no channel focused) | Plain character count against a **500** default limit |
| **Focused channel** (per-channel edit or avatar selected in custom mode) | Count and limit for **that network** |
| **X focused** | **Weighted** count — links and mentions can cost more than one character; limit is **280** or **4000** on verified X accounts |

The text counter does **not** charge characters for attached images or video. Media limits are validated separately under the media strip.

<Callout type="tip">
<p>In Global mode the counter uses a 500-character default, not the smallest limit across your channels. If you post to X or another network, unlock it to see its real limit. Full per-network limits live in <a href="/docs/platforms">Posting rules by platform</a>.</p>
</Callout>

When one channel is over its limit, customize that channel’s caption — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Mentions

OpenQuok supports <Badge text="@" variant="param" /> mentions on **X**, **LinkedIn**, and **LinkedIn Page** only.

In **Global** mode the toolbar <Badge text="@" variant="param" /> button is disabled. Focus a channel, unlock it with **Edit content**, then type <Badge text="@" variant="param" /> followed by at least two characters to search accounts. Use the arrow keys and **Enter** or **Tab** to pick a row, or click the toolbar <Badge text="@" variant="param" /> button to insert <code>@</code> at the cursor.

<Callout type="note" title="Global mode">
<p>Mention autocomplete only runs on a <strong>customized</strong> X, LinkedIn, or LinkedIn Page channel. Step-by-step unlock flow: <a href="/docs/creating-posts/global-vs-per-channel#what-works-per-channel-only">Global vs per-channel</a>.</p>
</Callout>

When a **LinkedIn** channel is focused, the LinkedIn toolbar button opens the **company mention** modal so you can tag an organization page.

## Signatures

Click **Signatures** on the toolbar to open your workspace list and insert a saved sign-off at the end of the caption. If the box is empty, the signature is inserted as-is; otherwise OpenQuok adds a blank line before it.

When you open the composer with an **empty** caption, OpenQuok can **auto-add** the signature marked **Auto add** in Settings (only one default per workspace).

Create and edit signatures under **Settings → Signatures** — see <a href="/docs/settings/signatures">Signatures</a> (settings page may still be expanding).

## AI writing tools

Three toolbar actions use **Chrome on-device** AI APIs. They run locally in your browser; no caption text is sent to OpenQuok servers for these tools.

| Tool | What it does |
| --- | --- |
| **AI Writer** | Drafts new copy from your prompt and **appends** it to the caption (with a blank line when text already exists) |
| **Summarizer** | Shortens the current caption or your selection and **replaces** the composer body with the summary |
| **Sound more human** | Rewrites the caption or selection for a more natural tone and **replaces** the body |

Summarizer and Sound more human need existing text in the box. AI Writer opens a modal where you can refine the draft before inserting.

For agent, MCP, and API drafting outside the dashboard, see <a href="/docs/creating-posts/ai-generation">AI generation</a> and the <a href="/tools/humanizer">Humanizer</a> tool.

## Post Preview

The **right column** shows a live mock of each selected channel — caption styling, attachments, and network-specific chrome. In **custom** mode the preview follows the channel you are focused on. In **Global** mode it reflects the shared caption and media list.

Use Post Preview before scheduling, especially when Unicode styling or length might look different on a network. Attachment preview behavior is covered in <a href="/docs/creating-posts/media#preview-column">Media</a>.

## Thread reply boxes

Below the main caption, supported networks can add **follow-up reply** fields (Threads, X, and Instagram). Each reply is a smaller text-only box — **no toolbar**, no media strip. Set a delay between the main post and each reply.

See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> for when replies are available and how delays work.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="One caption or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Media" description="Attach images and video in the composer" href="/docs/creating-posts/media" />
<LinkCard title="Links and validation" description="Link previews and save-time errors" href="/docs/creating-posts/links-and-validation" />
<LinkCard title="Threads and comments" description="Multi-part posts and follow-up replies" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="AI generation" description="Draft posts with agents, MCP, and the API" href="/docs/creating-posts/ai-generation" />
<LinkCard title="Posting rules by platform" description="Per-network character and media limits" href="/docs/platforms" />
<LinkCard title="Signatures" description="Reusable sign-offs from Settings" href="/docs/settings/signatures" />
</CardGrid>
