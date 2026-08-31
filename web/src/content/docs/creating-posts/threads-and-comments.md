---
title: Threads and comments
description: Schedule follow-up replies on Threads, X, and Instagram in the OpenQuok social scheduler — delays, thread finisher, and Settings plugs.
order: 3
lastUpdated: 2026-08-31
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok treats **one main post** as the anchor: caption plus <a href="/docs/creating-posts/media">media</a> in the primary editor. You can add optional **follow-up comments** — text-only reply rows that publish after short delays. On **Threads** and **X**, they chain as same-account replies. On **Instagram**, they publish as comments on the root post.

This is not a stack of separate main posts. Each follow-up is a scheduled reply, not its own caption box with its own media strip.

![Threads Post Editor](/docs/_assets/creating-posts/editor-threads.webp)

## Where in the composer

| Area | What you do there |
| --- | --- |
| **Main caption + media** | Write the post that publishes first — see <a href="/docs/creating-posts/writing-the-post">Writing the post</a> and <a href="/docs/creating-posts/media">Media</a> |
| **Follow-up comments** | Text reply rows below the caption when at least one supported channel is selected |
| **Settings** (purple accordion beside Post Preview) | Thread finisher, delayed same-account engagement (Threads), and cross-account plugs |

The **Follow-up comments** panel appears only when your selection includes **Threads**, **X**, or an **Instagram** variant. Other networks keep the main post only.

## Add a follow-up

<Steps
	howToName="Add follow-up comments in the composer"
	howToDescription="Schedule text replies after the main post on Threads, X, or Instagram."
>

### Select a supported channel

Turn on **Threads**, **X**, or **Instagram** at the top of the composer. The **Follow-up comments** block appears under the caption area.

### Write the main post

Type the caption and attach media in the main editor. Follow-ups are text-only — put images and video on the main post.

### Add a reply row

Click the pink button under the caption. The label depends on the focused channel’s mode:

| Mode | Button label |
| --- | --- |
| Thread-style (<Badge text="POST" variant="param" />) | <Badge text="Add more thread" variant="new" /> |
| Comment-style (<Badge text="COMMENT" variant="param" />) | <Badge text="Add comment" variant="new" /> |
| Both (<Badge text="ALL" variant="param" />) | <Badge text="Add comment or post" variant="new" /> |

Type the reply text in the new row.

### Set a delay

Each row has a **Delay** control. Pick how long OpenQuok waits after the previous step before publishing that reply. Delays chain — the second reply waits after the first, and so on.

### Check Post Preview

The preview column shows how the main post renders. Follow-up text is not always previewed per row; confirm lengths and links on the main caption before save.

</Steps>

## Delays between parts

Each reply row offers six delay presets:

| Delay | Wait time |
| --- | --- |
| **No delay** | Publish immediately after the previous step |
| **5 seconds** | 5 seconds |
| **10 seconds** | 10 seconds |
| **30 seconds** | 30 seconds |
| **1 minute** | 60 seconds |
| **5 minutes** | 5 minutes |

OpenQuok shows an approximate clock (<code>≈</code>) from your scheduled main-post time, adding each prior reply’s delay in order. On **Threads**, the UI may add a small per-reply buffer for publish prep — that hint is for planning only; Meta can still take longer to show replies live.

<Callout type="note">
<p>Delays are short (seconds through five minutes). There is no hour-scale or custom-minute picker in the dashboard today.</p>
</Callout>

## What each platform does

| Network | Follow-ups in composer | How they publish | Media on follow-ups |
| --- | --- | --- | --- |
| **Threads** | Yes | Same-account replies in order | Text only |
| **X** | Yes | Quote-less replies on the root tweet | Text only in composer |
| **Instagram** | Yes | Comments on the root post | Text only |
| **LinkedIn** / **Facebook** | No composer UI | Cross-account plugs (LinkedIn) or API-only comment paths — not scheduled reply rows | — |
| **YouTube**, **TikTok**, **Dev.to**, … | No | — | — |

Per-network caps on the main post still apply. See <a href="/docs/platforms">Posting rules by platform</a>.

## Thread finisher

For **Threads** and **X**, open **Settings** while that channel is focused. Enable **Thread finisher** to post a closing message after all scheduled reply rows complete.

The default message is <code>That's a wrap!</code> — edit it in Settings. The finisher runs once at the end of the chain, not between every reply.

