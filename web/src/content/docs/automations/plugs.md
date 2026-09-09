---
title: Plugs
description: Automate engagement after publish with OpenQuok plugs — per-post cross-account actions and channel rules when likes cross a threshold.
order: 1
lastUpdated: 2026-09-09
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

A **plug** is an automation that runs **after** your post goes live on a social network. Plugs do not change the main caption you scheduled. They add a reply, comment, repost, or reshare when you choose.

OpenQuok has two kinds:

| Kind | Where you set it | When it runs |
| --- | --- | --- |
| **Internal plug** | Composer <Badge text="Plug settings" variant="default" /> or the purple <Badge text="Settings" variant="default" /> accordion (per-channel mode) | Once per scheduled post, after publish and after same-account <a href="/docs/creating-posts/threads-and-comments">follow-up replies</a> |
| **Global plug** | <a href="/account/plugs">Account → Auto Plugs</a> (<Badge text="/account/plugs" variant="path" />) | On future publishes when **likes** on the live post reach your threshold; the worker checks every **6 hours**, up to **3 times** |

Internal plugs are **not** the same as follow-up comment rows in the **Follow-up comments** panel. Follow-ups publish from the **same** channel. Internal **cross-account** plugs use **other** connected channels in your workspace.

![Click Plug Setting](/docs/_assets/glossary/internal-plug-setting.webp)

## What each network supports

| Network | Same-account follow-ups in composer | Cross-account internal plugs | Global plugs (likes threshold) |
| --- | --- | --- | --- |
| **Threads** | Yes — thread replies, finisher, delayed engagement reply | Comment from other Threads channels | Auto plug post (reply when likes ≥ threshold) |
| **X** | Yes — quote-less replies on the root tweet | **Repost** from other X channels (not reply comments from another account) | Auto repost; auto plug post (reply when likes ≥ threshold) |
| **LinkedIn** | Yes — text-only comments on the main post | Comment or reshare from other LinkedIn channels | No |
| **LinkedIn Page** | Yes — text-only comments on the main post | Comment or reshare from other LinkedIn channels | Auto repost; auto plug post (Page comment when likes ≥ threshold) |
| **Instagram**, **Facebook**, **YouTube**, **TikTok**, **Dev.to**, … | See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> | No | No |

Media on same-account follow-ups varies by network. See the platform table in <a href="/docs/creating-posts/threads-and-comments#what-each-platform-does">Threads and comments → What each platform does</a>.

## Global plugs

Global plugs watch **likes** on posts that already published from a channel. When the count reaches your number, OpenQuok runs the rule. If the post never reaches the threshold, the plug stops after three checks.

![Set up global plug](/docs/_assets/glossary/global-plug.webp)

### The two global rules

**Auto repost posts.** When likes reach your threshold, repost or reshare the post so more people see it. Available on **X** and **LinkedIn Page**.

**Auto plug post.** When likes reach your threshold, publish a **follow-up** from the same channel — a reply on X or Threads, or a comment on a LinkedIn Page post. Use this for a promo link or CTA after the post proves it resonates.

Both rules use the same schedule: check every six hours, up to three times per published post.

### Which channels appear on Auto Plugs

The <a href="/account/plugs">Auto Plugs</a> page lists only channels that support at least one global rule today:

| Platform | Auto repost | Auto plug post |
| --- | --- | --- |
| **X** | Yes | Yes |
| **LinkedIn Page** | Yes | Yes |
| **Threads** | No | Yes |

Personal **LinkedIn** profiles have internal plugs only. They do not appear for global rules.

### Set up a global plug

<Steps howToName="Set up a global plug on OpenQuok" howToDescription="Create a channel-level rule that fires when a published post reaches a likes threshold.">

### Open Auto Plugs

Go to <a href="/account/plugs">Account → Auto Plugs</a>. Pick the channel from the grid.

### Turn the plug on

Each rule has an on/off switch in the add or edit dialog.

### Set the likes threshold

Enter **Amount of likes**. Set a number your posts can realistically reach. A threshold that is too high means the plug never runs.

### Add follow-up content (auto plug only)

**Auto plug post** needs the reply or comment text OpenQuok will publish when the threshold is met.

### Save

The rule applies to posts published **after** you save. It does not change posts that are already live.

</Steps>

### CLI and API

Use <Badge text="openquok plugs:catalog" variant="default" />, <Badge text="plugs:list" variant="default" />, <Badge text="plugs:upsert" variant="default" />, and related commands. See <a href="/docs/cli-usages/plugs">CLI usage — Global plugs</a> and <a href="/docs/getting-started-for-public-api#plugs">Public API → Plugs</a>.

<Callout type="note" title="Likes and analytics">
<p>Global plugs read <strong>like counts</strong> from the network API. If analytics are disabled or unavailable for a channel (for example <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> on self-hosted X), threshold rules may not fire.</p>
</Callout>

## Internal plugs (composer)

Internal plugs attach to **one** scheduled post. OpenQuok runs them after the root post is live and after any same-account follow-up replies you configured in **Follow-up comments**.

You can configure them in two places:

| UI | When to use it |
| --- | --- |
| Purple <Badge text="Settings" variant="default" /> accordion (channel name in the header) | **Per-channel (custom) mode** — focus one network and open Settings below the editor |
| <Badge text="Plug settings" variant="default" /> button | **Global mode** with one channel selected, or next to **Follow-up comments** |

