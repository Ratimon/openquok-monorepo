---
title: Resend - Email Setup
description: Supabase email confirmations, local development email server, self-hosted no-email mode, and Resend production setup for OpenQuok.
order: 7
lastUpdated: 2026-07-16
---

<script>
import { Badge, CardGrid, Callout, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Email flows involve both:

- Supabase **Auth** configuration in the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink>
- Backend environment variables that enable sending and pick a provider

<Badge text="EMAIL_ENABLED" variant="envBackend" /> gates both outbound mail and verification policy: when it is <Badge text="false" variant="param" />, the API does not send mail and treats new accounts as verified.

## Self-hosted / no email provider

Use this when you run OpenQuok without an email features (typical self-hosted that skip mail entirely).

```bash
EMAIL_ENABLED=false
```

| Behavior | Effect |
| --- | --- |
| Outbound mail | Disabled — no verification, invite, or notification emails |
| Signup | New users are marked verified automatically |
| Sign-in | Email verification is not required |

You do not need Resend, local inbox mocks, or AWS SES credentials in this mode.

<Callout type="tip">
Leave <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> unset so plan guards and the first-billing paywall stay off. See <a href="/docs/configuration-backend/stripe">Stripe billing</a>.
</Callout>

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

Local email development uses an AWS SES-compatible workflow with an **offline/local inbox mock**, so the backend still expects AWS credentials (even though the values can be placeholders). Set <Badge text="EMAIL_ENABLED" variant="envBackend" /> to <code>true</code> so verification mail is sent and the verify-signup flow applies.

```bash
EMAIL_ENABLED=true
IS_EMAIL_SERVER_OFFLINE=true
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
```

### View sent emails

Open the local inbox UI at <Badge text="http://localhost:8005" variant="new" />.

</Steps>

<Callout type="note" title="Two local modes">
<p>Self-host / no inbox: <Badge text="EMAIL_ENABLED" variant="envBackend" />{' '}<code>=false</code> — no mail, signup auto-verified (section above).</p>
<p>Local inbox testing: <Badge text="EMAIL_ENABLED" variant="envBackend" />{' '}<code>=true</code> plus <Badge text="IS_EMAIL_SERVER_OFFLINE" variant="envBackend" />{' '}<code>=true</code> — current contributor path for viewing messages at port 8005.</p>
</Callout>

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

- Go to **Route 53** → **Hosted zones** → select (e.g. <Badge text="openquok.com" variant="param" />)
- Create a record:
  - **Name**: <Badge text="_dmarc" variant="param" />
  - **Type**: <Badge text="TXT" variant="param" />
  - **Value**:

```txt
"v=DMARC1; p=none; rua=mailto:dmarcreports@yourdomain.com;"
```

Start with <Badge text="p=none" variant="param" /> (monitoring) and move to <Badge text="p=quarantine" variant="param" /> once you confirm your mail is passing DMARC.

</Steps>

<Callout type="warning">
Even if the backend can send email, whether a user must confirm their email is controlled by Supabase Auth settings.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard setup and auth/email settings" href="/docs/configuration-backend/supabase" />
<LinkCard title="Stripe billing" description="Self-host: leave publishable key unset" href="/docs/configuration-backend/stripe" />
<LinkCard title="Database & migrations" description="Supabase CLI, migrations, and pg_cron notes" href="/docs/configuration-backend/database" />
</CardGrid>
