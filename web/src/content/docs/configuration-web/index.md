---
title: Configuration - Web
description: Getting Started to Environment variables and configuration for the Openquok's in web application.
order: 0
lastUpdated: 2026-05-08
---

<script>
import { Badge, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **web** (Vite + SvelteKit) is configured from:

- <Badge text="web/.env.*" variant="envFile" /> environment files
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></DocsExternalLink> for PWA metadata

Any change to environment values requires restarting your dev server or rebuilding the web app so Vite can pick up the new settings. Local HTTPS and how <Badge text="VITE_API_BASE_URL" variant="envWeb" /> interacts with the dev proxy are documented under <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit env)</a>.

## Common setup steps

<Steps>

### Configure your web env files

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="envFile" /></DocsExternalLink> to <Badge text="web/.env.development.local" variant="envFile" /> and fill in values (see the Vite env guide below).

### Set production env values

Maintain <Badge text="web/.env.production.local" variant="envFile" /> and set matching production values for your deployment. Set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the same canonical origin as the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> so OAuth redirect URIs stay consistent (see <a href="/docs/configuration-web/vite">Vite (SvelteKit env)</a> and <a href="/docs/installation/production-deployment">Production deployment</a>).

### Update PWA settings

Edit <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/web-config.json"><Badge text="web/src/web-config.json" variant="path" /></DocsExternalLink> to customize PWA metadata (name/title/description/theme, and icon references).

</Steps>

## Guides

<CardGrid>
<LinkCard title="Vite (SvelteKit env)" description="VITE_* variables, HTTPS dev server, and API proxy" href="/docs/configuration-web/vite" />
<LinkCard title="SEO & marketing defaults" description="Meta tags, keywords, and social links (CONFIG_SCHEMA_MARKETING)" href="/docs/configuration-web/seo" />
<LinkCard title="Config defaults" description="Backend URL, company, landing, and navigation schema defaults" href="/docs/configuration-web/config-defaults" />
<LinkCard title="PWA configuration" description="Edit web-config.json for app name and icon metadata" href="/docs/configuration-web/pwa" />
</CardGrid>

For the full checklist, see the repository <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo#frontend-setup">README</DocsExternalLink> (**Frontend Setup**).

## Related Section(s)

<CardGrid>
<LinkCard title="Production deployment" description="Canonical origins, CORS, and redeploying API + web" href="/docs/installation/production-deployment" />
<LinkCard title="Installation" description="Deploy and configure OpenQuok" href="/docs/installation" />
<LinkCard title="Developer guidelines" description="Conventions for working in this repository" href="/docs/developer-guidelines" />
</CardGrid>
