---
title: Bluesky
description: How to add Bluesky to OpenQuok with an app password.
order: 9
lastUpdated: 2026-09-27
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="note">
<p>Operators and self-host installs do not register a Bluesky developer app or add Bluesky client secrets to the backend. Each account just pastes their own credentials in the dashboard.</p>
</Callout>

You connect with your <strong>handle or email</strong> and an <strong>app password</strong> from Bluesky settings. 

You also enter a <strong>Service</strong> URL so OpenQuok can reach and autofill the host url for your account.

<Callout type="danger">
<p>Anyone with the app password can post as that Bluesky account. Revoke it in Bluesky settings if it leaks, then reconnect the channel in OpenQuok.</p>
</Callout>

<Callout type="note">
<p>OpenQuok stores your credentials on the server in encrypted form. (see <a href="#how-openquok-stores-your-credentials">How OpenQuok stores your credentials</a>).</p>
</Callout>

## Create an app password

<Steps
	howToName="Bluesky Setup"
	howToDescription="Connect Bluesky to OpenQuok with an app password."
>

### Open Bluesky settings

Sign in to Bluesky and open **Settings** -> **Privacy and Security** -> <DocsExternalLink href="https://bsky.app/settings/app-passwords">App passwords</DocsExternalLink> -> **Add App Password**.

