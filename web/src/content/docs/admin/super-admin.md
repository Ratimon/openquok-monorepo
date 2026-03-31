---
title: Super admin (first operator)
description: After deployment — sign up, verify email, then set is_super_admin in Supabase for your user.
order: 1
lastUpdated: 2026-03-31
---

<script>
import { Callout, CardGrid, ExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## When to do this

<Callout type="warning" title="After configuration and deployment">
Complete **backend and frontend configuration** and confirm a **successful deployment** (or a working local stack) before following these steps. You need a running app, working auth, and access to your Supabase project.
</Callout>

## Steps

<Steps>

### Open the app

Open your **frontend** in the browser — for example **http://localhost:5173** (default Vite dev), **http://localhost:3000** if your setup serves the web app there, or your **production** site URL.

### Sign up and verify your email

In the navbar, choose **Sign up** and complete registration with your email and password. Finish **email verification** using the code or link your setup sends (depends on Supabase Auth and backend email configuration).

### Promote your user to super admin

The admin entry points may appear in the UI, but **super-admin routes** require <code>is_super_admin</code> on your user.

Open the <ExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</ExternalLink> → your project → **Table Editor** → the **`users`** table (or the table where your app stores `public.users`). Find the row for your account and set **`is_super_admin`** from **FALSE** to **TRUE**, then save.

After that, sign out and sign in again if the app caches roles, or refresh the session as your app expects.

</Steps>

## Related configuration

<CardGrid>
<LinkCard title="Supabase" description="Dashboard, Auth, and database" href="/docs/configuration-backend/supabase" />
<LinkCard title="Installation" description="Deploy and environment setup" href="/docs/Installation" />
<LinkCard title="Admin — overview" description="Back to the admin docs hub" href="/docs/admin" />
</CardGrid>
