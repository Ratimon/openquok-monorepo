---
title: OpenQuok browser extension
description: Install the OpenQuok Chrome extension for cookie-session channels.
order: 8
lastUpdated: 2026-10-09
sidebar:
  label: Browser extension
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Some networks do not offer a public OAuth apps.

OpenQuok connects those channels through the <strong>OpenQuok Chrome browser extension</strong>.

The extension reads <strong>session cookies</strong> from the platform site only when you start connect in the dashboard. OpenQuok validates the session on the server and stores it encrypted.

<Callout type="note">
<p>Today the extension supports <strong>Skool</strong>. More cookie-session providers may register in the shared catalog later.</p>
</Callout>

<Callout type="warning">
<p>Session-based connect is not the same as official platform OAuth. You are responsible for complying with the platform you connect — including its terms of use. OpenQuok may change or remove an extension channel if the platform changes access.</p>
</Callout>

## Who needs this

| Audience | Action |
| --- | --- |
| <strong>Workspace members</strong> | Install the extension in Chrome, stay signed in on the platform, then use <Badge text="Add Channel" variant="new" /> in the dashboard. |
| <strong>Self-host operators</strong> | Build the extension, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> on the web app, and add your dashboard HTTPS origin to <Badge text="externally_connectable" variant="param" /> in the extension manifest. |

## Environment variables (web)

The dashboard sends messages to the extension with <Badge text="chrome.runtime.sendMessage" variant="default" />. Set the extension ID on the SvelteKit app:

| Variable | Purpose |
| --- | --- |
| <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> | Chrome extension ID from <strong>Extensions → Details</strong> (or the Chrome Web Store listing when published). |

Copy the key from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="path" /></DocsExternalLink> into <Badge text="web/.env.development.local" variant="envWeb" />. Restart the dev server after changes.

<Callout type="note">
<p>Extension channels do not need platform OAuth keys in your server config. The extension keeps your login up to date in the background while you stay signed in on the platform site. See <a href="/docs/channels/connect">Connect a channel</a> and our <a href="/privacy-policy">Privacy Policy</a>.</p>
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

### Sign in on the platform

Open the platform site in the <strong>same Chrome profile</strong> as the extension and sign in.

### Connect in the dashboard

In OpenQuok, choose <Badge text="Add Channel" variant="new" />. Read the browser-extension notice, then approve cookie access when prompted.

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
<LinkCard title="Connect a channel" description="OAuth, credentials, and browser extension flows" href="/docs/channels/connect" />
<LinkCard title="Connect rules" description="Channel keys and connect types by platform" href="/docs/platforms/connect-rules" />
<LinkCard title="Web configuration" description="VITE_* variables for the dashboard" href="/docs/configuration-web" />
</CardGrid>
