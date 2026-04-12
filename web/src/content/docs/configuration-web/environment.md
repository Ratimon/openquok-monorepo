---
title: Environment variables
description: Configure VITE's values for API base URL, Supabase, Stripe, and analytics for Openquok.
order: 1
lastUpdated: 2026-04-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

At runtime, the web app uses Vite environment variables in the <Badge text="VITE_*" variant="envWeb" /> family (public keys exposed to the browser).

When you change values in <Badge text="web/.env.development.local" variant="envFile" /> or <Badge text="web/.env.production.local" variant="envFile" />, restart the web dev server or rebuild so Vite can load the new values.

## Steps

<Steps>

### Copy the development env template

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/.env.development.example"><Badge text="web/.env.development.example" variant="envFile" /></DocsExternalLink> to <Badge text="web/.env.development.local" variant="envFile" />.

### Set required variables

Set these in <Badge text="web/.env.development.local" variant="envFile" /> (values from your backend, Supabase, Stripe, and analytics setup):

```bash
VITE_API_BASE_URL=
VITE_FRONTEND_DOMAIN_URL=
VITE_PUBLIC_SUPABASE_URL=
VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY=
VITE_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID=
```

<Callout type="note" title="VITE_FRONTEND_DOMAIN_URL should match the URL you visit">
<p>Set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the <strong>exact</strong> origin you use to open the web app: scheme (<code>http</code> vs <code>https</code>) and hostname. Treat <code>www</code> and the apex host as different origins—for example <code>https://www.example.com</code> and <code>https://example.com</code> are not interchangeable for OAuth.</p>
<p>In <strong>production</strong>, set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the <strong>same</strong> string as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on the backend (see <a href="/docs/configuration-backend">Configuration - Backend</a> and <a href="/docs/Installation/production-deployment">Production deployment</a>). The backend builds provider redirect URIs from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> only; Meta and similar dashboards must list those full URLs character-for-character.</p>
<p>Do not add a trailing slash after the host. If you change either variable, rebuild the web app and restart or redeploy the API so both pick up the new origin.</p>
</Callout>

Stripe price IDs for your plans:

```bash
VITE_PUBLIC_STRIPE_PRICE_ID_LITE_PLAN=
VITE_PUBLIC_STRIPE_PRICE_ID_BASIC_PLAN=
VITE_PUBLIC_STRIPE_PRICE_ID_STARTER_PACK=
VITE_PUBLIC_STRIPE_PRICE_ID_GROWTH_PACK=
VITE_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL_PACK=
VITE_PUBLIC_STRIPE_PRICE_ID_PAGE_1_YEAR_PACK=
VITE_PUBLIC_STRIPE_PRICE_ID_PAGE_LIFETIME_PACK=
```

### Set production env values

For deployment, ensure <Badge text="web/.env.production.local" variant="envFile" /> (or your host’s production env) sets the same key names with production values. Double-check <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> against <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on the API before you register OAuth redirect URIs in external dashboards.

</Steps>

<Callout type="note" title="Tip: keep secrets in env files">
Do not hard-code secrets in the source code. Use <Badge text="web/.env.development.local" variant="envFile" /> (and production equivalents) for secrets; commit only templates such as <Badge text="web/.env.development.example" variant="envFile" />.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Production deployment" description="Canonical FRONTEND_DOMAIN_URL, CORS, and redeploy notes" href="/docs/Installation/production-deployment" />
<LinkCard title="Configuration - Backend" description="FRONTEND_DOMAIN_URL and OAuth redirect construction" href="/docs/configuration-backend" />
<LinkCard title="PWA configuration" description="Edit web-config.json for app name and icon metadata" href="/docs/configuration-web/pwa" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>

