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

## API keys

Openquok uses Supabase's new API key format only — the legacy JWT-based <code>anon</code> / <code>service&#95;role</code> keys are **not** accepted. Background:

- <DocsExternalLink href="https://supabase.com/docs/guides/getting-started/api-keys">Understanding API keys</DocsExternalLink>

| Role | Variable | Format |
|------|----------|--------|
| Public / client-side | <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" /> | <code>sb&#95;publishable&#95;…</code> |
| Server-side (elevated) | <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | <code>sb&#95;secret&#95;…</code> |

<Callout type="warning" title="Never expose the secret key to the client">
<Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> bypasses Row Level Security and must only live in backend environment variables (server processes, workers, CI secret stores). See <a href="/docs/developer-guidelines/security">Security guidelines</a>.
</Callout>

<Callout type="note" title="Already on legacy keys?">
If your Supabase project still has only <code>anon</code> / <code>service&#95;role</code> JWT keys, open <strong>Settings → API Keys</strong> in the Dashboard and create a <strong>Publishable key</strong> plus one or more <strong>Secret keys</strong>, then update your env vars to the new names.
</Callout>

## Steps

<Steps>

### Create a Supabase project

Create a project in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> and keep your database password.

### Collect API keys (production / hosted Supabase)

In the dashboard, open <strong>Settings → API Keys</strong>:

1. Copy the <strong>Publishable key</strong> (starts with <code>sb&#95;publishable&#95;</code>).
2. Create at least one <strong>Secret key</strong> (starts with <code>sb&#95;secret&#95;</code>) for the backend.

…and set them in <Badge text="backend/.env.production.local" variant="path" />:

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

### Collect API keys (local development)

Local <code>supabase start</code> emits the new key format from Supabase CLI <strong>2.45+</strong>. Pull them with:

```bash
cd backend
supabase status -o env
```

…and set them in <Badge text="backend/.env.development.local" variant="path" />:

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

If <code>supabase status</code> still prints <code>anon key</code> / <code>service&#95;role key</code> instead of <strong>Publishable key</strong> / <strong>Secret key</strong>, upgrade the CLI.

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
