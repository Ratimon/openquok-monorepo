---
title: Configuration - Web
description: Environment variables and configuration for the SvelteKit app in web/.
order: 0
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, ExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **web** (Vite + SvelteKit) is configured from:

- <Badge text="web/.env.*" variant="envFile" /> environment files (Vite reads these at build/dev time)
- <ExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></ExternalLink> for PWA metadata

Any change to environment values requires restarting your dev server or rebuilding the web app so Vite can pick up the new settings.

## Common setup steps

<Steps>

### Configure your web env files

Copy <ExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="envFile" /></ExternalLink> to <Badge text="web/.env.development.local" variant="envFile" /> and fill in values (see the Environment variables guide below).

### Set production env values

Maintain <Badge text="web/.env.production.local" variant="envFile" /> and set matching production values for your deployment.

### Update PWA settings

Edit <ExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></ExternalLink> to customize PWA metadata (name/title/description/theme, and icon references).

</Steps>

## Guides

<CardGrid>
<LinkCard title="Environment variables" description="VITE_* values for API/Supabase/Stripe/analytics" href="/docs/configuration-web/environment" />
<LinkCard title="PWA configuration" description="Edit web-config.json for app name and icon metadata" href="/docs/configuration-web/pwa" />
</CardGrid>

For the full checklist, see the repository <ExternalLink href="https://github.com/Ratimon/openquok-monorepo#frontend-setup">README</ExternalLink> (**Frontend Setup**).

## Related Section(s)

<CardGrid>
<LinkCard title="Installation" description="Deploy and configure OpenQuok" href="/docs/Installation" />
<LinkCard title="Developer guidelines" description="Conventions for working in this repository" href="/docs/developer-guidelines" />
</CardGrid>
