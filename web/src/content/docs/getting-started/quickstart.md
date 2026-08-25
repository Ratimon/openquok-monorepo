---
title: Quickstart
description: OpenQuok zero to hero — five steps from a new workspace to a queued post.
order: 1
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

Sign in, connect a channel, compose, pick a time, then confirm the post on the calendar and kanban. Cloud and self-hosted share this UI.

<Callout type="note">
<p>Need to install first? See <a href="/docs/installation">Self-hosting</a>.</p>
</Callout>

<Steps>

### Choose Cloud or Self-host options

<Tabs items={["Cloud", "Self-hosting"]} variant="line">
<TabItem label="Cloud">

<p>Sign up, confirm your email, and open the app. New workspaces start a <a href="/docs/cloud/trial">7-day trial</a> (no credit card required). Plan caps still apply during the trial — see <a href="/pricing">Pricing</a>.</p>

<p>You land on <Badge text="Home" variant="default" /> at <a href="/account">/account</a>. Your first workspace is created automatically. You can create and switch your workspaces to prevent mixing things.</p>

</TabItem>
<TabItem label="Self-hosting">

<p>Follow <a href="/docs/installation">Installation</a>, then open your instance and signup. The first account becomes the workspace owner.</p>

<p>There is no trial or Stripe paywall when billing is unset.</p>

</TabItem>
</Tabs>

<p>Set <Badge text="Timezone" variant="default" /> under Settings so scheduled times match your working day. See <a href="/docs/getting-started/tour-the-app">Tour the app</a> for where settings live.</p>

### Connect a channel

<p>A <strong>channel</strong> is one connected social account: one LinkedIn page, one Instagram account, and so on.</p>

<p>On Home, click <Badge text="Add Channel" variant="new" /> or pick a different channel in the post editor, then finish the provider or Oauth flow.</p>

![Step 2 - Connect Channel](/docs/_assets/getting-started/2-connect-channel.webp)

<p>Each network uses its own connect flow — usually OAuth in the browser, sometimes an API key or credentials you paste in the dialog. See <a href="/docs/channels/connect">Connect a channel</a> for what each one means.</p>

<Tabs items={["Cloud", "Self-hosting"]} variant="line">
<TabItem label="Cloud">

<p>OAuth apps are already registered — you only authorize your social account.</p>

</TabItem>
<TabItem label="Self-hosting">

<p>You supply provider keys first. See <a href="/docs/social-integration">Social integrations</a>.</p>

</TabItem>
</Tabs>

<p>The channel appears on Home with its avatar. Reconnect from the channel menu if a token expires — see <a href="/docs/channels/manage">Manage a channel</a>.</p>

### Compose your post in post editor

<p>Click <Badge text="Create Post" variant="new" /> on Home, or click a day (or empty slot) on the <a href="/account/calendar">calendar</a> to start at that time.</p>

<ol>
<li><strong>Select the channels</strong> at the top of the post editor.</li>
<li><strong>Write once in Global</strong>. The same caption goes to every selected channel. To tailor one network, switch to that channel and unlock it — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</li>
<li><strong>Add media</strong> from your device or the <a href="/account/media">media library</a>. See <a href="/docs/creating-posts/media">Media</a>.</li>
<li><strong>Fill provider settings</strong> in the side panel when channels need different fields (for example a YouTube title, Instagram post type, or Dev.to tags).</li>
</ol>

![Step 3 - Post Editor](/docs/_assets/getting-started/3-compose-your-post.webp)

<p>The preview shows how the post will look on each network. See <a href="/docs/creating-posts/writing-the-post">Writing the post</a> for the full composer tour.</p>

### Schedule it

<p>Pick a date and time at the bottom of the composer, then choose how to save. See <a href="/docs/creating-posts/scheduling">Scheduling</a> for draft vs scheduled vs publish-now behavior.</p>

| Button | What it does |
| --- | --- |
| <Badge text="Save as draft" variant="default" /> | Keeps the post as **Drafted posts**. It never publishes until you schedule. |
| <Badge text="Add to calendar" variant="new" /> | Queues it for the time you picked. |
| <Badge text="Publish now" variant="new" /> | Publishes immediately — hover the schedule button or open its menu to find it. |

<p>If a channel is missing a required field, save is blocked until you fix that channel’s settings. See <a href="/docs/creating-posts/links-and-validation">Links and validation</a>.</p>

### Confirm it

<p>On <Badge text="Home" variant="default" />, the card sits in <strong>Drafted posts</strong> or <strong>Scheduled posts</strong>. On the <a href="/account/calendar">calendar</a>, it appears in the slot you chose.</p>

<p>After the scheduled time it moves to <strong>Published</strong>, and there should be email, notifying the published post's link.</p>

<p>If publish fails, the calendar card shows <Badge text="Failed" variant="default" />. Usual causes are a channel that needs reconnecting or a network rule the payload broke. See <a href="/docs/platforms">Posting rules by platform</a>, open the card for the error, fix copy or media, reconnect if auth failed, and schedule again.</p>

</Steps>

## If something goes wrong

<p>You can always contact human support via <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink>, but the ticket can be closed faster if you provide the detailed error:</p>

| Symptom | What to do |
| --- | --- |
| Channel disconnected or expired token | On Home, open the channel menu and reconnect. For API-key channels ( eg. Dev.to), paste a new key. Then reconnect. For Self-host, you may also check keys in <a href="/docs/social-integration">Social integrations</a>. |
| Draft never leaves Home | Confirm a **future** time and at least one channel. Drag the card to **Scheduled posts**, or open it and use <Badge text="Add to calendar" variant="new" />. Check <Badge text="Timezone" variant="default" /> in Settings if it is right. Agent and API drafts still need a schedule time. CLI: <code>openquok posts:status &lt;post-id&gt; -s schedule</code> — see <a href="/docs/cli-usages/managing-posts">Managing posts</a>. |
| Failed at publish time | Open it, read the provider error, fix copy or media, reconnect if the error mentions auth, and schedule again. See <a href="/docs/platforms">Posting rules by platform</a>. |
| Connect, upload, invite, or schedule blocked with a billing message | That is a plan cap, not a product bug — see <a href="/docs/cloud/limits">Cloud limits</a> and <a href="/account/billing">Billing</a>. |

CLI, MCP, or API **401** errors usually mean a rotated token. Generate a new one under Settings → <Badge text="Developers" variant="default" /> → **Access**. See <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.

## Where to next

<CardGrid>
<LinkCard title="Glossary" description="Workspace, channel, post group, and calendar vs kanban" href="/docs/getting-started/glossary" />
<LinkCard title="Tour the app" description="Sidebar, header, composer, and settings" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Posting rules by platform" description="Character limits, media rules, and per-network settings" href="/docs/platforms" />
<LinkCard title="Connect a channel" description="OAuth, API keys, and invite links" href="/docs/channels/connect" />
<LinkCard title="Global vs per-channel" description="One caption for every channel or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Approvals" description="Preview links and client comments before you schedule" href="/docs/calendar-and-posts/approvals" />
<LinkCard title="Automations" description="CLI, MCP, public API, and future RSS or webhook flows" href="/docs/automations" />
<LinkCard title="Cloud" description="Trial, plans, billing, and limits for the hosted product" href="/docs/cloud" />
<LinkCard title="Self-hosting" description="Docker Compose and configuration guides" href="/docs/installation" />
</CardGrid>
