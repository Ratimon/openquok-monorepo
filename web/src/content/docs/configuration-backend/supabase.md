---
title: Supabase
description: Create a Supabase project, configure dashboard settings, and wire the backend env keys for Openquok.
order: 1
lastUpdated: 2026-05-11
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Supabase configuration for this project is split between:

- **Dashboard settings** (database, auth, integrations such as cron)
- **Backend environment variables** (Supabase URL + keys)

## API keys: new format vs legacy

Supabase is replacing the legacy JWT-based <code>anon</code> / <code>service&#95;role</code> keys with a new key format (<code>sb&#95;publishable&#95;…</code> / <code>sb&#95;secret&#95;…</code>). Both formats are accepted today; the legacy keys will be deleted in late 2026. See the upstream announcement and reference:

- <DocsExternalLink href="https://github.com/orgs/supabase/discussions/29260">Upcoming changes to Supabase API Keys</DocsExternalLink>
- <DocsExternalLink href="https://supabase.com/docs/guides/getting-started/api-keys">Understanding API keys</DocsExternalLink>

The backend in this repo prefers the **new keys** when set and falls back to the **legacy JWT keys** otherwise, so you can migrate cloud projects without breaking local <code>supabase start</code> stacks (which still emit JWT-based <Badge text="ANON_KEY" variant="envBackend" /> and <Badge text="SERVICE_ROLE_KEY" variant="envBackend" />).

| Role | New format <Badge text="new" variant="new" /> | Legacy <Badge text="deprecated" variant="deprecated" /> |
|------|-----------------------------------------------|---------------------------------------------------------|
| Public / client-side | <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" /> (<code>sb&#95;publishable&#95;…</code>) | <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" /> (JWT) |
| Server-side (elevated) | <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> (<code>sb&#95;secret&#95;…</code>) | <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> (JWT) |

<Callout type="warning" title="Never expose the secret key to the client">
The <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> (and legacy <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" />) must only live in backend environment variables. See <a href="/docs/developer-guidelines/security">Security guidelines</a>.
</Callout>

## Steps

<Steps>

### Create a Supabase project

Create a project in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> and keep your database password.

### Collect API keys (production / hosted Supabase)

In the dashboard, open <strong>Settings → API Keys</strong>:

1. Under the <strong>API Keys</strong> tab, copy the <strong>Publishable key</strong> (starts with <code>sb&#95;publishable&#95;</code>) and create at least one <strong>Secret key</strong> (starts with <code>sb&#95;secret&#95;</code>) for the backend.
2. Under <strong>Legacy anon, service_role API keys</strong>, the JWT keys remain available during the migration; you can leave them in place but you do not need them once you have migrated.

Set them in your backend env file (start from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink>):

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

### Collect API keys (local development)

Local <code>supabase start</code> still emits JWT-based legacy keys. Pull them with:

```bash
cd backend
supabase status -o env
```

…and set them in <Badge text="backend/.env.development.local" variant="envBackend" />:

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

The backend treats the legacy keys as a fallback, so the same code path serves local dev and migrated production.

### Configure auth settings (as needed)

If you use email confirmation or third-party providers, configure them in the Supabase Dashboard under Auth settings.

</Steps>

## Migrating an existing project

<Steps>

### Generate new keys in the dashboard

In <strong>Settings → API Keys</strong>, generate a <strong>Publishable key</strong> and one or more <strong>Secret keys</strong>. Prefer a separate secret key per backend component (API, each worker) so a compromised key can be rotated independently.

### Stage the new keys alongside the legacy ones

Set the new variables in every environment that runs the backend or workers — Vercel (API), Railway (workers), and your local <Badge text="backend/.env.development.local" variant="envBackend" />:

```bash
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Keep <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" /> and <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> in place during the transition. Deploy and verify the app works end-to-end (sign in, RLS queries, queued workers).

### Remove the legacy keys

Once every environment is using the new keys successfully, delete <Badge text="PUBLIC_SUPABASE_ANON_KEY" variant="envBackend" /> and <Badge text="SUPABASE_SERVICE_ROLE_KEY" variant="envBackend" /> from your secrets stores. Supabase will delete the legacy keys themselves in late 2026.

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
