---
title: Skool
description: Connect Skool to OpenQuok with the browser extension while you are signed in on skool.com.
order: 11
lastUpdated: 2026-10-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="note">
<p>Self-host installs do <strong>not</strong> register a Skool developer app or add Skool secrets to the backend. Each member connects with the <strong>OpenQuok browser extension</strong> while logged in to Skool.</p>
</Callout>

OpenQuok uses your active Skool browser session. Our OpenQuok chrome extension reads required session cookies, and OpenQuok stores the session encrypted for publishing.

<Callout type="danger">
<p>Anyone who can use your Skool session can post as you. Sign out of Skool when you are done, and review <DocsExternalLink href="https://www.skool.com/legal">Skool’s terms</DocsExternalLink> before you connect.</p>
</Callout>

<Callout type="warning">
<p>Cookie-based connect may conflict with platform rules. You accept that risk. OpenQuok does not guarantee access if Skool changes its site or APIs.</p>
</Callout>

## Prerequisites

1. <strong>Google Chrome</strong> (or a Chromium browser that supports the same extension APIs).
2. The <strong>OpenQuok browser extension</strong> installed — see <a href="/docs/installation/chrome-extension">Browser extension</a>.
3. <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> set on the web app you use for the dashboard.
4. An active login on <DocsExternalLink href="https://www.skool.com/">skool.com</DocsExternalLink> in the same browser profile.

## Connect Skool

<Steps
	howToName="Connect Skool to OpenQuok"
	howToDescription="Install the extension, sign in on Skool, and add the channel from the dashboard."
>

### Install and configure the extension

Follow <a href="/docs/installation/chrome-extension">Browser extension</a>. Confirm the extension ID matches your env.

### Sign in on Skool

Open Skool and sign in. The extension needs <Badge text="auth_token" variant="param" /> and <Badge text="client_id" variant="param" /> cookies for <Badge text=".skool.com" variant="param" />.

### Add the channel

In your workspace, open <Badge text="Add Channel" variant="new" /> → <strong>Skool</strong>. Read the browser-extension notice, then continue.

![Load Unpacked OpenQuok Chrome Extension](/docs/_assets//social-integration/skool/read-skool-notice.webp)


OpenQuok reads cookies, validates your account, and saves the channel.

### Allow automatic refresh

After a successful connect, OpenQuok registers a refresh token in the extension.

About every 24 hours the extension sends updated cookies so scheduled posts keep working. 

Disconnecting the channel removes that registration when you use <Badge text="Disconnect" variant="default" /> on the dashboard.

</Steps>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Browser extension connect | <strong>Add Channel</strong> → Skool while signed in on <DocsExternalLink href="https://www.skool.com/">skool.com</DocsExternalLink> in the same Chrome profile — see <a href="/docs/installation/chrome-extension">Browser extension</a> |
| Text posts | Plain text in the standard caption editor, up to <strong>5,000</strong> characters |
| Title and group | Required <strong>Title</strong> and <strong>Group</strong> in composer Settings — keys <Badge text="title" variant="param" /> / <Badge text="skool.title" variant="param" /> and <Badge text="group" variant="param" /> / <Badge text="skool.group" variant="param" /> |
| Post to groups | Publish to Skool groups you belong to; load options with the dashboard pickers or <Badge text="openquok integrations:trigger" variant="default" /> (<Badge text="groups" variant="default" />) |
| Labels | Optional label per group — <Badge text="label" variant="param" /> / <Badge text="skool.label" variant="param" /> or <Badge text="label" variant="default" /> tool with group id |
| Images | Attach images in the composer; OpenQuok uploads to Skool file storage at publish time (main post and follow-up rows) |
| Follow-up comments | Scheduled threaded comments after the main post, with per-reply <Badge text="delaySeconds" variant="param" /> and optional media when the group allows — see <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> |
| Automatic session refresh | After connect, the extension re-sends session cookies about every <strong>24 hours</strong> via <Badge text="POST /api/v1/integrations/extension-refresh" variant="path" /> so scheduled posts keep working |

Composer field reference: <a href="/docs/platforms/per-channel-settings">Per-channel settings</a>.

### Not supported

| Feature | Notes |
| --- | --- |
| OAuth connect | No operator Skool app or backend OAuth keys — extension session only |
| Public OAuth URL | <Badge text="GET /api/v1/public/social/skool" variant="path" /> returns <strong>400</strong>; connect in the dashboard |
| Invite links | OAuth redirect networks only — members add Skool from the dashboard themselves |
| Account analytics | No Skool workspace analytics in OpenQuok |
| Per-post analytics | No Skool post metrics in OpenQuok |
| Channel plugs | Auto-repost, auto-plug, and cross-account comment plugs are not available on <Badge text="skool" variant="param" /> |
| Skool native video | Publish path sends empty <Badge text="video_ids" variant="param" />; use image attachments instead |
| @-mention lookup | Plain caption only — no <Badge text="POST /integrations/mentions" variant="path" /> for Skool |

If the channel shows <Badge text="Refresh needed" variant="param" />, sign in on Skool again in Chrome, then <Badge text="Refresh connection" variant="default" /> and repeat the extension flow.

## How OpenQuok stores the session

OpenQuok encrypts the session cookie payload on the server (same integration token storage as other channels). The extension keeps only a signed refresh JWT locally to call <Badge text="POST /api/v1/integrations/extension-refresh" variant="path" /> with updated cookies. Details are in the <a href="/privacy-policy">Privacy Policy</a>.

## Related

<CardGrid>
<LinkCard title="Browser extension" description="Build, install, and VITE_OPENQUOK_BROWSER_EXTENSION_ID" href="/docs/installation/chrome-extension" />
<LinkCard title="Connect a channel" description="Browser extension tab and invite-link rules" href="/docs/channels/connect" />
<LinkCard title="Connect rules" description="Skool channel key and connect type" href="/docs/platforms/connect-rules" />
<LinkCard title="Per-channel settings" description="Composer Settings reference by network" href="/docs/platforms/per-channel-settings" />
</CardGrid>
