---
title: Google OAuth
description: Configure Google login with Supabase Auth (redirect URIs, dashboard settings) for Openquok.
order: 4
lastUpdated: 2026-04-01
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Google OAuth is optional. When configured, the backend provides endpoints that start the login flow and handle the callback.

<Callout type="note" title="Hosted Supabase vs local CLI">
If your backend uses <Badge text="PUBLIC_SUPABASE_URL" variant="envBackend" /> pointing at <Badge text="127.0.0.1:54321" variant="new" /> (local <Badge text="supabase start" variant="path" />), Google must be enabled in <Badge text="backend/supabase/config.toml" variant="path" /> and credentials supplied via <Badge text="backend/supabase/.env" variant="path" />—not only in the cloud dashboard. A <Badge text="400" variant="default" /> response with <Badge text="provider is not enabled" variant="default" /> from <Badge text="/auth/v1/authorize" variant="path" /> means the local Auth service does not have the Google provider turned on or Client ID/secret are missing. Deploying the app to production does not fix local CLI Auth; either configure local Google as below, or point development at a hosted Supabase project where Google is enabled in the dashboard.
</Callout>

## Prerequisites

- OAuth client credentials from <DocsExternalLink href="https://console.cloud.google.com/">Google Cloud Console</DocsExternalLink>: a <Badge text="Client ID" variant="default" /> and <Badge text="Client Secret" variant="default" />
- A Supabase project where you can enable Auth providers

## Steps

<Steps>

### Activate Google as an Auth provider (2 min)

**Hosted Supabase (cloud project)**

1. Open <DocsExternalLink href="https://supabase.com/dashboard/project/_/auth/providers">Supabase → Authentication → Providers</DocsExternalLink>.
2. Find <Badge text="Google" variant="default" /> in the list and click <Badge text="Enable" variant="new" />.
3. Leave the provider dialog open—you will paste the Client ID and Client Secret in a later step.

**Local Supabase CLI** (`supabase start` on `127.0.0.1:54321`)

1. Copy <Badge text="backend/supabase/.env.example" variant="path" /> to <Badge text="backend/supabase/.env" variant="path" /> and set <Badge text="SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" variant="envBackend" /> and <Badge text="SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" variant="envBackend" /> (same values as in Google Cloud Console).
2. In <Badge text="backend/supabase/config.toml" variant="path" />, under <Badge text="[auth.external.google]" variant="path" />, set <Badge text="enabled = true" variant="new" />.
3. Run <Badge text="supabase stop" variant="path" /> then <Badge text="supabase start" variant="path" /> from the <Badge text="backend" variant="path" /> directory so GoTrue reloads the provider.

### Create Google OAuth credentials (5 min)

1. In another tab, open the <DocsExternalLink href="https://console.cloud.google.com/">Google Cloud Console</DocsExternalLink>.
2. Create a new project or select an existing one.
3. Go to <Badge text="APIs & Services" variant="default" /> → <Badge text="Credentials" variant="default" />.
4. Configure the <Badge text="OAuth consent screen" variant="default" />. Set user type to <Badge text="External" variant="experimental" />.
5. Click <Badge text="Create Credentials" variant="default" />, then choose <Badge text="OAuth client ID" variant="default" />.
6. Choose application type <Badge text="Web application" variant="path" />.
7. Under <Badge text="Authorized JavaScript origins" variant="default" />, add the origins where your app runs (scheme + host + port only; no path). Typical values for this project:

  - Local development:

```txt
http://localhost:5173
```

  - Production:

```txt
https://YOUR_FRONTEND_DOMAIN
```

<Callout type="danger">
AWAYS remove the local origin when your application goes into production
</Callout>

8. Under <Badge text="Authorized redirect URIs" variant="default" />, add the Supabase Auth callback Google redirects to (one OAuth client can list several URIs):

  - Hosted Supabase:

