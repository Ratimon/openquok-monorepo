---
title: Threads and comments
description: Follow-up replies after the main post, what each network does with them, and delays between parts in the OpenQuok social scheduler.
order: 3
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

A post can have more than one part: a **main post** (caption plus <a href="/docs/creating-posts/media">media</a>) and optional **follow-up replies**.

What the extra parts become depends on the network — a thread reply, a comment on your own post, or nothing at all.


![Threads Post Editor](/docs/_assets/creating-posts/editor-threads.webp)

## Where in the composer

| Area | What you do there |
| --- | --- |
| **Main caption + media** | Write the post that publishes first — see <a href="/docs/creating-posts/writing-the-post">Writing the post</a> and <a href="/docs/creating-posts/media">Media</a> |
| **Follow-up comments** | Replies below the caption when at least one supported channel is selected — text and, on some networks, media |
| **Settings** (purple accordion) | Thread finisher, delayed same-account engagement (Threads), and cross-account plugs |

The **Follow-up comments** panel appears when your selection includes **Threads**, **X**, **Instagram**, **LinkedIn**, or **Facebook**.

## Adding a reply

**Where:** In the post editor, open the **Follow-up comments** section. Use the pink **Add …** button at the top of that panel (not the main caption toolbar).

The button label follows the focused channel:

| Button | Meaning |
| --- | --- |
| **Add more thread** | The network publishes follow-ups as same-account thread replies (e.g. Threads, X). |
| **Add comment** | Follow-ups publish as comments on the main post (e.g. Instagram). |
| **Add comment or post** | The channel or platform supports both styles. |

Each reply row has its own text field, a **Delay** control, and row actions:

| Control | What it does |
| --- | --- |
| **Up / down** (chevrons) | Swap a reply with the one above or below — publish order follows the list |
| **Remove** | Delete that row |

<Callout type="note">
<p><strong>Media on follow-ups</strong> depends on the connected channel. <strong>Threads</strong>, <strong>X</strong>, and <strong>Facebook</strong> show the same attach toolbar as the main post (Facebook allows one image per reply, no video). <strong>Instagram</strong> and <strong>LinkedIn</strong> follow-ups are <strong>text only</strong>.</p>
</Callout>

## Delays between parts

Delays help in two ways. They spread follow-ups so a thread reads at a human pace instead of landing all at once.

They also let you put a link in a later reply rather than the main post. Many networks treat links in comments more leniently than links in the caption.

| Delay | Wait time |
| --- | --- |
| **No delay** | Publish immediately after the previous step |
| **5 seconds** | 5 seconds |
| **10 seconds** | 10 seconds |
| **30 seconds** | 30 seconds |
| **1 minute** | 60 seconds |
| **5 minutes** | 5 minutes |

OpenQuok shows an approximate clock (<code>≈</code>) from your post’s scheduled time, adding each prior reply’s delay in order.

On **Threads**, the UI may add a small buffer for publish. Meta can still take longer to show replies live.

<Callout type="note">
<p>Delays are short (seconds through five minutes). There is no hour-scale.</p>
</Callout>

## What each platform does

| Network | Follow-ups in composer | How they publish | Media on follow-ups |
| --- | --- | --- | --- |
| **Threads** | Yes | Same-account replies in order | Images and video (same toolbar as the main post) |
| **X** | Yes | Quote-less replies on the root tweet | Up to four images per reply |
| **Instagram** | Yes | Comments on the root post | Text only |
| **LinkedIn** | Yes | Comments on the main post | Text only |
| **Facebook** | Yes | Comments on the main post | One image per reply (no video) |
| **YouTube**, **TikTok**, **TikTok (Business)**, **Dev.to**, … | No | — | — |

Cross-account **plugs** on **LinkedIn** (from **Settings**) are separate from same-account follow-up comment rows — see <a href="/docs/automations/plugs">Plugs</a>.

Per-network caps on the main post still apply. See <a href="/docs/platforms">Posting rules by platform</a>.

## Thread finisher

For **Threads** and **X**, open **Settings** while that channel is focused. Enable **Thread finisher** to post a closing message after all scheduled replies.

The default message is <Badge text="That's a wrap!" variant="param" /> — edit it in Settings. The finisher runs once at the end of the reply chain, not between every reply.

On **Threads only**, Settings also offer a **delayed engagement reply** — one extra same-account comment after the finisher.

CLI and API users set finisher fields under <Badge text="threads.enabled" variant="param" /> / <Badge text="threads.message" variant="param" /> or the X finisher bucket; the engagement plug uses <Badge text="threads.internalEngagementPlug" variant="param" />. Examples are in <a href="/docs/cli-examples/threads">CLI examples — Threads</a> and <a href="/docs/cli-examples/x">CLI examples — X</a>.

## Cross-account plugs

**Settings** can schedule **cross-account plugs** — comments from another connected channel after publish (supported on **Threads**, **X**, and **LinkedIn**).

See <a href="/docs/automations/plugs">Plugs</a> for the concept. OpenQuok runs plugs after the main post (and after in-thread replies when configured).

## Multi-channel and Global mode

In **Global** mode, one follow-up program is copied to every selected **Threads**, **X**, **Instagram**, **LinkedIn**, and **Facebook** channel. The same reply text, delays, and media (where the network allows it) apply to each supported bucket.

When only one network should differ, focus that channel and customize — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>. In per-channel mode, follow-ups edit only while a supported channel is focused.

<Callout type="tip">
<p>If you remove every supported channel after adding follow-ups, OpenQuok does not block save — the replies stay in the draft but will not publish until a supported channel is selected again.</p>
</Callout>

## Write for every network

A safe pattern when several supported networks are selected together:

<ul>
<li>Put must-have media on the <strong>main post</strong> so <strong>Instagram</strong> and <strong>LinkedIn</strong> still publish correctly (their follow-ups are text only)</li>
<li>Use reply-level media only on <strong>Threads</strong>, <strong>X</strong>, or <strong>Facebook</strong> when that channel is focused and the extra attachment is intentional</li>
<li>Keep follow-ups short; detach or customize a channel when tone or length must differ</li>
</ul>

## Agents, CLI, and API

Outside the dashboard, follow-ups live in <Badge text="providerSettingsByIntegrationId" variant="param" /> under each channel’s bucket:

| Bucket | Reply array |
| --- | --- |
| Threads | <Badge text="threads.replies" variant="param" /> |
| X | <Badge text="x.replies" variant="param" /> |
| Instagram | <Badge text="instagram.replies" variant="param" /> |
| LinkedIn | <Badge text="linkedin.replies" variant="param" /> |
| Facebook | <Badge text="facebook.replies" variant="param" /> |

Each entry uses <Badge text="message" variant="param" /> and <Badge text="delaySeconds" variant="param" />. On networks that allow reply media, add <Badge text="media" variant="param" /> (flat array or <Badge text="media.items" variant="param" /> — same shapes as the main post). Copy-paste recipes:

<ul>
<li><a href="/docs/cli-examples/threads">CLI examples — Threads</a></li>
<li><a href="/docs/cli-examples/x">CLI examples — X</a></li>
<li><a href="/docs/cli-examples/instagram">CLI examples — Instagram</a></li>
</ul>

See <a href="/docs/cli-usages/managing-posts">Managing posts</a> and <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> for request shapes.


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
