---
title: Cross-account plugs
description: Let other connected channels comment, repost, or reshare after your OpenQuok post publishes.
order: 3
lastUpdated: 2026-09-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

A **cross-account plug** lets **another connected channel** act on your post after publish. The acting channel is not the publishing channel.

You need at least **two** connected channels on that network. The publishing channel cannot act on itself.

![How to setup cross-account plug](/docs/_assets/creating-posts/plug-settings.webp)

![Configure Engagement](/docs/_assets/glossary/internal-plug-configure.webp)

## What each network does

| Network | What the acting channel does | Composer control |
| --- | --- | --- |
| **Threads** | Comment on the published thread | <Badge text="Add comments by other accounts" variant="default" /> — set comment text, acting channels, delay |
| **X** | Repost the published tweet | <Badge text="Add re-posters" variant="default" /> — pick other X profiles and a delay |
| **LinkedIn** / **LinkedIn Page** | Comment on the post, or reshare it | <Badge text="Add comments by a different account" variant="default" /> or <Badge text="Add re-posters" variant="default" /> |

Same-account follow-ups stay in the <a href="/docs/creating-posts/threads-and-comments">Follow-up comments</a> panel. A same-account Threads delayed reply is an <a href="/docs/automations/internal-plugs">internal plug</a>.

## Delays

| Publisher | Delay presets |
| --- | --- |
| **Threads** | 2 minutes (default), 5 minutes, 1 hour, 2 hours, 3 hours, 8 hours, 12 hours, 24 hours |
| **X**, **LinkedIn** | Immediately, 1 hour, 2 hours, 3 hours, 8 hours, 12 hours, 24 hours |

<Callout type="note" title="X repost only">
<p>On <strong>X</strong>, cross-account plugs <strong>repost</strong> the root tweet. They do <strong>not</strong> post a reply comment from another X account. Use same-account <strong>Follow-up comments</strong> for quote-less replies from the publisher.</p>
</Callout>

## Set up a cross-account plug

<Steps howToName="Set up a cross-account plug in the composer" howToDescription="Schedule another connected channel to comment, repost, or reshare after your post publishes.">

### Open Settings or Plug settings

In **per-channel mode**, select the channel that will publish the main post. Then open the purple <Badge text="Settings" variant="default" /> accordion. In **global mode**, select only that one channel and click <Badge text="Plug settings" variant="default" />.

### Enable the plug

Turn on <Badge text="Add comments by other accounts" variant="default" /> (Threads), <Badge text="Add re-posters" variant="default" /> (X or LinkedIn), or <Badge text="Add comments by a different account" variant="default" /> (LinkedIn).

### Choose acting channels and delay

Check the other connected profiles that should act. Pick how long OpenQuok waits after publish. For Threads comments, enter the comment text.

### Schedule the post

Save or schedule as usual. The plug runs automatically after the post goes live.

</Steps>

## Agents, CLI, and API

Put entries in <Badge text="crossAccountPlugs" variant="param" /> on the **publishing** channel under <Badge text="providerSettingsByIntegrationId" variant="param" />. Use the <Badge text="threads" variant="param" />, <Badge text="x" variant="param" />, or <Badge text="linkedin" variant="param" /> bucket.

List acting channel UUIDs in <Badge text="integrationIds" variant="param" />. Do not include the publisher. See <a href="/docs/cli-examples/threads">CLI examples — Threads</a>, <a href="/docs/cli-examples/x">CLI examples — X</a>, and <a href="/docs/cli-examples/linkedin">CLI examples — LinkedIn</a> for field shapes. MCP prompts are in <a href="/docs/mcp-examples/threads">MCP examples — Threads</a>.

## Related

<CardGrid>
<LinkCard title="Plugs overview" description="Internal, cross-account, and global plugs compared" href="/docs/automations/plugs" />
<LinkCard title="Internal plugs" description="Same-account delayed engagement on one post" href="/docs/automations/internal-plugs" />
<LinkCard title="Global plugs" description="Channel rules when likes reach a threshold" href="/docs/automations/global-plugs" />
<LinkCard title="Threads and comments" description="Follow-up replies and where Settings lives" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="CLI examples — Threads" description="threads.crossAccountPlugs field shape" href="/docs/cli-examples/threads" />
<LinkCard title="CLI examples — X" description="x.crossAccountPlugs field shape" href="/docs/cli-examples/x" />
<LinkCard title="CLI examples — LinkedIn" description="linkedin.crossAccountPlugs field shape" href="/docs/cli-examples/linkedin" />
</CardGrid>
