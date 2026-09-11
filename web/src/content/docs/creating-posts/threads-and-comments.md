---
title: Threads and comments
description: Thread replies and follow-up comments after the main post, per network, and delays between parts in the OpenQuok social scheduler.
order: 3
lastUpdated: 2026-09-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

A post can have more than one part: a **main post** (caption plus <a href="/docs/creating-posts/media">media</a>) and optional parts in <Badge text="Follow-up comments" variant="default" />. Those parts publish as **thread replies** on Threads and X, and as **comments** on Instagram, LinkedIn, and Facebook.

What the extra parts become depends on the network — a thread reply, a comment on your own post, or nothing at all.

<Badge text="Follow-up comments" variant="default" /> are not plugs. For a same-account delayed engagement reply on Threads, see <a href="/docs/automations/internal-plugs">Internal plugs</a>. For comments, reposts, or reshares from other connected channels, see <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.

![Threads Post Editor](/docs/_assets/creating-posts/editor-threads.webp)

## Where in the composer

| Area | What you do there |
| --- | --- |
| **Main caption + media** | Write the post that publishes first — see <a href="/docs/creating-posts/writing-the-post">Writing the post</a> and <a href="/docs/creating-posts/media">Media</a> |
| <Badge text="Follow-up comments" variant="default" /> | Thread replies or comments below the caption when at least one supported channel is selected — each row has its own text field, **reply toolbar**, optional media (network-dependent), and **Delay** |
| **Settings** (purple accordion) | Thread finisher, delayed same-account engagement (Threads), and cross-account plugs |

The <Badge text="Follow-up comments" variant="default" /> panel appears when your selection includes **Threads**, **X**, **Instagram**, **LinkedIn**, or **Facebook**.

## Adding a follow-up

**Where:** In the post editor, open the <Badge text="Follow-up comments" variant="default" /> section. Use the pink **Add …** button at the top of that panel (not the main caption toolbar).

The button label follows the focused channel:

| Button | Meaning |
| --- | --- |
| **Add more thread** | The network publishes follow-up comments as same-account thread replies (e.g. Threads, X). |
| **Add comment** | Follow-up comments publish as comments on the main post (e.g. Instagram). |
| **Add comment or post** | The channel or platform supports both styles. |

Each follow-up comment row has its own text field, a **reply toolbar** under the text area, a **Delay** control, and row actions:

| Control | What it does |
| --- | --- |
| **Reply toolbar** | Attach media (when the network allows), AI Writer / Summarize / Sound more human, emoji, hashtag, and mention — see below |
| **Up / down** (chevrons) | Swap a row with the one above or below — publish order follows the list |
| **Remove** | Delete that row |

### Reply toolbar

Each follow-up comment row includes a toolbar, but limited to actions that work on thread replies or comments:

| Tool | Follow-up comments |
| --- | --- |
| Attach from device, media library, Photo Editor | **Threads**, **X**, and **Facebook** only (Facebook: one image per comment, no video) |
| AI Writer, Summarize, Sound more human | All networks with Follow-up comments in the composer |
| Emoji, hashtag, mention | All networks with Follow-up comments in the composer |
| Signatures, bold / italic / underline, links, headings, lists | Not shown — thread replies and comments publish as plain text (plus optional media where allowed) |

You can still drag and drop images or videos onto a follow-up comment row when that network supports media. **Instagram** and **LinkedIn** follow-up comments stay **text only** — the attach buttons are hidden on those rows.

<Callout type="note">
<p><strong>Media on Follow-up comments</strong> depends on the connected channel. <strong>Threads</strong> and <strong>X</strong> support images and video on thread replies. <strong>Facebook</strong> allows <strong>one image</strong> per comment (no video). <strong>Instagram</strong> and <strong>LinkedIn</strong> follow-up comments are <strong>text only</strong>.</p>
</Callout>

## Delays between parts

Delays help in two ways. They spread Follow-up comments so a thread reads at a human pace instead of landing all at once.

They also let you put a link in a later thread reply or comment rather than the main post. Many networks treat links in comments more leniently than links in the caption.

| Delay | Wait time |
| --- | --- |
| **No delay** | Publish immediately after the previous step |
| **5 seconds** | 5 seconds |
| **10 seconds** | 10 seconds |
| **30 seconds** | 30 seconds |
| **1 minute** | 60 seconds |
| **5 minutes** | 5 minutes |

OpenQuok shows an approximate clock (<code>≈</code>) from your post’s scheduled time, adding each prior follow-up comment row’s delay in order.

On **Threads**, the UI may add a small buffer for publish. Meta can still take longer to show thread replies live.

<Callout type="note">
<p>Delays are short (seconds through five minutes). There is no hour-scale.</p>
</Callout>

## What each platform does

| Network | Comments / replies | How they publish | Media on Follow-up comments | Cross-account plugs |
| --- | --- | --- | --- | --- |
| **Threads** | Yes | Same-account thread replies in order | Images and video | Comment from other Threads channels |
| **X** | Yes | Quote-less thread replies on the main tweet | Up to four images per thread reply | Repost from other X channels |
| **Instagram** | Yes | Comments on the main post | Text only | No |
| **LinkedIn** | Yes | Comments on the main post | Text only | Comment or reshare from other LinkedIn channels |
| **Facebook** | Yes | Comments on the main post | One image per follow-up comment row via reply toolbar (no video) | No |
| **YouTube**, **TikTok**, **Dev.to**, … | No | — | — | No |

Cross-account **plugs** (from **Plug settings**) are separate from same-account Follow-up comments. **Threads**, **X**, and **LinkedIn** support them — see <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> and <a href="#cross-account-plugs">below</a>.

