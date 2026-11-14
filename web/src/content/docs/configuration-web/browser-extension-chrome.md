---
title: Browser extension — Chrome (self-host)
description: Build the OpenQuok extension for Google Chrome, load it from your clone, and connect it to your self-hosted dashboard.
order: 0.55
lastUpdated: 2026-11-14
sidebar:
  label: Extension (Chrome)
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

const chromeWebStoreHref = getPublicBrowserExtensionChromeStoreCtaHref();
const chromeWebStoreLinkLabel = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL;
</script>

## Overview

Self-host operators build the **Chromium** package (<Badge text="extension/dist/" variant="path" />) and load it unpacked in **Google Chrome**, or ship the same zip to the Chrome Web Store. The dashboard reaches the extension with <Badge text="chrome.runtime.sendMessage" variant="param" /> when you set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> or <Badge text="chromium:…" variant="envWeb" /> in <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" />.

<Callout type="note">
<p><strong>Microsoft Edge</strong> uses the same build — see <a href="/docs/configuration-web/browser-extension-edge">Extension (Edge)</a>. <strong>Firefox</strong> uses a separate <Badge text="dist-firefox/" variant="path" /> build — see <a href="/docs/configuration-web/browser-extension-firefox">Extension (Firefox)</a>.</p>
</Callout>

## Install from Chrome Web Store

<p>For end users on Google Chrome, install from the store:</p>

<p><DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink></p>

<p>After install, pin the toolbar icon. Production OpenQuok already sets the store extension ID. Self-hosters must copy the ID from <strong>chrome://extensions</strong> into <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> when users run an unpacked or custom build.</p>

## Load unpacked (self-host)

<Steps
	howToName="Load the OpenQuok browser extension in Chrome"
	howToDescription="Build the extension from the monorepo and load it unpacked for development or self-host."
>

### Build the package

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in <Badge text="extension/dist/" variant="path" />.

### Load in Chrome

Open <strong>chrome://extensions</strong>, turn on <strong>Developer mode</strong>, click <strong>Load unpacked</strong>, and select the <strong>dist</strong> folder (for example <Badge text="openquok-monorepo/extension/dist" variant="path" />). The folder must contain <Badge text="manifest.json" variant="path" /> at its root — not <Badge text="extension/" variant="path" /> alone.

<Callout type="warning">
<p>The Web Store build and an unpacked build have <strong>different</strong> extension IDs. Set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> (or <Badge text="chromium:" variant="envWeb" /> in <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" />) to the ID your users actually install.</p>
</Callout>

![Load Unpacked OpenQuok Chrome Extension](/docs/_assets/installation/local-extension.webp)

Copy the <strong>ID</strong> from the extension card into <Badge text="web/.env.development.local" variant="envWeb" /> or <Badge text="web/.env.production.local" variant="envWeb" />, then restart or rebuild the web app.

### Wire the web app

```bash
# Single ID (typical for one Chrome build)
VITE_OPENQUOK_BROWSER_EXTENSION_ID=your-unpacked-or-store-id

# Or multi-store map (include edge / firefox when you ship them)
# VITE_OPENQUOK_BROWSER_EXTENSION_IDS=chromium:your-chrome-id,edge:your-edge-id
```

See <a href="/docs/configuration-web#browser-extension-ids">Browser extension IDs</a> on the configuration overview.

### Open the side panel

Pin the extension and click <strong>OpenQuok</strong>. Use <strong>Social</strong> to sign in and schedule, or <strong>Directory</strong> after a launch from My Products.

### Connect Skool (social posting)

Open <strong>skool.com</strong> in the <strong>same Chrome profile</strong> as the extension and sign in.

In OpenQuok, choose <Badge text="Add Channel" variant="new" /> → Skool. Read the notice, then approve cookie access when prompted.

### Launch to a directory

<p>Start from <a href="/account/products">My Products</a> with <Badge text="Launch to directory" variant="new" />, or open the side panel <strong>Directory</strong> tab and click a directory avatar. OpenQuok opens the site and autofills fields.</p>

<p>Check values on the directory site. Click its submit or pay button yourself. Sign in at <a href="/sign-in">sign in</a> when the panel or banner asks.</p>

![Submit on the directory site](/docs/_assets/directory-submission/submit-on-directory.webp)

</Steps>

### Optional store zip

Same artifact as Chrome Web Store and Edge Add-ons:

```bash
pnpm --filter @openquok/browser-extension zip
```

Writes <Badge text="extension/openquok-browser-extension.zip" variant="path" />.

## Self-host dashboard origin

The extension accepts external messages only from URLs in <Badge text="extension/manifest.json" variant="path" /> → <Badge text="externally_connectable.matches" variant="param" />. Defaults include local dev and <Badge text="https://*.openquok.com/*" variant="path" />.

If your dashboard runs on another HTTPS host, add that origin to <Badge text="externally_connectable.matches" variant="param" />, rebuild <Badge text="extension/dist/" variant="path" />, and distribute the new build to users.

## Related

<CardGrid>
<LinkCard title="Browser extension (product)" description="Side panel, context menu, Skool, directories" href="/docs/installation/chrome-extension" />
<LinkCard title="Extension (Edge)" description="Build for Microsoft Edge; use the same package as Chrome" href="/docs/configuration-web/browser-extension-edge" />
<LinkCard title="Extension (Firefox)" description="Build for Firefox; separate package and store upload" href="/docs/configuration-web/browser-extension-firefox" />
<LinkCard title="Configuration - Web" description="VITE_* and extension ID overview" href="/docs/configuration-web" />
</CardGrid>