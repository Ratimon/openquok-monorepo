---
title: Connect flow & rules
description: How you connect each OpenQuok channel in Add Channel — OAuth, credentials, self-host operator OAuth keys, and channel keys.
order: 1
lastUpdated: 2026-09-22
sidebar:
  label: Connect rules
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Connect rules

> How you link each network to your workspace in **Add Channel**, and which **channel key** the API uses for that connection.

OpenQuok registers **ten** channels. Connect each one once per workspace account. See <a href="/docs/channels/connect">Connect a channel</a>.

<p class="not-prose flex flex-wrap items-center gap-3">
<a href="/channels/facebook" title="Facebook Page"><img src="/docs/_assets/platforms/socials/facebook.svg" alt="Facebook Page" width="32" height="32" /></a>
<a href="/channels/threads" title="Threads"><img src="/docs/_assets/platforms/socials/threads.svg" alt="Threads" width="32" height="32" /></a>
<a href="/channels/instagram" title="Instagram"><img src="/docs/_assets/platforms/socials/instagram.svg" alt="Instagram" width="32" height="32" /></a>
<a href="/channels/linkedin" title="LinkedIn"><img src="/docs/_assets/platforms/socials/linkedin.svg" alt="LinkedIn" width="32" height="32" /></a>
<a href="/channels/x" title="X"><img src="/docs/_assets/platforms/socials/x.svg" alt="X" width="32" height="32" /></a>
<a href="/channels/youtube" title="YouTube"><img src="/docs/_assets/platforms/socials/youtube.svg" alt="YouTube" width="32" height="32" /></a>
<a href="/channels/tiktok" title="TikTok"><img src="/docs/_assets/platforms/socials/tiktok.svg" alt="TikTok" width="32" height="32" /></a>
<a href="/channels/devto" title="Dev.to"><img src="/docs/_assets/platforms/socials/devto.svg" alt="Dev.to" width="32" height="32" /></a>
</p>

Instagram and LinkedIn each map to **two** channel keys in the table below (Business and Standalone, or personal profile and Page).

## Every platform

### How you connect it

**How you connect it** is what happens when you click the platform in **Add Channel**:

| Connect type | What you do |
| --- | --- |
| **OAuth** | OpenQuok sends you to the platform. You sign in and approve access there. You return to OpenQuok. Some networks then ask you to pick a Page, Instagram account, or YouTube channel. |
| **Credentials in OpenQuok** | You paste your own API key in a dialog. The self-host operator does not add platform OAuth keys for that channel. |

![Open The modal to connect a channel](/docs/_assets/channel-groups/add-channel-modal.webp)

When you **self-host** OpenQuok, the **operator** (who runs the server) must register an OAuth app with each network and set that app’s client ID and secret in <a href="/docs/configuration-backend">backend environment variables</a>. Workspace members then connect their own accounts in Add Channel.

The last column marks which channels need that operator setup (**Yes** for OAuth networks, **No** when the user pastes a personal API key instead).

<Callout type="tip">
On <a href="/docs/cloud">OpenQuok Cloud</a>, those OAuth apps are already configured — you only sign in to your account. For self-hosting, See <a href="/docs/social-integration">Social integrations</a> and <a href="/docs/installation/docker-compose#optional-social-provider-apps">Docker Compose → Social provider apps</a>.
</Callout>

<Callout type="note">
Naming in the dashboard vs the API is in <a href="/docs/platforms">Platforms overview</a>. Caption length, media, and editors are in <a href="/docs/platforms/media-rules">Media rules</a>. Fields in the composer **Settings** panel are in <a href="/docs/platforms/per-channel-settings">Per-channel settings</a>.
</Callout>


| Display name | Channel key | How you connect it | Self-host: operator OAuth keys |
| --- | --- | --- | --- |
| **Threads** | <Badge text="threads" variant="param" /> | OAuth | Yes |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | OAuth (+ Page picker) | Yes |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | OAuth (+ Page picker) | Yes |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | OAuth | Yes |
| **LinkedIn** | <Badge text="linkedin" variant="param" /> | OAuth | Yes |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | OAuth (+ Page picker) | Yes |
| **YouTube** | <Badge text="youtube" variant="param" /> | OAuth (+ channel picker) | Yes |
| **TikTok** | <Badge text="tiktok" variant="param" /> | OAuth | Yes |
| **X** | <Badge text="x" variant="param" /> | OAuth | Yes |
| **Dev.to** | <Badge text="devto" variant="param" /> | Credentials in OpenQuok | No |

## Connect in the dashboard only

Most channels use **OAuth**: you click the network in **Add Channel**, sign in on the platform site, and return to OpenQuok.

**Dev.to** is different. You paste a **personal API key** in Add Channel. There is no OAuth redirect for Dev.to.

You can schedule Dev.to posts through the API after the channel is connected. You **cannot** start a new Dev.to connection through the public OAuth connect URL.

Operator setup for each OAuth network is in <a href="/docs/social-integration">Social integrations</a>.

## Related

<CardGrid>
<LinkCard title="Platforms overview" description="App names vs API keys, follow-ups, and how rules apply" href="/docs/platforms" />
<LinkCard title="Media rules" description="Attachments, character caps, and caption editors" href="/docs/platforms/media-rules" />
<LinkCard title="Per-channel settings" description="Composer Settings fields per network" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Connect a channel" description="OAuth and credentials step by step" href="/docs/channels/connect" />
</CardGrid>
