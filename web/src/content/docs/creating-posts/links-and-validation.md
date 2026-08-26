---
title: Links and validation
description: Link rules, character limits, and save-time checks in the OpenQuok post composer before you schedule or publish.
order: 7
lastUpdated: 2026-08-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok checks your post **before save** — character limits, required provider fields, and media rules. Most checks surface as a toast or a short message under the caption or media strip. This page covers **links**, **limits**, and **what blocks draft or schedule**.

For caption writing and the character counter, see <a href="/docs/creating-posts/writing-the-post">Writing the post</a>. For one caption vs per-network overrides, see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

## Character limits: Global vs focused

The <code>count/limit</code> badge under the caption box always counts **plain text** — HTML tags from a rich editor do not inflate the number. When **X** is in scope, the count is **weighted** (URLs and mentions can cost more than one character).

| Where you edit | Limit used |
| --- | --- |
| **Global** (globe highlighted) with channels selected | **Tightest** limit across your selection — for example **280** when X is selected alongside longer networks |
| **Global** with no channels selected yet | **500**-character default until you pick targets |
| **Focused channel** (per-channel edit or avatar selected in custom mode) | That network’s limit — X still uses weighted counting when focused |

The badge turns red when you are over the active limit. Saving a draft or scheduling while over limit is blocked with a toast (see **Save-time messages** below).

<Callout type="tip">
<p>When Global mode complains about length but only one network is tight, unlock that channel and shorten its caption — see <a href="/docs/creating-posts/global-vs-per-channel#when-to-stay-global-vs-customize">When to stay Global vs customize</a>. Per-network caps are listed in <a href="/docs/platforms">Posting rules by platform</a>.</p>
</Callout>

## Links in the caption

How links work depends on **editor mode** — see the mode table in <a href="/docs/creating-posts/writing-the-post#editor-modes">Writing the post → Editor modes</a>.

### Standard mode (Global and most unlocked channels)

