---
title: OAuth and channel connect
description: Fix Invalid state, provider token errors, and network failures when you add a social channel in OpenQuok.
order: 1
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## OAuth and channel connect

> Add Channel sends you to the network and back. These errors mean something broke in that handoff.

See <a href="/docs/channels/connect">Connect a channel</a> for the normal flow, status badges, and invite links.

## Invalid state

You often see this as a flash message right after the provider redirects back to OpenQuok.

**What it means:** OpenQuok stores a one-time security token when you start connect. The network returns a matching <Badge text="state" variant="param" /> value. If the two do not match, or the stored token is gone, connect fails.

**Common causes**

- You started connect in one tab and finished in another.
- You refreshed the provider login page mid-flow.
- A privacy extension or strict browser settings blocked cookies between the redirect out and back.
- You waited longer than about an hour — OAuth state expires after that window.
- On self-host, the API could not read shared cache (see below).

**What to try**

1. Open OpenQuok in one fresh tab. Do not bookmark the provider authorize page.
2. Pause ad blockers or cookie shields for your OpenQuok domain during connect.
3. Click <Badge text="Add Channel" variant="new" /> again from Home.
4. If a half-added channel remains, remove it from Home, then connect again.
5. Avoid private browsing if your browser clears cookies aggressively.

<Tabs items={["OpenQuok Cloud", "Self-hosted"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p>Retries usually work. If one network always fails, check <a href="/docs/social-integration">Social integrations</a> for that provider, then ask on <a href="/docs/help">Help → Discord</a>.</p>

</TabItem>
<TabItem label="Self-hosted">

<p>OAuth state is stored in cache for about one hour. In production, use a <strong>shared</strong> Redis cache so every API instance sees the same state. Memory cache on multiple servers causes random <Badge text="Invalid state" variant="param" /> errors.</p>

<p>Set <Badge text="CACHE_PROVIDER=redis" variant="envBackend" /> and the <Badge text="REDIS_*" variant="envBackend" /> variables from <a href="/docs/configuration-backend/redis">Redis cache</a>. Also align <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />, and <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envBackend" /> — see <a href="/docs/installation/production-deployment">Production deployment</a>.</p>

<p>Missing operator keys for a network still appear in <Badge text="Add Channel" variant="new" /> but fail at connect. Register the developer app and set env vars per <a href="/docs/social-integration">Social integrations</a>.</p>

</TabItem>
</Tabs>

## Provider rejected the code (invalid grant)

The network refused to swap the short-lived authorization code for an access token.

**Common causes**

- The same code was used twice — often from a double click or retry.
- The code expired (many providers allow only about a minute).
- The redirect URI in the developer console does not exactly match what OpenQuok sends (trailing slashes count).

**What to try**

1. Start connect from scratch. Codes cannot be reused.
2. Compare the redirect URI in the provider console with the URL OpenQuok documents for that integration.

## Failed to fetch or network error on connect

The OpenQuok API could not reach the provider, or your browser could not reach the API.

| Symptom | What to try |
| --- | --- |
| Error on <Badge text="POST" variant="default" /> connect right after approve | Retry once. On Cloud, transient provider outages are common. |
| CORS or blocked preflight in the browser console | Fix frontend origin on the API — <a href="/docs/installation/vercel">Production Vercel</a> and <a href="/docs/installation/production-deployment">Production deployment</a> (CORS and canonical URLs), plus <a href="/docs/configuration-web/vite">Vite configuration</a>. |
| Self-host only | Check egress, DNS, and TLS from the server. Confirm Redis and env keys. |

## Setup incomplete after OAuth

OAuth can succeed before you pick a Facebook Page, YouTube channel, Instagram professional account, or LinkedIn Page. The channel shows <Badge text="Setup incomplete" variant="param" /> until you click <Badge text="Complete setup" variant="default" /> on Home.

## Related

<CardGrid>
<LinkCard title="Manage a channel" description="Refresh connection, disable, or disconnect" href="/docs/channels/manage" />
<LinkCard title="Connect a channel" description="Flows, invite links, and status table" href="/docs/channels/connect" />
<LinkCard title="Troubleshooting overview" description="Uploads, login, and failed posts" href="/docs/troubleshooting" />
</CardGrid>