Per-network caps on the main post still apply. See <a href="/docs/platforms">Posting rules by platform</a>.

## Thread finisher

For **Threads** and **X**, open **Settings** while that channel is focused. Enable **Thread finisher** to post a closing message after all Follow-up comments.

The default message is <Badge text="That's a wrap!" variant="param" /> You can edit it. The finisher runs at the end of the thread, not between every follow-up comment row.

On **Threads only**, Settings also offer a **delayed engagement reply** — one extra same-account comment after the finisher. That is an <a href="/docs/automations/internal-plugs">internal plug</a>, not a Follow-up comments row.

CLI and API users set finisher fields under <Badge text="threads.enabled" variant="param" /> / <Badge text="threads.message" variant="param" /> or the X finisher bucket; the engagement plug uses <Badge text="threads.internalEngagementPlug" variant="param" />. Examples are in <a href="/docs/cli-examples/threads">CLI examples — Threads</a> and <a href="/docs/cli-examples/x">CLI examples — X</a>.

## Cross-account plugs

**Settings** can schedule **cross-account plugs** — comments from another connected channel after publish (supported on **Threads**, **X**, and **LinkedIn**).

![How to setup cross-account plug](/docs/_assets/creating-posts/plug-settings.webp)

See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> for setup steps. OpenQuok runs plugs after the main post (and after Follow-up comments when configured).

## Multi-channel and Global mode

In **Global** mode, one Follow-up comments program is copied to every selected **Threads**, **X**, **Instagram**, **LinkedIn**, and **Facebook** channel. The same text, delays, and media (where the network allows it) apply to each supported network.

When only one network should differ, focus that channel and customize — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>. In per-channel mode, Follow-up comments edit only while a supported channel is focused.

<Callout type="tip">
<p>If you remove every supported channel after adding Follow-up comments, OpenQuok does not block save — the rows stay in the draft but will not publish until a supported channel is selected again.</p>
</Callout>

## Write for every network

A safe pattern when several supported networks are selected together:

<ul>
<li>Put must-have media on the <strong>main post</strong> so <strong>Instagram</strong> and <strong>LinkedIn</strong> still publish correctly (their Follow-up comments are text only)</li>
<li>Use media on follow-up comment rows only on <strong>Threads</strong>, <strong>X</strong>, or <strong>Facebook</strong> when that channel is focused and the extra attachment is intentional</li>
</ul>

## Agents, CLI, and API

Outside the dashboard, Follow-up comments live in <Badge text="providerSettingsByIntegrationId" variant="param" /> under each channel’s bucket (<Badge text="replies[]" variant="param" /> — Follow-up comments in the composer):

| Bucket | Reply array |
| --- | --- |
| Threads | <Badge text="threads.replies" variant="param" /> |
| X | <Badge text="x.replies" variant="param" /> |
| Instagram | <Badge text="instagram.replies" variant="param" /> |
| LinkedIn | <Badge text="linkedin.replies" variant="param" /> |
| Facebook | <Badge text="facebook.replies" variant="param" /> |

Each entry uses <Badge text="message" variant="param" /> and <Badge text="delaySeconds" variant="param" />. On networks that allow media on Follow-up comments, add <Badge text="media" variant="param" /> (flat array or <Badge text="media.items" variant="param" /> — same shapes as the main post). Upload files for Follow-up comments with <Badge text="openquok upload" variant="default" /> before <Badge text="posts:create" variant="default" />; main-post <Badge text="-m" variant="param" /> does not attach to follow-up comment rows automatically.

Copy-paste recipes:

<ul>
<li><a href="/docs/cli-examples/threads">CLI examples — Threads</a> — text and media on <Badge text="threads.replies[]" variant="param" /></li>
<li><a href="/docs/cli-examples/x">CLI examples — X</a> — up to four images per <Badge text="x.replies[]" variant="param" /> row</li>
<li><a href="/docs/cli-examples/facebook">CLI examples — Facebook</a> — one image per <Badge text="facebook.replies[]" variant="param" /> row</li>
<li><a href="/docs/cli-examples/instagram">CLI examples — Instagram</a> — text-only <Badge text="instagram.replies[]" variant="param" /></li>
<li><a href="/docs/cli-examples/linkedin">CLI examples — LinkedIn</a> — text-only <Badge text="linkedin.replies[]" variant="param" /></li>
</ul>

Agent JSON examples (replace placeholders, then <Badge text="openquok posts:create --json …" variant="default" />): <Badge text="threads-follow-up-reply-with-image.json" variant="path" />, <Badge text="x-follow-up-reply-with-image.json" variant="path" />, and <Badge text="facebook-follow-up-comment-with-image.json" variant="path" /> in <Badge text="agent/skills/openquok-core/resources/examples/" variant="path" />.

See <a href="/docs/cli-usages/managing-posts">Managing posts</a> and <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a> for request shapes.


## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="Customize copy per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Media" description="Attach images and video on the main post" href="/docs/creating-posts/media" />
<LinkCard title="Links and validation" description="Character limits and save-time errors" href="/docs/creating-posts/links-and-validation" />
<LinkCard title="Internal plugs" description="Same-account delayed engagement on one post" href="/docs/automations/internal-plugs" />
<LinkCard title="Cross-account plugs" description="Other connected channels comment, repost, or reshare" href="/docs/automations/cross-account-plugs" />
<LinkCard title="CLI examples — Threads" description="Reply chains and thread finisher" href="/docs/cli-examples/threads" />
<LinkCard title="CLI examples — X" description="Reply chains on X" href="/docs/cli-examples/x" />
<LinkCard title="Posting rules by platform" description="Per-network limits and settings" href="/docs/platforms" />
</CardGrid>