In the plain **textarea**, links are just characters in your caption. Type or paste a full URL (for example <code>https://example.com/page</code>) on its own line or inline.

OpenQuok does **not** validate URL schemes, fetch link previews, or underline links while you type in Standard mode. That is intentional — you stay in control of the raw text, and networks apply their own link handling at publish time.

The toolbar **Link** button appears only in **Markdown** and **HTML** unlock modes, not in Standard.

### Markdown and HTML unlock (Dev.to, X)

When a channel unlocks a rich editor, use the toolbar **Link** button (or the keyboard shortcut) to wrap selected text. A prompt asks for the URL.

Accepted shapes:

| Input | Result |
| --- | --- |
| <code>https://…</code> or <code>http://…</code> | Stored as given |
| <code>example.com/path</code> (no scheme) | Normalized to <code>https://example.com/path</code> |
| Root-relative path such as <code>/docs/platforms</code> | Kept as a same-site path |

Rejected (toast: <strong>That link is not allowed. Use http(s) URLs or relative paths.</strong>):

- <code>ftp://</code>, <code>file://</code>, and <code>mailto:</code> schemes
- Bare email addresses such as <code>hi@example.com</code>

At **publish**, OpenQuok converts rich content per channel — Dev.to receives Markdown; **X still receives a plain-text tweet** (formatting and link markup are stripped). Check **Post Preview** before you schedule.

<Callout type="note" title="No live fetch in the composer">
<p>OpenQuok does not crawl URLs to build an in-editor link preview card. What you see in <strong>Post Preview</strong> is a layout mock — not a live unfurl from the destination site.</p>
</Callout>

## Link-related provider settings

Some networks attach or preview links through **Settings** beside Post Preview, not through the caption alone. Focus the channel (you can stay in Global mode), open **Settings**, and fill the fields for that integration.

| Network | Setting | When it applies |
| --- | --- | --- |
| **Facebook Page** | **Embedded URL** | Optional link preview on **text-only** posts — ignored when photos or video are attached |
| **Dev.to** | **Canonical URL** | Optional cross-post canonical; must be a valid <code>http</code> or <code>https</code> URL at save time |
| **X** | **Community URL** | Optional — post into an X community when the URL matches X’s community link format |

Other required fields (YouTube title, Dev.to tags, Instagram post type, TikTok privacy, and more) live in the same **Settings** panel. You often only need to focus the channel avatar — you do not have to unlock per-channel caption edit for settings alone. See <a href="/docs/creating-posts/global-vs-per-channel#go-back-to-global">Global vs per-channel → Go back to Global</a>.

## When validation runs

| Moment | What is checked |
| --- | --- |
| **While typing** | Character count vs limit (badge turns red). Rich-editor **Link** prompt rejects disallowed schemes immediately |
| **Before draft save** | Caption length, empty post (needs text or at least one attachment), provider rules that do not need async media probes |
| **Before schedule or publish** | Everything for drafts, plus channel reconnect state, media duration/size rules, and async checks (for example X video length) |

Media attachment limits are validated separately — see the message under the media strip in <a href="/docs/creating-posts/media">Media</a>.

## Save-time messages

When save is blocked, OpenQuok shows a **toast** (bottom of the screen). Provider and media issues that apply while you are still editing may also appear as red text **under the caption or media strip** before you click save.

### Caption and content

| Message | Cause |
| --- | --- |
| <code>Write something or attach at least one image.</code> | Empty caption and no media |
| <code>Please add at least {n} characters.</code> | Caption shorter than the focused provider minimum (rare today) |
| <code>Too long for this mode ({count}/{limit}).</code> | Character count over the active limit (weighted when X applies) |

### Workspace and channels

| Message | Cause |
| --- | --- |
| <code>Select a workspace.</code> | No workspace context for the session |
| <code>Select at least one channel above.</code> | Scheduling without targets |
| <code>Reconnect this channel first.</code> (and variants) | Channel needs refresh or is mid-connect |

### Provider and media (examples)

Messages are prefixed with the channel name when several networks are selected — for example <code>Instagram (@handle): Should have at least one media</code>.

| Area | Example message |
| --- | --- |
| **Instagram** | Media required; carousel, Story, Reel, and collaborator rules |
| **YouTube** | One MP4 video; title length |
| **X** | Image/video mix limits; community URL format; video duration cap |
| **TikTok** | One video or photo set; format and title limits |
| **LinkedIn** | Carousel image count; video attachment rules |
| **Facebook** | <code>Embedded URL must be a valid http(s) URL</code> |
| **Dev.to** | Title length; tag count; canonical URL format |

Schedule and publish use a **warning** toast for provider validation failures (draft save skips schedule-only checks). Fix the issue, adjust **Settings** or media, then try again.

<Callout type="warning" title="Standard textarea: no URL lint">
<p>Pasting <code>javascript:</code>, a mistyped domain, or a broken URL in <strong>Standard</strong> mode will not show an inline error. OpenQuok only enforces link shape when you use the rich-editor <strong>Link</strong> control or when a <strong>Settings</strong> field (Facebook embedded URL, Dev.to canonical, X community URL) is validated at save. If a network rejects a bad link, you will see the failure on publish or in the post status — shorten or fix the caption and reschedule.</p>
</Callout>

## Quick checklist before save

1. **Counter** — badge not red; customize any channel that needs a shorter caption.
2. **Settings** — open **Settings** for each selected channel that needs extra fields (title, tags, post type, embedded URL).
3. **Media** — no red message under the strip; per-channel attachments if one network needs different files.
4. **Preview** — scan Post Preview for truncation, especially on X and LinkedIn.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="Provider settings per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Writing the post" description="Editor modes, toolbar, and character count" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Media" description="Attachments and inline media validation" href="/docs/creating-posts/media" />
<LinkCard title="Scheduling" description="Draft, calendar, and publish now" href="/docs/creating-posts/scheduling" />
<LinkCard title="Posting rules by platform" description="Character limits and media rules" href="/docs/platforms" />
</CardGrid>
