---
title: Connect a channel
description: The two ways OpenQuok connects a social account today — OAuth redirect or credentials you paste in Add Channel.
order: 1
lastUpdated: 2026-08-24
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Where to start

A **channel** is one linked social account — one X profile, one LinkedIn Page, one Threads login.

The calendar, post editor, analytics, and templates all need at least one channel before they can do anything useful, so connecting is the first step in a new workspace.

On <a href="/account">Home</a>, click <Badge text="Add Channel" variant="new" />. You can open the same picker from the channel row in the post editor.

![Add Channel dialog](/docs/_assets/getting-started/2-connect-channel.webp)

Pick the network you want. OpenQuok picks the connection flow for that platform — you do not choose it yourself.

## The two connection flows

OpenQuok currently supports **two** ways to connect. Which one you get depends on the platform, not on a setting in your workspace.

<Callout type="note" title="More flows later">
<p>Additional connection types — such as in-app setup dialogs or a browser extension for networks without a public API — may ship in future releases. When they do, this page will list them here.</p>
</Callout>

<Tabs items={["OAuth redirect", "Credentials you supply"]} variant="line">
<TabItem label="OAuth redirect">

<p>The usual path: X, LinkedIn, Threads, TikTok, Instagram, Facebook Page, YouTube, and most other listed networks.</p>

<ol>
<li>Click the network in <Badge text="Add Channel" variant="new" />.</li>
<li>Your browser opens that platform’s sign-in or permission screen.</li>
<li>Approve access.</li>
<li>You land back in OpenQuok with the channel connected.</li>
</ol>

<p>On <a href="/docs/cloud">OpenQuok Cloud</a>, the developer apps are already registered — you only authorize your own account.</p>

<p>Some OAuth logins cover more than one destination. After you approve access, OpenQuok may ask one more question before the channel is ready:</p>

| Network | What you pick |
| --- | --- |
| Facebook Page | Which Page to publish to |
| Instagram Business | Which professional account linked to your Meta Page |
| YouTube | Which channel under your Google account |
| LinkedIn Page | Which company Page you administer |

<p>Finish that step before you schedule posts. Until you do, the channel shows <strong>Setup incomplete</strong> and cannot publish — click <Badge text="Complete setup" variant="default" /> on Home.</p>

</TabItem>
<TabItem label="Credentials you supply">

<p>Some networks skip the browser redirect. OpenQuok asks for credentials in a short form inside <Badge text="Add Channel" variant="new" />. There is no platform redirect and no developer app for you to register.</p>

<p>Today that includes <strong>Dev.to</strong>:</p>

| Platform | What you paste |
| --- | --- |
| Dev.to | API key from Dev.to settings |

<Callout type="tip">
<p>Use a platform-specific API key or app password when one exists, not your main login password. You can revoke those keys without locking yourself out of the account.</p>
</Callout>

<p>Credentials are stored encrypted. To change them later, open the channel menu on Home and click <Badge text="Refresh connection" variant="default" /> — paste a new key when the form appears.</p>

</TabItem>
</Tabs>

## Let a client connect their own account

You do not need their password. Next to <Badge text="Add Channel" variant="new" /> on Home, click the link icon (<Badge text="Send Invite Link to connect channel" variant="default" />).

OpenQuok copies an **invite link** to your clipboard (valid for one hour). Send it to your client. They open it, sign in on the platform, and the channel appears in your workspace.

Invite links work only for **OAuth redirect** networks. Platforms that need credentials pasted in a form are excluded — connect those yourself or ask the client to sign in to OpenQuok and use <Badge text="Add Channel" variant="new" />.

See <a href="/docs/channels/channel-groups">Channel groups</a> when you want client channels bundled and filtered together.

## After you connect

The channel shows on Home with its avatar. Status badges on the channel grid summarize readiness:

| Status | What it means |
| --- | --- |
| <Badge text="Ready" variant="param" /> | You can schedule posts to this channel |
| <Badge text="Setup incomplete" variant="param" /> | OAuth finished but you still need to pick a Page, channel, or account — click <Badge text="Complete setup" variant="default" /> |
| <Badge text="Refresh needed" variant="param" /> | The login expired or needs renewing — click <Badge text="Refresh connection" variant="default" /> |
| <Badge text="Disabled" variant="param" /> | You turned the channel off — use <Badge text="Enable channel" variant="default" /> in the menu to post again |

<Callout type="warning">
<p>You can connect more than one channel on the same network. Before you add another login on that platform, sign out of the service in your browser. Otherwise OpenQuok may reuse the account you connected last.</p>
</Callout>

## If connecting fails

| Problem | What to try |
| --- | --- |
| Platform missing or always errors | See Cloud vs self-host below |
| <Badge text="Invalid state" variant="param" /> right after you approved | Start again in one fresh browser tab. Privacy extensions or extra tabs can drop the security token that ties the redirect to your session |
| Connected but posts fail immediately | The platform may require extra approval for API posting until a developer app is reviewed. Check the error on the failed post card |
| Blocked with a billing message | Plan cap, not a bug — see <a href="/docs/cloud/limits">Cloud limits</a> |

<Tabs items={["Cloud", "Self-hosting"]} variant="line">
<TabItem label="Cloud">

<p>Every listed network should connect when you click it. If one consistently fails, contact support on <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink>.</p>

</TabItem>
<TabItem label="Self-hosting">

<p>OpenQuok lists platforms even when operator keys are missing. A network that always fails at connect usually needs its developer app registered and env keys set. See <a href="/docs/social-integration">Social integrations</a>.</p>

</TabItem>
</Tabs>

## Related

<CardGrid>
<LinkCard title="Manage a channel" description="Reconnect, disable, or disconnect a connected account" href="/docs/channels/manage" />
<LinkCard title="Posting time slots" description="Set usual posting hours after you connect" href="/docs/channels/time-slots" />
<LinkCard title="Channel groups" description="Group channels by client or brand" href="/docs/channels/channel-groups" />
<LinkCard title="Dev.to" description="Create an API key and connect Dev.to" href="/docs/social-integration/devto" />
<LinkCard title="Quickstart" description="Connect a channel and schedule your first post" href="/docs/getting-started/quickstart" />
</CardGrid>
