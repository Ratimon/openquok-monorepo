---
title: First setup as super admin
description: After deployment — sign up, verify email when mail is enabled, then set platform admin access in Supabase.
order: 1
lastUpdated: 2026-07-16
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## When to do this

<Callout type="warning">
Complete <strong>backend and frontend configuration</strong> and confirm a <strong>successful deployment</strong> (or a working local stack) first before following these steps. You need a running app, working auth, and access to your Supabase project.
</Callout>

<CardGrid>
<LinkCard title="Configuration - Backend" description="Backend env, Supabase, and services" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Web" description="Vite env and web defaults" href="/docs/configuration-web" />
</CardGrid>

## Steps

<Steps>

### Open the app

Open your **frontend** in the browser — for example <Badge text="http://localhost:5173" variant="new" /> (default Vite dev), <Badge text="http://localhost:3000" variant="new" /> if your setup serves the web app there, or your **production** site URL.

### Sign up (and verify email only when mail is enabled)

In the navbar, choose **Sign up** and complete registration with your email and password.

Email verification applies only when <Badge text="EMAIL_ENABLED" variant="envBackend" /> is <code>true</code> (finish the verification link your setup sends). When it is <code>false</code> (typical self-host / no email provider), new accounts are treated as verified automatically — skip the verify-signup step and continue.

See <a href="/docs/configuration-backend/resend">Resend / email setup</a> for both modes.

### Promote your user to platform admin

The admin entry points may appear in the UI, but **secret-admin routes** require <code>is_super_admin</code> on your user.

Open the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> → your project → <Badge text="Table Editor" variant="path" /> → the <Badge text="users" variant="default" /> table (or the table where your app stores <Badge text="public.users" variant="path" />). Find the row for **your** account (the email you signed up with) and set <Badge text="is_super_admin" variant="envBackend" /> from <Badge text="FALSE" variant="deprecated" /> to <Badge text="TRUE" variant="new" />, then save.

<Callout type="note" title="One super admin only">
Use your real signup email as the only platform super admin. The seeded catalog row <Badge text="openquok" variant="param" /> (<Badge text="catalog@openquok.local" variant="default" />) is a <strong>display-only publisher</strong> for hub listings — it has no <Badge text="auth_id" variant="param" /> and must <strong>not</strong> be promoted to super admin.
</Callout>

After that, sign out and sign in again if the app caches roles, or refresh the session as your app expects.

### Set your public username (optional but recommended)

In the app, open <Badge text="Account → Settings → Profile" variant="path" /> and set a <strong>username</strong> (e.g. <Badge text="quokka" variant="param" />). That powers your creator profile at <Badge text="/creators/&#123;username&#125;" variant="path" /> when you publish listings under your own account.

Seeded catalog listings (OpenQuok Core, Bloom MCP, etc.) are owned by <Badge text="@openquok" variant="param" /> until you reassign them in <Badge text="Secret Admin → Listing Manager" variant="path" />.

</Steps>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard, Auth, and database" href="/docs/configuration-backend/supabase" />
<LinkCard title="Installation" description="Deploy and environment setup" href="/docs/installation" />
<LinkCard title="Admin — overview" description="Back to the admin docs hub" href="/docs/admin" />
</CardGrid>
