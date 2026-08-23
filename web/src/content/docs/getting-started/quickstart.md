---
title: Quickstart
description: Schedule your first OpenQuok post — get in, connect a channel, compose, schedule, and confirm on the calendar and kanban.
order: 1
lastUpdated: 2026-08-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

This walks through the whole loop once: get into OpenQuok, connect a channel, write a post, schedule it, and confirm it is queued. The same UI applies on **OpenQuok Cloud** and a self-hosted install.

<Callout type="note" title="Looking for install steps?">
<p>Operator install lives under <a href="/docs/installation">Self-hosting</a>. This page is the product loop after you can sign in.</p>
</Callout>

<Steps>

### Get in

**Cloud** — Sign up, confirm your email if prompted, and open the app. New workspaces start a **7-day trial** (no credit card required to explore). Plan caps still apply during the trial — see <a href="/docs/cloud/trial">Trial</a> and <a href="/pricing">Pricing</a>.

You land on <Badge text="Home" variant="default" /> at <a href="/account">/account</a>. Your first workspace is created automatically. Use the workspace switcher in the header if you belong to more than one.

**Self-hosting** — Follow <a href="/docs/installation">Installation</a>, then open your instance and register. The first account becomes the workspace owner. There is no hosted trial or Stripe paywall when billing is unset.

Set <Badge text="Timezone" variant="default" /> under Settings so scheduled times match your working day.

### Connect a channel

A **channel** is one connected social account. Everything else hangs off channels.

On Home, click <Badge text="Add Channel" variant="new" /> (or pick a network in the composer) and finish the provider flow in the browser.

<Callout type="tip" title="Cloud vs self-host">
<p>On <strong>OpenQuok Cloud</strong>, OAuth apps are already registered — you only authorize your social account. When you <strong>self-host</strong>, the operator supplies provider keys first. See <a href="/docs/social-integration">Social integrations</a>.</p>
</Callout>

The channel appears on Home with its avatar. Reconnect from the channel menu if a token expires.

### Compose

Click <Badge text="Create Post" variant="new" /> on Home, or click a day (or empty slot) on the <a href="/account/calendar">calendar</a> to start at that time.

1. **Select the channels** at the top of the composer.
2. **Write once in Global** (the globe control). The same caption goes to every selected channel. Click a channel avatar to tailor that version without changing the others.
3. **Add media** from your device or the <a href="/account/media">media library</a>.
4. **Fill provider settings** in the side panel when the network requires them (for example a YouTube title, Instagram post type, or Dev.to tags).

The preview shows how the post will look on each network.

### Schedule it

Pick a date and time at the bottom of the composer, then choose how to save:

| Button | What it does |
| --- | --- |
| <Badge text="Save as draft" variant="default" /> | Keeps the post on Home in **Drafted posts**. It never publishes until you schedule it. |
| <Badge text="Add to calendar" variant="new" /> | Queues it for the time you picked. The primary button reads <Badge text="Update" variant="default" /> when you are editing an existing post. |

OpenQuok does not ship a separate **Post now** control. To publish as soon as workers run, pick a time at or before now and use <Badge text="Add to calendar" variant="new" />.

If a channel is missing a required field, save is blocked until you fix that channel’s settings.

### Confirm it

On <Badge text="Home" variant="default" />, the card sits in **Drafted posts** or **Scheduled posts**. On the <a href="/account/calendar">calendar</a>, it appears in the slot you chose. After the scheduled time it moves to **Published**.

If publish fails, the calendar card shows <Badge text="Failed" variant="default" />. Usual causes are a channel that needs reconnecting or a network rule the payload broke. Open the card, fix copy or media, reconnect if the error mentions auth, and schedule again.

</Steps>

## If something goes wrong

| Symptom | What to do |
| --- | --- |
| Channel disconnected or expired token | On Home, open the channel menu and reconnect. For API-key networks (Dev.to), paste a new key. Then retry the failed card. Self-host operators also check keys in <a href="/docs/social-integration">Social integrations</a>. |
| Draft never leaves Home | Confirm a **future** time and at least one channel. Drag the card to **Scheduled posts**, or open it and use <Badge text="Add to calendar" variant="new" />. Check <Badge text="Timezone" variant="default" /> in Settings — a wrong zone can make times look stuck in the past. Agent and API drafts still need a schedule time. CLI: <code>openquok posts:status &lt;post-id&gt; -s schedule</code> — see <a href="/docs/cli-usages/managing-posts">Managing posts</a>. |
| Failed card at publish time | Open it, read the provider error, fix copy or media, reconnect if the error mentions auth, and schedule again. |
| Connect, upload, invite, or schedule blocked with a billing message | That is a plan cap, not a product bug — see <a href="/docs/cloud/limits">Cloud limits</a> and <a href="/account/billing">Billing</a>. |

CLI, MCP, or API **401** errors usually mean a rotated token. Generate a new one under Settings → <Badge text="Developers" variant="default" /> → **Access**. See <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Where to next

<CardGrid>
<LinkCard title="Concepts" description="Workspace, channel, post group, and calendar vs kanban — defined once" href="/docs/getting-started/concepts" />
<LinkCard title="Where things live" description="What every section of the app is for" href="/docs/getting-started/where-things-live" />
<LinkCard title="Cloud" description="Trial, plans, billing, and limits for the hosted product" href="/docs/cloud" />
<LinkCard title="Self-hosting" description="Docker Compose, configuration, and operator guides" href="/docs/installation" />
</CardGrid>
