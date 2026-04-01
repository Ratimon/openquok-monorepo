---
title: Configuration - Backend
description: OpenQuok backend configuration — env vars, Supabase, and services for the social scheduler.
order: 0
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The **backend** reads its runtime settings from **environment variables**, and you also configure your **Supabase** project in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> (database, authentication, API keys, and related project settings). **Any change** to environment variables requires **restarting** the backend process so the new values are loaded.

An example file with the most commonly used settings is checked in at <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink>. Copy it to <Badge text="backend/.env.development.local" variant="envFile" /> under <Badge text="backend/" variant="path" /> (the example header explains load order and how it relates to <Badge text="backend/.env" variant="path" />). Use that local file for secrets and overrides you do not commit.

For **production**, follow the same naming convention: maintain <Badge text="backend/.env.production.local" variant="envFile" /> (or inject the same keys from your host’s secret store). In local development, keep <Badge text="NODE_ENV" variant="envRuntime" /> set to **development**; for deployment, use **production**.

```bash
NODE_ENV=development
FRONTEND_DOMAIN_URL=http://localhost:5173
```

## Common setup steps

<Steps>

### Start with the example env file

Copy <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink> to <Badge text="backend/.env.development.local" variant="envFile" /> and fill in values. Restart the backend after changes.

### Configure Supabase in the dashboard

Create a Supabase project, then collect the URL + keys you need for the backend (API keys and JWT settings). Some features (like cron integration on Supabase Cloud) require enabling a dashboard integration before running migrations.

### Add optional services as needed

Configure Redis (recommended for production), Sentry (optional), Google OAuth (optional), and email (Resend in production) depending on what you enable in your environment variables.

</Steps>

## Guides

<CardGrid>
<LinkCard title="Supabase" description="Project setup, keys, dashboard settings, and local vs cloud notes" href="/docs/configuration-backend/supabase" />
<LinkCard title="Redis cache" description="Switch cache provider to Redis and configure REDIS_* variables" href="/docs/configuration-backend/redis" />
<LinkCard title="Sentry" description="Enable error monitoring with SENTRY_DSN" href="/docs/configuration-backend/sentry" />
<LinkCard title="Google OAuth" description="Supabase Auth, Google Cloud, and backend callback URLs" href="/docs/configuration-backend/google-oauth" />
<LinkCard title="Database & migrations" description="Supabase CLI, migrations, cron extension, and type generation" href="/docs/configuration-backend/database" />
<LinkCard title="Email (Resend / local)" description="Supabase email confirmations, local inbox, and Resend production setup" href="/docs/configuration-backend/resend" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Installation" description="Deploy and configure OpenQuok" href="/docs/Installation" />
<LinkCard title="Developer guidelines" description="Conventions for working in this repository" href="/docs/developer-guidelines" />
</CardGrid>