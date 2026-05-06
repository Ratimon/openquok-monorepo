---
title: Super admin (first operator)
description: After deployment — sign up, verify email, then set super admin access in Supabase.
order: 1
lastUpdated: 2026-03-31
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## When to do this

<Callout type="warning" title="After configuration and deployment">
Complete **backend and frontend configuration** and confirm a **successful deployment** (or a working local stack) before following these steps. You need a running app, working auth, and access to your Supabase project.
</Callout>

## Steps

<Steps>

### Open the app

Open your **frontend** in the browser — for example <Badge text="http://localhost:5173" variant="new" /> (default Vite dev), <Badge text="http://localhost:3000" variant="new" /> if your setup serves the web app there, or your **production** site URL.

### Sign up and verify your email

In the navbar, choose **Sign up** and complete registration with your email and password. Finish **email verification** using the code or link your setup sends (depends on Supabase Auth and backend email configuration).

### Promote your user to super admin

The admin entry points may appear in the UI, but **super-admin routes** require <code>is_super_admin</code> on your user.

Open the <DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink> → your project → <Badge text="Table Editor" variant="path" /> → the <Badge text="users" variant="default" /> table (or the table where your app stores <Badge text="public.users" variant="path" />). Find the row for your account and set <Badge text="is_super_admin" variant="envBackend" /> from <Badge text="FALSE" variant="deprecated" /> to <Badge text="TRUE" variant="new" />, then save.

After that, sign out and sign in again if the app caches roles, or refresh the session as your app expects.

</Steps>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard, Auth, and database" href="/docs/configuration-backend/supabase" />
<LinkCard title="Installation" description="Deploy and environment setup" href="/docs/installation" />
<LinkCard title="Admin — overview" description="Back to the admin docs hub" href="/docs/admin" />
</CardGrid>