```txt
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

  - Local Supabase CLI (same machine as <Badge text="supabase start" variant="path" />):

```txt
http://127.0.0.1:54321/auth/v1/callback
```

9. Copy the <Badge text="Client ID" variant="default" /> and <Badge text="Client Secret" variant="default" /> into the Supabase Google provider dialog (hosted) or into <Badge text="backend/supabase/.env" variant="path" /> (local CLI), then save.
10. For hosted projects, set <Badge text="Site URL" variant="path" /> correctly in <DocsExternalLink href="https://supabase.com/dashboard/project/_/auth/url-configuration">Supabase → Authentication → URL Configuration</DocsExternalLink>. Local CLI uses <Badge text="[auth]" variant="path" /> in <Badge text="config.toml" variant="path" /> (already includes the frontend and backend callback URLs used in this repo).

### Configure Supabase redirects back to the backend (2–3 min)

After Google redirects to Supabase and Supabase finishes the exchange, Supabase must be allowed to redirect to your backend callback.

**Hosted Supabase:** in <DocsExternalLink href="https://supabase.com/dashboard/project/_/auth/url-configuration">Supabase → Authentication → URL Configuration</DocsExternalLink>:

- Set <Badge text="Site URL" variant="path" /> to your frontend (users open this in the browser):

  - Local development:

```txt
http://localhost:5173
```

  - Production:

```txt
https://YOUR_FRONTEND_DOMAIN
```

- Under <Badge text="Redirect URLs" variant="path" />, add the full OAuth callback URL for your backend (origin + API prefix + path). Supabase matches the origin and path; query parameters on the redirect are allowed. Use the same origin as <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> and the same prefix as <Badge text="API_PREFIX" variant="envBackend" /> (default <Badge text="/api/v1" variant="path" />). Callback path:

<Badge text="/api/v1/auth/oauth/google/callback" variant="path" />

  - Local development:

```txt
http://localhost:3000/api/v1/auth/oauth/google/callback
```

  - Production:

```txt
https://YOUR_BACKEND_DOMAIN/api/v1/auth/oauth/google/callback
```

If you see Supabase redirecting back to the frontend with `?code=...` instead of hitting your backend callback, add a wildcard redirect entry (recommended) to avoid allow-list mismatches:

```txt
https://YOUR_BACKEND_DOMAIN/**
```

Summary:

- Frontend (Supabase <Badge text="Site URL" variant="path" />): local <Badge text="http://localhost:5173" variant="new" />, production <Badge text="https://YOUR_FRONTEND_DOMAIN" variant="new" />
- Backend (OAuth callback in <Badge text="Redirect URLs" variant="path" />): local <Badge text="http://localhost:3000/api/v1/auth/oauth/google/callback" variant="new" />, production <Badge text="https://YOUR_BACKEND_DOMAIN/api/v1/auth/oauth/google/callback" variant="new" />

**Local Supabase CLI:** the same redirect allow-list is configured in <Badge text="backend/supabase/config.toml" variant="path" /> under <Badge text="[auth]" variant="path" /> (<Badge text="site_url" variant="path" />, <Badge text="additional_redirect_urls" variant="path" />). Adjust there if your dev ports differ.

### Set environment variables

For **hosted** Supabase, you do not put Google client secrets in the backend env file—configure them in the Supabase dashboard. For **local** CLI, put Client ID and Client Secret in <Badge text="backend/supabase/.env" variant="path" /> as described above.

The backend still needs:

- <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> (example: <Badge text="http://localhost:3000" variant="new" />)
- <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (example: <Badge text="http://localhost:5173" variant="new" />)

### Branding the consent screen (optional)

The first time you test, Google may show that users are signing in to your Supabase project domain. You can adjust branding in Google Cloud; see <DocsExternalLink href="https://github.com/orgs/supabase/discussions/2532">Supabase: branding the Google OAuth consent screen</DocsExternalLink>.

### Restart the backend

Restart the backend process so environment changes are loaded.

</Steps>

<Callout type="note" title="Frontend callback page">
After the backend completes the OAuth exchange, it redirects back to your frontend callback route (constructed from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />).
</Callout>
