---
title: OpenQuok browser extension
description: Install the OpenQuok Chrome extension for Skool session connect and directory launch form autofill.
order: 7
lastUpdated: 2026-10-22
sidebar:
  label: Browser extension
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The <strong>OpenQuok Chrome browser extension</strong> supports workflows that are not covered by platform OAuth or pasted API keys.

| Use | What the extension does |
| --- | --- |
| **Social posting — Skool** | When you connect in <Badge text="Add Channel" variant="new" />, it reads <strong>session cookies</strong> from skool.com so OpenQuok can schedule posts. The server validates the session and stores it encrypted. |
| **Directory launch** | When you <Badge text="Launch to directory" variant="new" /> from <a href="/account/products">My Products</a>, it opens the directory site and <strong>autofills</strong> mapped fields from your product profile. You review and submit on the directory yourself. |

<Callout type="note">
<p><strong>Skool</strong> is the only social channel that uses cookie-session connect today. <strong>PeerPush</strong>, <strong>Uneed</strong>, and future directory catalog rows use the same extension for autofill only — they do not add a posting integration or <Badge text="POST /public/posts" variant="path" /> target.</p>
</Callout>

<Callout type="warning">
<p>Session-based Skool connect is not official platform OAuth. For directory launch, you still comply with each directory’s terms when you publish. OpenQuok may change or remove an extension flow if a platform changes access.</p>
</Callout>

## Who needs this

| Audience | Action |
| --- | --- |
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

### Connect Skool (social posting)

Open <strong>skool.com</strong> in the <strong>same Chrome profile</strong> as the extension and sign in.

In OpenQuok, choose <Badge text="Add Channel" variant="new" /> → Skool. Read the browser-extension notice, then approve cookie access when prompted.

### Launch to a directory

On <a href="/account/products">My Products</a>, open or create a business profile, pick a directory card (for example PeerPush or Uneed), and choose <Badge text="Launch to directory" variant="new" />. The extension opens the site and fills fields from your profile; you submit on the directory site.

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
