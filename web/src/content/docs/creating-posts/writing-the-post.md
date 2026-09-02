---
title: Writing the post
description: Write captions in the OpenQuok social scheduler — editor modes, toolbar, character count, mentions, AI tools, and Post Preview.
order: 2
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

The **left column** of the post editor is where you write the post. A caption box sits above the toolbar — media, signatures, styling, AI helpers, and more.

![Post Editor](/docs/_assets/creating-posts/editor-post.webp)

## Post Preview

The **Post Preview** column on the right shows how each selected channel will render your caption and attachments before you save.

## The caption box

In **Global** mode the caption box is always **Standard**: a plain **textarea** where you type plain text and line breaks stay as you entered them.

![Post Editor in Global Mode](/docs/_assets/creating-posts/first-global-edit.webp)

When you **unlock** a channel that needs a different editor (eg. **Dev.to** uses **Markdown**; **X** uses **HTML**), the box switches to a rich editor with links, headings, and lists.

![Dev.to Post Editor](/docs/_assets/creating-posts/editor-devto.webp)

See **Editor by platform** below for which toolbar you get on each network.

Network-specific link rules are <a href="/docs/creating-posts/links-and-validation">here</a>.

<Callout type="warning">
<p>Toolbar <strong>Undo</strong> and <strong>Redo</strong> keep about 100 steps. Switching focus between customized channels remounts the caption box and clears that history — save before switching or leaving.</p>
</Callout>

## Editor by platform

Each channel has an **editor mode**. **Global** mode always uses **Standard**. Focus a channel and choose **Edit content** to unlock that network’s editor — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.


| Editor | Toolbar | Used by |
| --- | --- | --- |
| **Plain** <Badge text="none" variant="param"/> | Emoji, signatures, media, AI Writer, undo/redo | None yet — reserved for plain-text-only networks |
| **Standard** <Badge text="normal" variant="param"/> | Bold, Italic, Underline, Emoji, Hashtag, <Badge text="@" variant="param" /> mention, signatures, media, AI Writer, undo/redo | **Global** mode; LinkedIn, Instagram, Facebook, YouTube, TikTok, TikTok (Business), Threads, and most social channels |
| **Markdown** <Badge text="markdown" variant="param"/> | Standard tools **plus** links, Headings (H1–H3), Bullet and Numbered lists | **Dev.to** when unlocked |
| **HTML** <Badge text="html" variant="param"/> | Same rich controls as Markdown | **X** when unlocked — tweets still publish as **plain text** |

Media, Signatures, AI, and Undo/Redo stay available in every mode.

The LinkedIn **company** mention button appears only when a LinkedIn or LinkedIn Page channel is focused.

## Text styling (bold, italic, underline)

**Standard** (Global mode and most channels): select text, then click **Bold**, **Italic**, or **Underline**. OpenQuok replaces the selection with **Unicode characters** — they look bold or italic in the Post Preview, but some channels may read them as normal letters.

**Markdown** or **HTML** (for example Dev.to or X): the **real** bold, italic, and underline style are applied inside the editor.

## Emoji

Click **Emoji** to open the picker and insert at the cursor, or paste emoji from your keyboard.

## Hashtags

The **Hashtag** button inserts <code>#</code> at the cursor; it is hidden in **Plain** mode and there is no autocomplete list.

## Character count

A <code>count/limit</code> badge under the caption box tracks how much you have written.

| Mode | What the counter shows |
| --- | --- |
| **Global** | Plain character count against the **tightest limit** among your selected channels (for example **280** when X is selected). When **X** is among the selection, the count is **weighted** — links and mentions can cost more than one character |
| **Focused channel**  | Count and limit for **that network** |
| **X focused** | **Weighted** count — links and mentions can cost more than one character; limit is **280** or **4000** |

Per-network caps and save-time length errors are in <a href="/docs/platforms">Posting rules by platform</a> and <a href="/docs/creating-posts/links-and-validation">Links and validation</a>. When one channel is over its limit, customize that caption — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Mentions

Type <Badge text="@" variant="param" /> on an unlocked **X**, **LinkedIn**, or **LinkedIn Page** channel after at least two characters to search accounts.

The toolbar <Badge text="@" variant="param" /> button is disabled in **Global** mode — choose **Edit content** on the channel first. When a LinkedIn or LinkedIn Page channel is focused, the toolbar also opens the **company mention** modal for organization pages.

<Callout type="note">
<p>Mention suggestions only appear on a <strong>customized</strong> channel that supports mentions — not in Global mode.</p>
</Callout>

## Signatures

Click **Signatures** on the toolbar to insert a saved sign-off at the end of the caption. OpenQuok can also **auto-add** the signature marked **Auto add** when you open an empty composer — create and manage sign-offs in <a href="/docs/settings/signatures">Settings → Signatures</a>.

## Links

In **Standard** mode, type or paste URLs as plain text — OpenQuok does not validate schemes while you type. In **Markdown** and **HTML** unlock modes, use the toolbar **Link** button; only <code>http</code> and <code>https</code> URLs are accepted (a toast appears if you try another scheme). Save-time link rules and provider URL fields are in <a href="/docs/creating-posts/links-and-validation">Links and validation</a>.

## AI writing tools

Three toolbar tools use **Chrome on-device** AI — they run locally in your browser and do not send caption text to OpenQuok servers.

| Tool | What it does |
| --- | --- |
| **AI Writer** | Drafts new copy from your prompt and **appends** it to the caption |
| **Summarizer** | Shortens the current caption or your selection |
| **Sound more human** | Rewrites the caption or selection for a more natural tone |

AI Writer opens a modal where you can refine the draft before posting.

You can try our <a href="/tools/humanizer">Humanizer</a> tool without sign up. See more at <a href="/docs/creating-posts/ai-generation">AI generation</a>.

## Thread reply boxes

Supported networks (Threads, X, Instagram) can add delayed **follow-up reply** fields — see <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

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
