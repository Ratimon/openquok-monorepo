---
title: OpenQuok browser extension
description: Install the OpenQuok Chrome extension for Skool connect, side-panel social scheduling, directory autofill, and context-menu drafts.
order: 7
lastUpdated: 2026-10-25
sidebar:
  label: Browser extension
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The <strong>OpenQuok Chrome browser extension</strong> supports workflows that are not covered by platform OAuth or pasted API keys.

| Use | What the extension does |
| --- | --- |
| **Social scheduling** | Open the <strong>side panel</strong> (<strong>Social</strong> tab), sign in with your OpenQuok dashboard session, pick connected channels, and <strong>schedule</strong> or <strong>draft</strong> posts via <Badge text="POST /api/v1/posts" variant="path" />. Publishing runs on OpenQuok servers. Connect OAuth and credential channels only in the dashboard — the extension does not replace <Badge text="Add Channel" variant="new" />. |
| **Social posting — Skool** | When you connect in <Badge text="Add Channel" variant="new" />, it reads <strong>session cookies</strong> from skool.com so OpenQuok can schedule posts. The server validates the session and stores it encrypted. |
| **Directory launch** | When you <Badge text="Launch to directory" variant="new" /> from <a href="/account/products">My Products</a>, it opens the directory site and <strong>autofills</strong> mapped fields from your product profile. You review and submit on the directory yourself. Use the side panel <strong>Directory</strong> tab for fill actions on the active tab. |

On supported directory hosts (today <strong>PeerPush</strong> and <strong>Uneed</strong>), the extension may show a <strong>yellow banner</strong> fixed at the top of the page when you are not signed in. It checks your OpenQuok dashboard session first, then whether you are logged into that directory site. Use <strong>Go to Login</strong> on the banner to open <a href="/sign-in">sign in</a> on your OpenQuok origin (the same host you use for the dashboard, including self-host) or the directory’s login page. When both sessions are active, the banner hides and autofill from the step rail works as usual. See <a href="/docs/directory-submission">Directory submission</a> for the full My Products → launch workflow.

<Callout type="note">
<p><strong>Skool</strong> is the only social channel that uses cookie-session connect today. <strong>PeerPush</strong>, <strong>Uneed</strong>, and future directory catalog rows use the same extension for autofill only — they do not add a posting integration or <Badge text="POST /public/posts" variant="path" /> target.</p>
</Callout>

<Callout type="warning">
<p>Session-based Skool connect is not official platform OAuth. For directory launch, you still comply with each directory’s terms when you publish. OpenQuok may change or remove an extension flow if a platform changes access.</p>
</Callout>

## Side panel (Social and Directory)

The primary UI is the Chrome <strong>side panel</strong> (<Badge text="sidepanel.html" variant="path" />). Click the <strong>OpenQuok</strong> toolbar icon to open it, or use a context-menu action below (which also opens the panel on the <strong>Social</strong> tab).

| Tab | Purpose |
| --- | --- |
| <strong>Social</strong> | Unsigned: <strong>Connect to OpenQuok.com</strong> or <strong>Connect to self host</strong> (URL field, default <Badge text="https://localhost:5173" variant="path" /> for Vite dev — bare <Badge text="5173" variant="path" /> or <Badge text="localhost:5173" variant="path" /> autofill to that origin on blur). Keep a signed-in dashboard tab open on that origin — the extension reads your session from that tab (httpOnly cookies). Signed in: multi-select connected channels, a short composer, <strong>Publish now</strong> / <strong>Schedule</strong> / <strong>Draft</strong>, and <strong>Open full composer</strong> for the dashboard editor. |
| <strong>Directory</strong> | Session checks, profile handoff status, and <strong>Fill</strong> actions for PeerPush and Uneed on the active tab. |

On open, the Social tab reads any <strong>context-menu draft</strong> stored for this browser session and merges it into the composer body (or media URL for images).

<Callout type="note">
<p><strong>Local dev (<Badge text="https://localhost:5173" variant="path" />):</strong> Sign in on your Vite dashboard, keep that tab focused in the window where you open the side panel, then tap <strong>Refresh</strong>. The footer shows which <strong>Environment</strong> origin the composer uses (local Vite proxies <Badge text="/api" variant="path" /> — it does not reuse production <Badge text="api.*" variant="path" /> hosts). If you still see production channels, you are still on a production session; sign out on <Badge text="www.openquok.com" variant="path" /> or use a separate Chrome profile for dev.</p>
</Callout>

## Context menu

On any site, right-click to share into OpenQuok:

| Menu item | When it appears | Draft |
| --- | --- | --- |
| <strong>Schedule with OpenQuok</strong> | Selected text | Body = selection |
| <strong>Schedule with OpenQuok</strong> | Page background | Body = page title + URL |
| <strong>Schedule with OpenQuok</strong> | Image | Media URL + page title in body |

