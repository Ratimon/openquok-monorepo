---
title: Database & migrations
description: Supabase CLI, migrations, pg_cron notes, and type generation.
order: 5
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Database workflow is managed through the Supabase CLI + the migrations under <Badge text="backend/supabase/" variant="path" />.

## Steps (local)

<Steps>

### Install and configure Supabase CLI

Set your project id in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/supabase/config.toml"><Badge text="backend/supabase/config.toml" variant="path" /></DocsExternalLink>.

### Start local Supabase

```bash
cd backend
supabase start
```

### Reset DB to current migrations

```bash
supabase db reset
```

### Generate types (optional)

```bash
pnpm db:local:typegen
```

</Steps>

## Aggregated migrations

This repo aggregates SQL modules under <Badge text="backend/supabase/db/" variant="path" /> into <Badge text="backend/supabase/migrations/" variant="path" />.

**Aggregate all modules**:

```bash
pnpm db:aggregate-migrations-all
```

**Aggregate a single module**:

```bash
pnpm db:aggregate-migrations-single config
```

## Cron: expired refresh tokens (pg_cron)

The `user-auth` module includes a cron job that deletes expired rows in `public.refresh_tokens` (runs every Saturday at **3:30 AM GMT**). It relies on the Postgres <code>pg&#95;cron</code> extension.

After you enable <code>pg&#95;cron</code> on Supabase Cloud, push the migrations so the cron job becomes active.

When you use the “Production-linked Supabase” commands on the local development page, run these (in `backend/`):

```bash
pnpm db:production:typegen
pnpm db:production:push-db
```

## Supabase Cloud notes (pg_cron)

<Callout type="warning" title="Enable cron integration on Supabase Cloud">
If a migration depends on <code>pg&#95;cron</code>, enable it first in the Supabase Dashboard (Integrations → Cron), then run your migrations / push.

On Supabase Cloud, you can also run the following once to create the extension and grant the required privileges:

```text
create extension pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
```
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard setup, API keys, and auth settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Email (Resend / local)" description="Local inbox testing and Resend production configuration" href="/docs/configuration-backend/resend" />
</CardGrid>
