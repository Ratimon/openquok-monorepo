---
title: Bluesky
description: Connect Bluesky to OpenQuok with an app password — schedule text, images, video, and follow-up replies.
order: 10
lastUpdated: 2026-09-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Bluesky publishing uses your <strong>handle or email</strong>, an <strong>app password</strong>, and the <strong>service URL</strong> of your account host (default <code>https://bsky.social</code>). There is no operator-registered developer app and <strong>no</strong> backend env vars for this channel. OpenQuok encrypts those credentials on the server so workers can publish on your behalf.

CLI walkthroughs: <a href="/docs/cli-examples/bluesky">CLI Examples — Bluesky</a>.

<Callout type="note" title="Dashboard connect only">
<p><strong>Add Bluesky Channel</strong> in the workspace. <Badge text="GET /api/v1/public/social/bluesky" variant="path" /> returns <strong>400</strong> — there is no public OAuth start URL for this channel.</p>
</Callout>

## How OpenQuok stores your credentials

OpenQuok needs a <strong>reversible</strong> copy of your app password and service details to log in at publish time (one-way hashing is not an option for publishing).

| Layer | What happens |
| --- | --- |
| Browser | You enter service URL, handle, and app password once in Add Channel. The values are <strong>not</strong> kept in <code>localStorage</code> or other client storage. |
| HTTP APIs | List, connect, and public integration responses <strong>omit</strong> token fields — the browser never reads the password back. |
| Database | Encrypted JSON with <Badge text="service" variant="param" />, <Badge text="identifier" variant="param" />, and <Badge text="password" variant="param" /> is stored as AES-GCM ciphertext on the connected channel (when <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> or <Badge text="SECURITY_SECRET" variant="envBackend" /> is set). OpenQuok re-validates credentials on refresh; it does <strong>not</strong> persist short-lived session tokens as the durable secret. |

The service URL must be <strong>public HTTPS</strong> only. OpenQuok rejects private, loopback, and link-local hosts (including DNS that resolves there).

<Callout type="warning" title="Treat the app password as a secret">
<p>Anyone with the app password can post as that Bluesky account. Revoke it in Bluesky settings if it leaks, then reconnect the channel in OpenQuok.</p>
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Connect | App password from Bluesky settings (works with two-factor authentication enabled) |
| Caption | Plain text up to <strong>300</strong> graphemes; text-only posts are valid |
| Media | Up to <strong>four</strong> images <strong>or</strong> <strong>one</strong> MP4 per post — never mixed |
| Alt text | Taken from media details when you set it in the composer |
| Links and mentions | <code>@handle</code> and URLs become rich-text facets at publish time |
| Follow-up replies | Same-account replies after the main post, with optional media on reply rows |
| Mentions | Composer autocomplete searches actors and inserts <code>@handle</code> |

### Not supported

| Feature | Notes |
| --- | --- |
| Operator OAuth app | No OpenQuok env keys; users paste credentials in the dashboard |
| Public OAuth connect | Dashboard only |
| Workspace or per-post analytics | Not available in OpenQuok for Bluesky today |
| Extra compose Settings fields | No title, tags, or privacy panel beyond follow-up comments |

## Create an app password

<Steps
	howToName="Bluesky Setup"
	howToDescription="Connect Bluesky to OpenQuok with an app password and schedule posts."
>

### Open Bluesky settings

Sign in to Bluesky and open <DocsExternalLink href="https://bsky.app/settings/app-passwords">Settings → App passwords</DocsExternalLink>.

### Generate an app password

Create a new app password. Copy it once — OpenQuok keeps it on the server for publishing after you paste it (see <a href="#how-openquok-stores-your-credentials">How OpenQuok stores your credentials</a>).

<Callout type="tip">
<p>You can keep <strong>two-factor authentication</strong> enabled. Use an app password here — not your main account password.</p>
</Callout>

### Connect in OpenQuok

In the workspace, choose <strong>Add Channel</strong> → <strong>Bluesky</strong>. The form prefills <strong>Service</strong> with <code>https://bsky.social</code>. Enter your handle or email and the app password, then connect. OpenQuok validates the credentials against your host, then saves the channel.

To refresh an existing channel, open the same credentials form (<strong>Refresh connection</strong> on Home) — do not expect a platform OAuth redirect.

</Steps>

## Media and thread rules

| Rule | Detail |
| --- | --- |
| Images | Up to <strong>4</strong> per main post or follow-up row |
| Video | <strong>1</strong> MP4 per post — not combined with images |
| Length | <strong>300</strong> graphemes per caption and per follow-up message when scheduling |
| Follow-ups | Configure in <strong>Follow-up comments</strong> — stored under <Badge text="bluesky.replies" variant="param" /> for API and CLI |

See <a href="/docs/platforms/media-rules">Media rules</a> and <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

## Self-host

Bluesky needs <strong>no</strong> operator OAuth pair. Leave the social-app ID/secret rows in <Badge text="infra/self-host/.env.example" variant="path" /> unchanged. Users paste credentials in the dashboard after the stack is up. See <a href="/docs/installation/docker-compose">Self-host — Docker Compose</a>.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="posts:create with images, video, and bluesky.replies" href="/docs/cli-examples/bluesky" />
<LinkCard title="Bluesky Settings" description="Public API follow-up reply shape" href="/docs/public-api-providers/bluesky" />
<LinkCard title="Adding a provider" description="OAuth vs credentials-in-app contributor checklist" href="/docs/contribution-opportunities/add-provider" />
<LinkCard title="Security guidelines" description="Service key rules, channel credentials at rest, and RLS" href="/docs/developer-guidelines/security" />
</CardGrid>
