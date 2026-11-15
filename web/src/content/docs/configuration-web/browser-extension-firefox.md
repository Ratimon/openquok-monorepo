---
title: Browser extension — Firefox (self-host)
description: Build the OpenQuok extension for Firefox, load it as a temporary add-on, and set the Firefox extension ID on the web app.
order: 0.57
lastUpdated: 2026-11-14
sidebar:
  label: Extension (Firefox)
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Firefox uses a **separate build** (<Badge text="extension/dist-firefox/" variant="path" />). The UI opens in the **sidebar** (not Chromium’s side panel). The dashboard talks to the extension through a **page <Badge text="postMessage" variant="param" /> bridge** on OpenQuok hosts — Firefox does not use <Badge text="externally_connectable" variant="param" />.

Gecko add-on id defaults to <Badge text="openquok@openquok.com" variant="path" /> in <Badge text="extension/manifest.firefox.json" variant="path" />. After AMO publish, add <Badge text="firefox:&lt;add-on-id&gt;" variant="envWeb" /> to <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_IDS" variant="envWeb" /> when the listing id differs.

<Callout type="note">
<p>Chromium (Chrome + Edge) docs: <a href="/docs/configuration-web/browser-extension-chrome">Extension (Chrome)</a> and <a href="/docs/configuration-web/browser-extension-edge">Extension (Edge)</a>.</p>
</Callout>

## Install from Firefox Add-ons (AMO)

After review, users install from addons.mozilla.org. Set production env and redeploy web:

```bash
VITE_OPENQUOK_BROWSER_EXTENSION_IDS=chromium:chrome-id,edge:edge-id,firefox:openquok@openquok.com
```

Use the ID AMO shows if it differs from <Badge text="openquok@openquok.com" variant="path" />.

## Temporary add-on (self-host dev)

Firefox does not keep a permanent “load unpacked” install like Chrome. For local testing, load a **temporary** add-on each session (or after every browser restart).

<Steps
	howToName="Load the OpenQuok extension in Firefox"
	howToDescription="Build the Firefox target and load dist-firefox as a temporary add-on."
>

### Build the Firefox package

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build:firefox
```

Output is in <Badge text="extension/dist-firefox/" variant="path" />.

### Load in Firefox

1. In the address bar, open <strong>about:debugging</strong> and press Enter.
2. In the <strong>left sidebar</strong>, click <strong>This Firefox</strong> (not <strong>Setup</strong>). Setup only shows USB/network debug options — it does not load extensions.
3. On the <strong>This Firefox</strong> page, click <strong>Load Temporary Add-on…</strong> (near the top of the main panel).
4. In the file picker, choose <Badge text="extension/dist-firefox/manifest.json" variant="path" /> from your monorepo clone.

<Callout type="note">
<p>Shortcut: open <strong>about:debugging#/runtime/this-firefox</strong> to land on <strong>This Firefox</strong> directly.</p>
</Callout>

After you rebuild, click <strong>Reload</strong> on the add-on row in <strong>about:debugging</strong>. Quitting Firefox removes the temporary add-on — load it again on the next session.

### Wire the web app

The dashboard resolves extension messaging through the **dashboard content script** bridge on your OpenQuok origin. For production multi-browser maps, include Firefox:

```bash
# VITE_OPENQUOK_BROWSER_EXTENSION_IDS=chromium:…,edge:…,firefox:openquok@openquok.com
```

Restart the web dev server when env changes. Sign in on your dashboard in the **same Firefox profile** as the add-on, then open the OpenQuok **sidebar**.

### Use the sidebar

Click the OpenQuok toolbar icon (or open from the context menu on <strong>Schedule with OpenQuok</strong>). **Social** and **Directory** match the Chromium feature set with sidebar UI.

### Optional AMO zip

```bash
pnpm --filter @openquok/browser-extension zip:firefox
```

Writes <Badge text="extension/openquok-browser-extension-firefox.zip" variant="path" /> for Mozilla submission.

</Steps>

## Self-host dashboard origin

Ensure your dashboard HTTPS origin is covered by <Badge text="host_permissions" variant="param" /> and the dashboard <Badge text="content_scripts" variant="param" /> matches in <Badge text="extension/manifest.json" variant="path" /> (merged with <Badge text="manifest.firefox.json" variant="path" /> on Firefox builds). Rebuild <Badge text="dist-firefox/" variant="path" /> after manifest edits.

Directory launch handoff from the web app must reach the extension via the **page runtime bridge** — verify on Firefox after any bridge or manifest change.

## Related

<CardGrid>
<LinkCard title="Extension (Chrome)" description="Build for Google Chrome, store install or load from source" href="/docs/configuration-web/browser-extension-chrome" />
<LinkCard title="Extension (Edge)" description="Build for Microsoft Edge; use the same package as Chrome" href="/docs/configuration-web/browser-extension-edge" />
<LinkCard title="Browser extension (product)" description="Context menu, Humanizer, checklists" href="/docs/installation/chrome-extension" />
<LinkCard title="Configuration - Web" description="Extension ID environment variables" href="/docs/configuration-web" />
</CardGrid>