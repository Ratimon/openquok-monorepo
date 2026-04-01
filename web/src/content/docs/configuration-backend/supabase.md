---
title: Supabase
description: Create a Supabase project, configure dashboard settings, and wire the backend env keys.
order: 1
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Supabase configuration for this project is split between:

- **Dashboard settings** (database, auth, integrations such as cron)
- **Backend environment variables** (Supabase URL + keys)

## Steps

<Steps>

### Create a Supabase project

Create a project in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> and keep your database password.

### Collect API keys

From the project settings, collect the Supabase URL + keys and set them in your backend env file (start from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink>).

Common variables include:

- <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" />
- <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" />
- <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" />

### Configure auth settings (as needed)

If you use email confirmation or third-party providers, configure them in the Supabase Dashboard under Auth settings.

</Steps>

## Cron on Supabase Cloud (pg_cron)

Some modules use a cron job (via <code>pg&#95;cron</code>) on Supabase Cloud.

<Callout type="warning" title="Supabase Cloud requires enabling cron integration">
Enable cron via the Supabase Dashboard (Integrations → Cron) before running migrations that depend on it.
</Callout>

If you need to enable it manually, Supabase’s docs show the required SQL and grants.

## Related configuration

<CardGrid>
<LinkCard title="Database & migrations" description="Supabase CLI, migrations, and pg_cron refresh-token cleanup" href="/docs/configuration-backend/database" />
<LinkCard title="Email (Resend / local)" description="Supabase email confirmations, local inbox, and Resend production setup" href="/docs/configuration-backend/resend" />
</CardGrid>
