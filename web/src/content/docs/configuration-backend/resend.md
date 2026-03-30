---
title: Email (Resend / local)
description: Supabase email confirmations, local inbox for dev, and Resend production setup.
order: 6
lastUpdated: 2026-03-30
---

<script>
import { Badge, CardGrid, Callout, ExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Email flows involve both:

- Supabase **Auth** configuration in the <ExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</ExternalLink>
- Backend environment variables that enable sending and pick a provider

## Steps (local)

<Steps>

### Configure Supabase auth email settings

In the Supabase Dashboard, configure whether sign-in requires email confirmation and related Auth settings.

![Supabase confirmation settings](/docs/supabase-email-setting.png)

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

Verify the **root domain** (not only a subdomain) in <ExternalLink href="https://resend.com/domains">Resend Domains</ExternalLink>.

### Set sender address and API key

```bash
SENDER_EMAIL_ADDRESS=support@domain.com
RESEND_SECRET_KEY=
```

</Steps>

<Callout type="warning" title="Supabase confirmation behavior is configured in the dashboard">
Even if the backend can send email, whether a user must confirm their email is controlled by Supabase Auth settings.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard setup and auth/email settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Database & migrations" description="Supabase CLI, migrations, and pg_cron notes" href="/docs/configuration-backend/database" />
</CardGrid>
