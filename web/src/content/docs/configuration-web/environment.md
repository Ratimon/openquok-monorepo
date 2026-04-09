---
title: Environment variables
description: Configure VITE's values for API base URL, Supabase, Stripe, and analytics for Openquok.
order: 1
lastUpdated: 2026-04-01
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
<p>Set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the <strong>exact</strong> origin you use to open the web app, including the scheme (<code>http</code> vs <code>https</code>).</p>
<p>For OAuth-based integrations, keep it consistent with the backend’s <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />. If you move the web dev server from HTTP to HTTPS (or vice versa), update both so redirect URIs and in-app links keep working.</p>
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

For deployment, ensure <Badge text="web/.env.production.local" variant="envFile" /> (or equivalent secret injection) contains the same key names with production values.

</Steps>

<Callout type="note" title="Tip: keep secrets in env files">
Do not hard-code secrets in the source code. Use <Badge text="web/.env.development.local" variant="envFile" /> (and production equivalents) for secrets; commit only templates such as <Badge text="web/.env.development.example" variant="envFile" />.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="PWA configuration" description="Edit web-config.json for app name and icon metadata" href="/docs/configuration-web/pwa" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>

