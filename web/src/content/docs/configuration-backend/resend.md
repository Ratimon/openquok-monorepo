---
title: Resend - Email Setup
description: Supabase email confirmations, local development email server, and Resend production setup for Openquok.
order: 7
lastUpdated: 2026-03-31
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Email flows involve both:

- Supabase **Auth** configuration in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink>
- Backend environment variables that enable sending and pick a provider

## Steps (local)

<Steps>

### Configure Supabase auth email settings

In the Supabase Dashboard, configure whether sign-in requires email confirmation and related Auth settings.

![Supabase confirmation settings](/docs/configuration-backend/resend/supabase-email-setting.webp)

### Run the backend with the local inbox

```bash
pnpm dev:with-local-email
```

### Set environment variables

Local email development uses an AWS SES-compatible workflow with an **offline/local inbox mock**, so the backend still expects AWS credentials (even though the values can be placeholders).

```bash
EMAIL_ENABLED=true
IS_EMAIL_SERVER_OFFLINE=true
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
```

### View sent emails

Open the local inbox UI at <Badge text="http://localhost:8005" variant="new" />.

</Steps>

## Steps (production with Resend)

<Steps>

### Verify your domain in Resend

Verify the **root domain** (not only a subdomain) in <DocsExternalLink href="https://resend.com/domains">Resend Domains</DocsExternalLink>.

### Set sender address and API key

```bash
SENDER_EMAIL_ADDRESS=support@yourdomain.com
RESEND_SECRET_KEY=
```

### Implement DMARC (recommended for Gmail to not be marked as spam)

Resend domain verification ensures SPF and DKIM are in place, but DMARC is configured via your DNS provider.
Follow the Resend guide: <DocsExternalLink href="https://resend.com/docs/dashboard/domains/dmarc">Implementing DMARC</DocsExternalLink>.

If you use AWS Route 53:

- Go to **Route 53** → **Hosted zones** → select your domain (e.g. `openquok.com`)
- Create a record:
  - **Name**: `_dmarc`
  - **Type**: `TXT`
  - **Value**:

```txt
"v=DMARC1; p=none; rua=mailto:dmarcreports@yourdomain.com;"
```

Start with `p=none` (monitoring) and move to `p=quarantine` once you confirm your mail is passing DMARC.

</Steps>

<Callout type="warning" title="Supabase confirmation behavior is configured in the dashboard">
Even if the backend can send email, whether a user must confirm their email is controlled by Supabase Auth settings.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard setup and auth/email settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Database & migrations" description="Supabase CLI, migrations, and pg_cron notes" href="/docs/configuration-backend/database" />
</CardGrid>