The extension saves the draft, opens the side panel on the <strong>Social</strong> tab, and focuses the composer. It does not inject a composer into arbitrary websites — only directory hosts run autofill content scripts.

<Callout type="note">
<p>Publishing still uses your OpenQuok session API (<Badge text="POST /api/v1/posts" variant="path" />). <strong>In-browser send</strong> from a live platform tab is planned for cookie-session channels but is not available in the current build.</p>
</Callout>

## Who needs this

| Audience | Action |
| --- | --- |
| <strong>Workspace members (social scheduling)</strong> | Install the extension, open the side panel <strong>Social</strong> tab, sign in to OpenQuok, and schedule to channels you already connected in the dashboard. |
| <strong>Workspace members (Skool)</strong> | Install the extension in Chrome, stay signed in on Skool, then use <Badge text="Add Channel" variant="new" /> in the dashboard. |
| <strong>Workspace members (directory)</strong> | Install the extension, complete a product profile on My Products, then launch to PeerPush, Uneed, or another supported directory. See <a href="/docs/directory-submission">Directory submission</a>. |
| <strong>Self-host operators</strong> | Build the extension, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> on the web app, and add your dashboard HTTPS origin to <Badge text="externally_connectable" variant="param" /> in the extension manifest. |

## Environment variables (web)

The dashboard sends messages to the extension with <Badge text="chrome.runtime.sendMessage" variant="default" />. Set the extension ID on the SvelteKit app:

| Variable | Purpose |
| --- | --- |
| <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> | Chrome extension ID from <strong>Extensions → Details</strong> (or the Chrome Web Store listing when published). |

Copy the key from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="path" /></DocsExternalLink> into <Badge text="web/.env.development.local" variant="envWeb" />. Restart the dev server after changes.

<Callout type="note">
<p>Extension-based Skool connect does not need platform OAuth keys in your server config. The extension can refresh Skool cookies in the background while you stay signed in. Directory autofill reads profile data from OpenQuok over the same dashboard ↔ extension channel. See <a href="/docs/channels/connect">Connect a channel</a> and our <a href="/privacy-policy">Privacy Policy</a>.</p>
</Callout>

## Install from source (unpacked)

<Steps
	howToName="Load the OpenQuok browser extension in Chrome"
	howToDescription="Build the extension package from the monorepo and load it unpacked for development or self-host."
>

### Build the package

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in <Badge text="extension/dist/" variant="path" />.

### Load in Chrome

Open <strong>chrome://extensions</strong>, enable <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select <Badge text="extension/dist" variant="path" />.

![Load Unpacked OpenQuok Chrome Extension](/docs/_assets/installation/local-extension.webp)

Copy the <strong>ID</strong> shown on the extension card into <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> for your web deployment.

### Open the side panel

Pin the extension, then click the <strong>OpenQuok</strong> icon to open the side panel. Use <strong>Social</strong> to connect your dashboard session and schedule, or <strong>Directory</strong> after a launch from My Products.

### Connect Skool (social posting)

Open <strong>skool.com</strong> in the <strong>same Chrome profile</strong> as the extension and sign in.

In OpenQuok, choose <Badge text="Add Channel" variant="new" /> → Skool. Read the browser-extension notice, then approve cookie access when prompted.

### Launch to a directory

On <a href="/account/products">My Products</a>, open or create a business profile, pick a directory card (for example PeerPush or Uneed), and choose <Badge text="Launch to directory" variant="new" />. The extension opens the site and fills fields from your profile; you submit on the directory site.

If you browse a supported directory without an OpenQuok session, sign in at <a href="/sign-in">sign in</a> first (or use the banner’s <strong>Go to Login</strong>). You may also need an account on the directory itself before <strong>Fill</strong> actions are enabled.

</Steps>

Optional zip for manual distribution:

```bash
pnpm --filter @openquok/browser-extension zip
```

## Self-host dashboard origin

The extension only accepts messages from origins listed in <Badge text="manifest.json" variant="path" /> → <Badge text="externally_connectable.matches" variant="param" />. Defaults include local dev and <Badge text="https://*.openquok.com/*" variant="path" />.

If your workspace runs on another HTTPS host, add that origin to the manifest, rebuild, and redistribute the extension to your users.

## Related

<CardGrid>
<LinkCard title="Skool" description="Connect Skool with the extension and compose settings" href="/docs/social-integration/skool" />
<LinkCard title="Directory submission" description="My Products workflow and extension handoff" href="/docs/directory-submission" />
<LinkCard title="Connect rules" description="Channel keys, directory site keys, and connect types" href="/docs/platforms/connect-rules" />
<LinkCard title="Connect a channel" description="OAuth, credentials, and browser extension flows" href="/docs/channels/connect" />
<LinkCard title="Web configuration" description="VITE_* variables for the dashboard" href="/docs/configuration-web" />
</CardGrid>

