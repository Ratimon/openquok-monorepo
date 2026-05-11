---
title: Supabase
description: Create a Supabase project, configure dashboard settings, and wire the backend env keys for Openquok using the new sb_publishable_ / sb_secret_ API key format.
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

Openquok uses Supabase's new API key format only — the legacy JWT-based <code>anon</code> / <code>service&#95;role</code> keys are **not** accepted (Supabase is deleting them in late 2026). Background:

- <DocsExternalLink href="https://github.com/orgs/supabase/discussions/29260">Upcoming changes to Supabase API Keys</DocsExternalLink>
- <DocsExternalLink href="https://supabase.com/docs/guides/getting-started/api-keys">Understanding API keys</DocsExternalLink>

| Role | Variable | Format |
|------|----------|--------|
| Public / client-side | <Badge text="PUBLIC_SUPABASE_PUBLISHABLE_KEY" variant="envBackend" /> | <code>sb&#95;publishable&#95;…</code> |
| Server-side (elevated) | <Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> | <code>sb&#95;secret&#95;…</code> |

<Callout type="warning" title="Never expose the secret key to the client">
<Badge text="SUPABASE_SECRET_KEY" variant="envBackend" /> bypasses Row Level Security and must only live in backend environment variables (server processes, workers, CI secret stores). See <a href="/docs/developer-guidelines/security">Security guidelines</a>.
</Callout>

<Callout type="note" title="Already on legacy keys?">
If your Supabase project still has only <code>anon</code> / <code>service&#95;role</code> JWT keys, open <strong>Settings → API Keys</strong> in the Dashboard and create a <strong>Publishable key</strong> plus one or more <strong>Secret keys</strong>, then update your env vars to the new names. Local stacks: upgrade the Supabase CLI to <strong>2.45+</strong> so <code>supabase status</code> emits the new keys (<DocsExternalLink href="https://github.com/supabase/cli/pull/4167">supabase/cli #4167</DocsExternalLink>).
</Callout>

## Steps

<Steps>

### Create a Supabase project

Create a project in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> and keep your database password.

### Collect API keys (production / hosted Supabase)

In the dashboard, open <strong>Settings → API Keys</strong>:

1. Copy the <strong>Publishable key</strong> (starts with <code>sb&#95;publishable&#95;</code>).
2. Create at least one <strong>Secret key</strong> (starts with <code>sb&#95;secret&#95;</code>) for the backend. Prefer a separate secret key per backend component (API, each worker) so a compromised key can be rotated independently.

Set them in your backend env file (start from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink>):

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

…and set them in <Badge text="backend/.env.development.local" variant="envFile" />:

```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

If <code>supabase status</code> still prints <code>anon key</code> / <code>service&#95;role key</code> instead of <strong>Publishable key</strong> / <strong>Secret key</strong>, upgrade the CLI (for example <code>brew upgrade supabase</code>) and run <code>supabase stop && supabase start</code>.

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