![Step 1 - Add Bluesky's App password](/docs/_assets/social-integration/bluesky/app-passwods-setting.webp)

### Generate an app password

Add a new app password:

![Step 2A - Add Bluesky's App password](/docs/_assets/social-integration/bluesky/add-app-password.webp)

Click **Next >** -> Copy it once:

![Step 2B - Add Bluesky's App password](/docs/_assets/social-integration/bluesky/copy-password.webp)

<Callout type="tip">
<p>You can keep <strong>two-factor authentication</strong> enabled. Use an app password here — not your main account password.</p>
</Callout>

### Connect in OpenQuok

In the workspace, choose <strong>Add Channel</strong> → <strong>Bluesky</strong>. The form prefills <strong>Service</strong> with <code>https://bsky.social</code>. Enter your handle or email and the app password.

For example, you can check your handle at your Blue Sky Profile:

![Step 3A - Check Blue Sky handle](/docs/_assets/social-integration/bluesky/openquok-handle.webp)

<Callout type="note">
<p>In this example, the handle is <Badge text="openquok.bsky.social" variant="param" />, not <Badge text="@openquok.bsky.social" variant="param" />.</p>
</Callout>

<Callout type="tip">
<p>When you enter a handle, OpenQuok resolves your Personal Data Server (PDS) and auto-fills <strong>Service</strong>. You can still edit Service before you connect. <DocsExternalLink href="https://atproto.com/blog/network-account-management">AT Protocol — network account management</DocsExternalLink> explains how account hosting on a PDS differs from connected apps (such as OpenQuok) that publish with an app password.</p>
</Callout>


![Step 3B - Connect Bluesky - autofill service url](/docs/_assets/social-integration/bluesky/connect-bluesky.webp)

<Callout type="tip">
<p>To refresh an existing channel, open the same credentials form (<strong>Refresh connection</strong> on Home) — do not expect a platform OAuth redirect.</p>
</Callout>

</Steps>

## Media and thread rules

| Rule | Detail |
| --- | --- |
| Images | Up to <strong>4</strong> per main post or follow-up row |
| Video | <strong>1</strong> MP4 per post — not combined with images; max <strong>300 MB</strong> and <strong>10 minutes</strong> |
| Length | <strong>300</strong> graphemes per caption and per follow-up message when scheduling |
| Follow-ups | Configure in <strong>Follow-up comments</strong> — stored under <Badge text="bluesky.replies" variant="param" /> for API and CLI |
| Compose settings | Link card, quote post, and thread gate — see <a href="/docs/platforms/per-channel-settings#bluesky">Per-channel settings → Bluesky</a> |

<Callout type="note">
<p>See <a href="/docs/platforms/media-rules">Media rules</a>, <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>, and <a href="/docs/automations/global-plugs">Global plugs</a>.</p>
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Connect | App password from Bluesky settings (works with two-factor authentication enabled) |
| Caption | Plain text up to <strong>300</strong> graphemes; text-only posts are valid |
| Media | Up to <strong>four</strong> images <strong>or</strong> <strong>one</strong> MP4 per post — never mixed |
| Alt text | Taken from media details when you set it in the composer |
| Links and mentions | <code>@handle</code> and URLs in the caption become rich-text facets at publish time |
| Optional link card | Text-only posts: <strong>Link card URL</strong> (+ optional title/description) in composer Settings — not with media or a quote |
| Quote post | Optional <code>bsky.app</code> post URL in Settings — not with media or a link card |
| Who can reply | <strong>Thread gate</strong> in Settings (everyone, mentioned, following, followers, or nobody) |
| Follow-up replies | Same-account replies after the main post, with optional media on reply rows |
| Mentions | Composer autocomplete searches actors and inserts <code>@handle</code> |
| Global plugs | Auto-repost and auto-plug when likes cross a threshold — configure on the channel <strong>Plugs</strong> tab |
| Workspace analytics | Account-level likes, replies, reposts, and quotes by day (public App View author feed) |
| Per-post statistics | Likes, replies, reposts, and quotes for a published post (AT Protocol post URI) |

<Callout type="tip">
<p>CLI walkthroughs: <a href="/docs/cli-examples/bluesky">CLI Examples — Bluesky</a>.</p>
</Callout>

### Not supported

| Feature | Notes |
| --- | --- |
| Operator OAuth app | No OpenQuok env keys; users paste credentials in the dashboard |
| Public OAuth connect | Dashboard only |
| Cross-account plugs | Same-account follow-ups only — no comment-from-another-channel plugs |

## How OpenQuok stores your credentials

Bluesky is built on the <strong>AT Protocol</strong>. Your account data lives on a <strong>Personal Data Server (PDS)</strong>. The default host for most handles, or another public HTTPS server when you use a custom domain or self-hosted PDS.

OpenQuok must store a <strong>reversible</strong> app password and service details so publish workers can sign in.

Bluesky’s safe pattern is an <strong>app password</strong>, not your main login: you create it in settings, scope it to connected apps, and revoke it without changing your account password.

<Callout type="note">
<p>See <DocsExternalLink href="https://docs.bsky.app/blog/account-management">Bluesky — account management</DocsExternalLink> and <DocsExternalLink href="https://bsky.app/profile/safety.bsky.app/post/3k7waehomo52m">Bluesky Safety on app passwords</DocsExternalLink>.</p>
</Callout>


| Layer | What happens |
| --- | --- |
| Browser | Service URL, handle, and app password entered once in Add Channel — not kept in <code>localStorage</code> |
| APIs | Connect and list responses omit token fields |
| Database | <Badge text="service" variant="param" />, <Badge text="identifier" variant="param" />, and <Badge text="password" variant="param" /> encrypted with AES-GCM when <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> or <Badge text="SECURITY_SECRET" variant="envBackend" /> is set |

For a <strong>handle</strong> or <code>did:…</code>, OpenQuok resolves the PDS from the identity record and updates <strong>Service</strong> when you leave the handle field. <strong>Email</strong> logins keep the Service you enter (usually <code>https://bsky.social</code>). Only <strong>public HTTPS</strong> Service URLs are accepted — private, loopback, and link-local hosts are rejected.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="posts:create with images, video, and bluesky.replies" href="/docs/cli-examples/bluesky" />
<LinkCard title="Bluesky Settings" description="Public API follow-up reply shape" href="/docs/public-api-providers/bluesky" />
<LinkCard title="Adding a provider" description="OAuth vs credentials-in-app contributor checklist" href="/docs/contribution-opportunities/add-provider" />
<LinkCard title="Security guidelines" description="Service key rules, channel credentials at rest, and RLS" href="/docs/developer-guidelines/security" />
</CardGrid>
