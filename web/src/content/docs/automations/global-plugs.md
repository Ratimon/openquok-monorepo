---
title: Global plugs
description: Channel rules at Auto Plugs that run when likes on a published post reach your threshold.
order: 4
lastUpdated: 2026-09-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

A **global plug** is a **channel** rule at <a href="/account/plugs">Account → Auto Plugs</a>. It watches **likes** on posts that already published. When the count reaches your threshold, OpenQuok runs the rule. If the threshold is never met, the worker stops after **three checks**.

For one scheduled post, use an <a href="/docs/automations/internal-plugs">internal plug</a> or a <a href="/docs/automations/cross-account-plugs">cross-account plug</a> in the post editor instead.

![Set up global plug](/docs/_assets/glossary/global-plug.webp)

## The two global Rules

| Rule | What it publishes |
| --- | --- |
| **Auto repost posts** | Repost or reshare the live post so more people see it |
| **Auto plug post** | A **follow-up** from the same channel — a reply on X or Threads, or a comment on a LinkedIn Page post |

Use **auto plug post** for a promo link or CTA after the post proves it resonates.

The worker checks every **6 hours**, up to **3 times** per published post. New rules apply to posts published **after** you save.

## Supported channels

The <a href="/account/plugs">Auto Plugs</a> page lists only channels that support at least one global rule today:

| Platform | Auto repost | Auto plug post |
| --- | --- | --- |
| **X** | Yes | Yes |
| **LinkedIn Page** | Yes | Yes |
| **Threads** | No | Yes |

Personal **LinkedIn** profiles have per-post plugs only. They do not appear for global rules.

## Set up a global plug

<Steps howToName="Set up a global plug on OpenQuok" howToDescription="Create a channel-level rule that fires when a published post reaches a likes threshold.">

### Open Auto Plugs

Go to <a href="/account/plugs">Account → Auto Plugs</a>. Pick the channel from the grid.

### Turn the plug on

Each rule has an on/off switch in the add or edit dialog.

### Set the likes threshold

Enter **Amount of likes**. Choose a count your channel usually reaches within a few days — the worker only checks three times.

### Add follow-up content (auto plug only)

**Auto plug post** needs the reply or comment text OpenQuok will publish when the threshold is met.

### Save

The rule applies to posts published **after** you save. It does not change posts that are already live.

</Steps>

## CLI and API

Use <Badge text="openquok plugs:catalog" variant="default" />, <Badge text="plugs:list" variant="default" />, <Badge text="plugs:upsert" variant="default" />, and related commands. See <a href="/docs/cli-usages/plugs">CLI usage — Global plugs</a> for command examples. HTTP routes are in <a href="/docs/getting-started-for-public-api#plugs">Public API → Plugs</a> and <a href="/docs/apis-integrations/plug-catalog">Plug catalog API</a>.

<Callout type="note" title="Likes and analytics">
<p>Global plugs read <strong>like counts</strong> from the network API. If analytics are disabled or unavailable for a channel (for example <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> on self-hosted X), threshold rules may not fire.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Plugs overview" description="Internal, cross-account, and global plugs compared" href="/docs/automations/plugs" />
<LinkCard title="Internal plugs" description="Same-account delayed engagement on one post" href="/docs/automations/internal-plugs" />
<LinkCard title="Cross-account plugs" description="Other connected channels comment, repost, or reshare" href="/docs/automations/cross-account-plugs" />
<LinkCard title="CLI usage — Global plugs" description="plugs:catalog, plugs:upsert, and related commands" href="/docs/cli-usages/plugs" />
<LinkCard title="Public API → Plugs" description="Channel-level plug endpoints for API and SDK users" href="/docs/getting-started-for-public-api#plugs" />
<LinkCard title="Plug catalog API" description="List global plug types per provider" href="/docs/apis-integrations/plug-catalog" />
<LinkCard title="Tour the app — Auto Plugs" description="Where Auto Plugs live in the dashboard" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Glossary — Global plug" description="Short definition for the term" href="/docs/getting-started/glossary#global-plug" />
</CardGrid>