![How to setup cross-account plug](/docs/_assets/creating-posts/plug-settings.webp)

![Configure Engagement](/docs/_assets/glossary/internal-plug-configure.webp)

### Same-account (Threads only)

In **Settings** on a Threads channel, enable **Delayed engagement reply** to post one extra reply from the **same** account after follow-up rows and the thread finisher complete. This is separate from cross-account plugs.

### Cross-account plugs

Cross-account plugs let **other connected channels** in your workspace act on the post after publish.

| Network | What the acting channel does | Composer control |
| --- | --- | --- |
| **Threads** | Comment on the published thread | <Badge text="Add comments by other accounts" variant="default" /> — set comment text, acting channels, delay |
| **X** | Repost the published tweet | <Badge text="Add re-posters" variant="default" /> — pick other X profiles and a delay |
| **LinkedIn** / **LinkedIn Page** | Comment on the post, or reshare it | <Badge text="Add comments by a different account" variant="default" /> or <Badge text="Add re-posters" variant="default" /> |

You need at least **two** connected channels on that network. The publishing channel cannot act on itself.

**Delays** for cross-account plugs:

| Publisher | Delay presets |
| --- | --- |
| **Threads** | 2 minutes (default), 5 minutes, 1 hour, 2 hours, 3 hours, 8 hours, 12 hours, 24 hours |
| **X**, **LinkedIn** | Immediately, 1 hour, 2 hours, 3 hours, 8 hours, 12 hours, 24 hours |

<Callout type="note" title="X repost only">
<p>On <strong>X</strong>, cross-account plugs <strong>repost</strong> the root tweet. They do <strong>not</strong> post a reply comment from another X account. Use same-account <strong>Follow-up comments</strong> for quote-less replies from the publisher.</p>
</Callout>

### Set up a cross-account plug

<Steps howToName="Set up a cross-account plug in the composer" howToDescription="Schedule another connected channel to comment, repost, or reshare after your post publishes.">

### Focus the publishing channel

In **per-channel mode**, select the channel that will publish the main post. In **global mode**, select only that one channel if you use <Badge text="Plug settings" variant="default" />.

### Open Settings or Plug settings

Open the purple <Badge text="Settings" variant="default" /> accordion, or click <Badge text="Plug settings" variant="default" />.

### Enable the plug

Turn on <Badge text="Add comments by other accounts" variant="default" /> (Threads), <Badge text="Add re-posters" variant="default" /> (X or LinkedIn), or <Badge text="Add comments by a different account" variant="default" /> (LinkedIn).

### Choose acting channels and delay

Check the other connected profiles that should act. Pick how long OpenQuok waits after publish. For Threads comments, enter the comment text.

### Schedule the post

Save or schedule as usual. The plug runs automatically after the post goes live.

</Steps>

## Order of operations

For a typical scheduled post with follow-ups and plugs:

1. Publish the **main post** on each selected channel.
2. Run **same-account follow-up replies** (and thread finisher on Threads or X, if enabled).
3. Run **internal plugs** (cross-account comment, repost, or reshare; Threads delayed engagement reply).
4. **Global plugs** run on their own schedule after publish when likes cross your threshold.

## Things to check

<ul>
<li>Plugs act on <strong>likes</strong> for global rules. Pick a threshold that matches normal performance on that channel.</li>
<li>Follow-ups and plug replies count as real posts on the network. Rate limits and character rules still apply.</li>
<li>Cross-account repost on X needs at least two connected X profiles in the workspace.</li>
<li>Internal plugs are part of the post payload. Global plugs are saved on the channel at <a href="/account/plugs">/account/plugs</a>.</li>
</ul>

## Agents, CLI, and API

| Goal | Where to look |
| --- | --- |
| Cross-account plugs on create | <Badge text="providerSettingsByIntegrationId" variant="param" /> → <Badge text="crossAccountPlugs" variant="param" /> on <Badge text="threads" variant="param" />, <Badge text="x" variant="param" />, or <Badge text="linkedin" variant="param" /> |
| Threads same-account engagement plug | <Badge text="threads.internalEngagementPlug" variant="param" /> |
| Global plug rules | <Badge text="openquok plugs:*" variant="default" /> or <Badge text="GET /public/plug-catalog" variant="path" /> |

Examples: <a href="/docs/cli-examples/threads">CLI examples — Threads</a>, <a href="/docs/cli-examples/x">CLI examples — X</a>, <a href="/docs/cli-examples/linkedin">CLI examples — LinkedIn</a>, and <a href="/docs/getting-started-for-public-api/supported-social-channels#internal-plugs">Supported social channels → Internal plugs</a>.

## Related

<CardGrid>
<LinkCard title="Threads and comments" description="Follow-up replies, finisher, and cross-account plugs in the composer" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="CLI usage — Global plugs" description="plugs:catalog, plugs:upsert, and related commands" href="/docs/cli-usages/plugs" />
<LinkCard title="Public API → Plugs" description="Internal vs global plugs for API and SDK users" href="/docs/getting-started-for-public-api#plugs" />
<LinkCard title="Glossary — Internal plug" description="Short definitions for plug terms" href="/docs/getting-started/glossary#internal-plug" />
<LinkCard title="Tour the app — Auto Plugs" description="Where plugs live in the dashboard" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Plug catalog API" description="List global plug types per provider" href="/docs/apis-integrations/plug-catalog" />
</CardGrid>
