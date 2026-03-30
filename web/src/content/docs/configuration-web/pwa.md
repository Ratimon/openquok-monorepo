---
title: PWA configuration
description: Configure app name/title/description and icon metadata in web-config.json.
order: 2
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, ExternalLink, LinkCard, Steps, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The PWA metadata is configured in <ExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></ExternalLink>.

## Steps

<Steps>

### Edit `web-config.json`

Update <code>appName</code>, <code>appTitle</code>, <code>appDescription</code>, <code>themeColor</code>, and your icon paths (e.g. <code>static/icon.svg</code>) in the JSON file.

If you keep the icon references consistent with the files in `web/`, the PWA install experience will work without extra changes.

### Restart / rebuild

Restart the web dev server or rebuild the web app so the updated PWA metadata is bundled.

</Steps>

## Example

```json
{
  "appName": "Openquok",
  "appTitle": "Openquok",
  "appDescription": "An agentic Social Scheduler Tool",
  "themeColor": "#34A7D6",
  "appleStatusBarStyle": "black-translucent",
  "icon": "static/icon.svg",
  "maskableIcons": [
    {
      "src": "../maskable_icon_512x512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ]
}
```

<Callout type="note" title="Icons are path-sensitive">
Icon paths in `web-config.json` are resolved relative to the web project layout, so update them together if you move assets.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Environment variables" description="VITE_* values for API/Supabase/Stripe/analytics" href="/docs/configuration-web/environment" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>

