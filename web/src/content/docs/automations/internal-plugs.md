---
title: Internal plugs
description: Schedule a same-account delayed engagement reply after Follow-up comments on one post.
order: 2
lastUpdated: 2026-09-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

An **internal plug** is a same-account action on **one** scheduled post. OpenQuok runs it once after the main post publishes, once <a href="/docs/creating-posts/threads-and-comments">Follow-up comments</a> and the thread finisher finish. Today only **Threads** ships an internal plug — the **Threads delayed engagement reply**.

## Where in the post editor

| Area | What you do there |
| --- | --- |
| Purple <Badge text="Settings" variant="default" /> accordion | Focus a Threads channel. Open Settings. Enable <Badge text="Delayed reply (internal plug)" variant="default" /> |
| <Badge text="Plug settings" variant="default" /> | Cross-account plugs only — see <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a> |
| **Follow-up comments** | Same-account reply rows in the thread — not an internal plug |

## Internal plug vs follow-up comments

Internal plugs are **not** follow-up comment rows.

| Compare | **Follow-up comments** | **Internal plug** |
| --- | --- | --- |
| Where | **Follow-up comments** panel | Purple <Badge text="Settings" variant="default" /> accordion |
| When | During the reply chain | After follow-ups and the thread finisher finish |
| How many | One or more rows | One delayed engagement reply |
| Networks | Threads, X, Instagram, LinkedIn, Facebook | Threads |

For comments or reposts from **other** connected channels, use <a href="/docs/automations/cross-account-plugs">cross-account plugs</a>.

## Threads delayed engagement reply

OpenQuok posts one extra reply from the **same** Threads account after follow-up rows and the thread finisher complete.

Set **Delay before reply (seconds)**. The default is 120 seconds. Set **Reply message** for the comment text. Use it for a CTA or prompt that should land after the thread — not as another follow-up row.

<Callout type="note" title="Same account only">
<p>This plug publishes from the <strong>publishing</strong> Threads channel. To comment from another connected Threads profile, use <a href="/docs/automations/cross-account-plugs">cross-account plugs</a>.</p>
</Callout>

<Steps howToName="Enable a Threads delayed engagement reply" howToDescription="Schedule one extra same-account reply after follow-ups and the thread finisher.">

### Focus the Threads channel

Select the Threads channel that will publish the main post.

### Open Settings

Open the purple <Badge text="Settings" variant="default" /> accordion below the editor.

### Enable the plug

Turn on <Badge text="Delayed reply (internal plug)" variant="default" />. Enter the reply message. Set the delay in seconds.

### Schedule the post

Save or schedule as usual. OpenQuok publishes the extra reply after follow-ups and the thread finisher.

</Steps>

## Agents, CLI, and API

Set <Badge text="threads.internalEngagementPlug" variant="param" /> on the publishing channel in <Badge text="providerSettingsByIntegrationId" variant="param" />. See <a href="/docs/cli-examples/threads">CLI examples — Threads</a> and <a href="/docs/getting-started-for-public-api/supported-social-channels#internal-plugs">Supported social channels → Internal plugs</a>.

## Related

<CardGrid>
<LinkCard title="Plugs overview" description="Internal, cross-account, and global plugs compared" href="/docs/automations/plugs" />
<LinkCard title="Cross-account plugs" description="Other connected channels comment, repost, or reshare" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Global plugs" description="Channel rules when likes reach a threshold" href="/docs/automations/global-plugs" />
<LinkCard title="Threads and comments" description="Follow-up comments and thread finisher in the composer" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="CLI examples — Threads" description="internalEngagementPlug field shape" href="/docs/cli-examples/threads" />
<LinkCard title="Glossary — Internal plug" description="Short definition for the term" href="/docs/getting-started/glossary#internal-plug" />
</CardGrid>
