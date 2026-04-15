---
title: Environment variables
description: Configure VITE's values for API base URL, Supabase, Stripe, and analytics for Openquok.
order: 1
lastUpdated: 2026-04-14
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

<Callout type="note">
<p>Treat <code>www</code> and the apex host as different origins—for example <code>https://www.example.com</code> and <code>https://example.com</code> are not interchangeable for OAuth.</p>
<p>In <strong>production</strong>, set <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the <strong>same</strong> string as <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on the backend (see <a href="/docs/configuration-backend">Configuration - Backend</a> and <a href="/docs/Installation/production-deployment">Production deployment</a>). The backend builds provider redirect URIs from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> only; Meta and similar dashboards must list those full URLs character-for-character.</p>
<p>Do not add a trailing slash after the host. If you change either variable, rebuild the web app and restart or redeploy the API so both pick up the new origin.</p>
</Callout>

### HTTPS local development and the API base URL

The web dev server in this repo uses <strong>HTTPS</strong> on <code>https://localhost:5173</code> (local certificates under <Badge text="web/.cert/" variant="path" />). Session cookies for sign-in must be issued on the <strong>same site</strong> as the page origin, so the browser should call the API as <strong>same-origin</strong> <code>/api/...</code> in development, not a separate <code>http://localhost:3000</code> origin.

<Callout type="warning">
<p>Do not point VITE_API_BASE_URL at http://localhost:3000 when the app runs on HTTPS. If <Badge text="VITE_API_BASE_URL" variant="envWeb" /> is set to <code>http://localhost:3000</code> while you open the app on <code>https://localhost:5173</code>, the scheme differs and the browser treats that as a different site: refresh cookies may not be sent and Google sign-in can loop or fail.</p>
<p>For local HTTPS, <strong>omit</strong> <Badge text="VITE_API_BASE_URL" variant="envWeb" /> from <Badge text="web/.env.development.local" variant="envFile" /> (or set it to an empty value). The web app then uses a relative API base so requests go to <code>https://localhost:5173/api/...</code>.</p>
</Callout>

In development, <Badge text="web/src/hooks.server.ts" variant="path" /> forwards <code>/api/*</code> to the process listening on <code>http://localhost:3000</code> (see <Badge text="web/vite.config.ts" variant="path" /> for the same target). Optional override: set <code>DEV_BACKEND_PROXY_TARGET</code> in <Badge text="web/.env.development.local" variant="envFile" /> if the API is not on port 3000.


### Set production env values

For deployment, ensure <Badge text="web/.env.production.local" variant="envFile" /> (or your host’s production env) sets the same key names with production values. Double-check <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> against <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> on the API before you register OAuth redirect URIs in external dashboards.

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

