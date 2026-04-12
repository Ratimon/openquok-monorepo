---
title: Configuration - Web
description: Environment variables and configuration for the Openquok's SvelteKit app in web/.
order: 0
lastUpdated: 2026-04-12
---

<script>
import { Badge, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **web** (Vite + SvelteKit) is configured from:

- <Badge text="web/.env.*" variant="envFile" /> environment files (Vite reads these at build/dev time)
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></DocsExternalLink> for PWA metadata

Any change to environment values requires restarting your dev server or rebuilding the web app so Vite can pick up the new settings.

## Common setup steps

<Steps>

### Configure your web env files

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="envFile" /></DocsExternalLink> to <Badge text="web/.env.development.local" variant="envFile" /> and fill in values (see the Environment variables guide below).

### Set production env values

Maintain <Badge text="web/.env.production.local" variant="envFile" /> and set matching production values for your deployment. Set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the same canonical origin as the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> so OAuth redirect URIs stay consistent (see <a href="/docs/configuration-web/environment">Environment variables</a> and <a href="/docs/Installation/production-deployment">Production deployment</a>).

### Update PWA settings

Edit <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></DocsExternalLink> to customize PWA metadata (name/title/description/theme, and icon references).

</Steps>

## Guides

<CardGrid>
<LinkCard title="Environment variables" description="VITE_* values for API/Supabase/Stripe/analytics" href="/docs/configuration-web/environment" />
<LinkCard title="Config defaults (CONFIG_SCHEMA_*)" description="How the web app derives defaults from Vite env and fallbacks" href="/docs/configuration-web/config-defaults" />
<LinkCard title="PWA configuration" description="Edit web-config.json for app name and icon metadata" href="/docs/configuration-web/pwa" />
</CardGrid>

For the full checklist, see the repository <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo#frontend-setup">README</DocsExternalLink> (**Frontend Setup**).

## Related Section(s)

<CardGrid>
<LinkCard title="Production deployment" description="Canonical origins, CORS, and redeploying API + web" href="/docs/Installation/production-deployment" />
<LinkCard title="Installation" description="Deploy and configure OpenQuok" href="/docs/Installation" />
<LinkCard title="Developer guidelines" description="Conventions for working in this repository" href="/docs/developer-guidelines" />
</CardGrid>
