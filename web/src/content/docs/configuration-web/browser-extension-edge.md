---
title: Browser extension — Edge (self-host)
description: Build the OpenQuok extension for Microsoft Edge, load it from your clone, and set the Edge extension ID on the web app.
order: 0.56
lastUpdated: 2026-11-14
sidebar:
  label: Extension (Edge)
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**Microsoft Edge** ships the **same Chromium MV3 package** as Chrome (<Badge text="extension/dist/" variant="path" /> and <Badge text="openquok-browser-extension.zip" variant="path" />). Edge assigns a **different extension ID (CRX ID)** than Chrome after you publish to Edge Add-ons. Add <Badge text="edge:&lt;crx-id&gt;" variant="envWeb" /> to <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" /> on the web app so the dashboard can ping the Edge install.

<Callout type="note">
<p>Build and manifest steps match <a href="/docs/configuration-web/browser-extension-chrome">Extension (Chrome)</a>. This page covers Edge-specific load, IDs, and verification.</p>
</Callout>

## Install from Edge Add-ons

After your listing is public, users install from the Microsoft Edge Add-ons store. Copy the **CRX ID** from <strong>edge://extensions</strong> → extension **Details** and set production env:

```bash
VITE_OPENQUOK_BROWSER_EXTENSION_IDS=chromium:YOUR_CHROME_WEB_STORE_ID,edge:YOUR_EDGE_CRX_ID
```

Redeploy the web app after you change extension IDs.

## Load unpacked (self-host)

<Steps
	howToName="Load the OpenQuok browser extension in Edge"
	howToDescription="Build the Chromium extension and load it unpacked in Microsoft Edge for development or self-host."
>

### Build the package

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in <Badge text="extension/dist/" variant="path" />.

### Load in Edge

Open <strong>edge://extensions</strong>, turn on <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select <Badge text="extension/dist/" variant="path" />. The folder must contain <Badge text="manifest.json" variant="path" /> at its root.

<Callout type="warning">
<p>Unpacked Edge builds get a <strong>developer</strong> ID that differs from the published Edge Add-ons CRX ID. For local dashboard dev, set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> to the ID shown on <strong>edge://extensions</strong>. For production multi-store, use the published <Badge text="edge:" variant="envWeb" /> CRX ID after review.</p>
</Callout>

### Wire the web app

Use the unpacked ID for local testing, or the store CRX ID for production:

```bash
VITE_OPENQUOK_BROWSER_EXTENSION_ID=edge-unpacked-id-for-local-dev

# Production (example shape — use your real IDs)
# VITE_OPENQUOK_BROWSER_EXTENSION_IDS=chromium:chrome-store-id,edge:edge-crx-id
```

Keep a signed-in dashboard tab in the **same Edge profile** as the extension. On <Badge text="https://localhost:5173" variant="path" />, use self-host sign-in in the side panel and tap <strong>Refresh</strong>.

### Open the side panel

Pin OpenQuok on the toolbar. **Social** and **Directory** tabs behave the same as on Chrome. Context menu items <strong>Schedule with OpenQuok</strong> and <strong>Humanize selection with OpenQuok</strong> work on any page.

### Optional store zip

```bash
pnpm --filter @openquok/browser-extension zip
```

Upload <Badge text="extension/openquok-browser-extension.zip" variant="path" /> to Partner Center (same file as Chrome Web Store).

</Steps>

## Self-host dashboard origin

Same as Chromium: update <Badge text="externally_connectable.matches" variant="param" /> in <Badge text="extension/manifest.json" variant="path" /> for custom dashboard HTTPS origins, then rebuild and redistribute.

## Related

<CardGrid>
<LinkCard title="Extension (Chrome)" description="Build for Google Chrome, store install or load from source" href="/docs/configuration-web/browser-extension-chrome" />
<LinkCard title="Extension (Firefox)" description="Build for Firefox; load a temporary add-on for testing" href="/docs/configuration-web/browser-extension-firefox" />
<LinkCard title="Browser extension (product)" description="Features and verification checklists" href="/docs/installation/chrome-extension" />
<LinkCard title="Configuration - Web" description="Browser extension ID env vars" href="/docs/configuration-web" />
</CardGrid>