CLI and API users set the same fields under <Badge text="threads.enabled" variant="param" /> / <Badge text="threads.message" variant="param" /> or the X finisher bucket. Examples are in <a href="/docs/cli-examples/threads">CLI examples — Threads</a> and <a href="/docs/cli-examples/x">CLI examples — X</a>.

## Delayed engagement reply (Threads)

**Threads** Settings also include a **delayed engagement reply** — a same-account plug that fires after replies and the thread finisher. It uses a seconds-based delay in Settings and is separate from the **Follow-up comments** rows.

Use follow-up rows when you want a scripted thread. Use the engagement plug when you want one extra same-account comment after the chain finishes.

## Cross-account plugs

**Settings** can schedule **cross-account plugs** — comments from another connected channel after publish (supported on **Threads**, **X**, and **LinkedIn**). These are not the same as follow-up reply rows.

See <a href="/docs/automations/plugs">Plugs</a> for the concept. OpenQuok runs plugs after the main post (and after in-thread replies when configured).

## Multi-channel and Global mode

In **Global** mode, one follow-up program is copied to every selected **Threads**, **X**, and **Instagram** channel. The same reply text and delays apply to each supported bucket.

When only one network should differ, focus that channel and customize — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>. In per-channel mode, follow-ups edit only while a supported channel is focused.

<Callout type="tip">
<p>If you remove every supported channel after adding follow-ups, OpenQuok does not block save — the reply rows stay in the draft but will not publish until a supported channel is selected again.</p>
</Callout>

## Write for every network

A safe pattern when **Threads**, **X**, and **Instagram** are selected together:

<ul>
<li>Put all media on the <strong>main post</strong> only</li>
<li>Keep follow-ups as short text</li>
<li>Detach or customize a channel when tone or length must differ</li>
</ul>

## Agents, CLI, and API

Outside the dashboard, follow-ups live in <Badge text="providerSettingsByIntegrationId" variant="param" /> under each channel’s bucket:

| Bucket | Reply array |
| --- | --- |
| Threads | <Badge text="threads.replies" variant="param" /> |
| X | <Badge text="x.replies" variant="param" /> |
| Instagram | <Badge text="instagram.replies" variant="param" /> |

Each entry uses <Badge text="message" variant="param" /> and <Badge text="delaySeconds" variant="param" />. Copy-paste recipes:

<ul>
<li><a href="/docs/cli-examples/threads">CLI examples — Threads</a></li>
<li><a href="/docs/cli-examples/x">CLI examples — X</a></li>
<li><a href="/docs/cli-examples/instagram">CLI examples — Instagram</a></li>
</ul>

See <a href="/docs/cli-usages/managing-posts">Managing posts</a> and <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> for request shapes.

## Limits today

OpenQuok’s composer is narrower than some all-in-one schedulers. Know these boundaries before you plan a multi-part campaign:

| Topic | OpenQuok today | Common expectation elsewhere |
| --- | --- | --- |
| **Structure** | One main post + text follow-ups | Multiple parts, each with its own editor and media |
| **Composer follow-ups** | Threads, X, Instagram only | LinkedIn, Facebook, and other networks in the same UI |
| **LinkedIn / Facebook scheduled comments** | Backend comment APIs exist; no follow-up rows in the composer | Dashboard scheduling of text comments on feed posts |
| **TikTok / YouTube** | Launch config supports comment modes; no follow-up panel in the composer | Extra parts or comments in the composer |
| **Media on follow-ups** | Text only in the UI; X backend can attach media to comments but the composer does not expose it | Images on every thread part |
| **Reorder replies** | Remove a row only — no up/down reorder | Drag to reorder parts |
| **Delay range** | Seconds through 5 minutes | Minutes through hours, or custom delays |
| **Platform switch validation** | No save-time error if you drop all supported channels after adding follow-ups | Warning when the platform cannot use extra parts |
| **Sets / templates** | Shared follow-up rows sync to all supported channels in a set | — |

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="Customize copy per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Media" description="Attach images and video on the main post" href="/docs/creating-posts/media" />
<LinkCard title="Links and validation" description="Character limits and save-time errors" href="/docs/creating-posts/links-and-validation" />
<LinkCard title="Plugs" description="Follow-up after publish" href="/docs/automations/plugs" />
<LinkCard title="CLI examples — Threads" description="Reply chains and thread finisher" href="/docs/cli-examples/threads" />
<LinkCard title="CLI examples — X" description="Reply chains on X" href="/docs/cli-examples/x" />
<LinkCard title="Posting rules by platform" description="Per-network limits and settings" href="/docs/platforms" />
</CardGrid>
