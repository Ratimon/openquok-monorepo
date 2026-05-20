---
title: Stripe billing
description: Configure Stripe for workspace subscriptions, media storage quotas, checkout, and webhooks in Openquok.
order: 8
lastUpdated: 2026-05-20
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Openquok uses **Stripe** for **workspace (organization) subscriptions**. Plan limits are defined in <Badge text="openquok-common" variant="path" />.


| Surface | Role |
| --- | --- |
| **Backend** | Checkout, customer portal, webhooks, subscription rows in Postgres |
| **Web** | <Badge text="/account/billing" variant="path" /> — current plan, usage, upgrade |
| **Database** | <Badge text="organization_subscriptions" variant="param" />, <Badge text="organizations.stripe_customer_id" variant="param"/> (billing migrations) |


## Environment variables

### Backend environment variables

Set these in <Badge text="backend/.env.development.local" variant="envBackend" /> (or your host’s secret store in production). They are read only from <Badge text="backend/config/GlobalConfig.ts" variant="path" />.

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

| Variable | Used for Stripe API calls? | Role |
| --- | --- | --- |
| <Badge text="STRIPE_SECRET_KEY" variant="envBackend" /> | Yes | Checkout sessions, Customer Portal, price lookup, server-side Stripe SDK |
| <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" /> | Yes (signatures) | Verify webhook payloads on <Badge text="POST /api/v1/billing/webhooks/stripe" variant="path" /> |
| <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> | **No** | **Billing mode flag** — see below |

Also ensure <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> matches the origin where users open the app (for example <Badge text="https://localhost:5173" variant="param" /> in local HTTPS dev). Checkout success and cancel URLs point to <Badge text="/account/billing" variant="path" /> on that host.

Templates: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink>.

### What <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> does (`billingEnabled`)

The API does **not** send the publishable key to Stripe. It only answers: **“Is this deployment running paid billing?”**


This matches the common **self-hosted vs SaaS** pattern: one env var toggles whether subscription limits and checkout UI apply, without requiring every self-host operator to configure webhooks and secrets just to run the product locally.

#### Self-hosted or local dev (omit publishable key)

Leave <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> **unset** (you may also omit <Badge text="STRIPE_SECRET_KEY" variant="envBackend" /> and <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" /> if you are not testing Stripe at all).

| Behavior | Effect |
| --- | --- |
| `billingEnabled` | `false` |
| Effective tier (no <Badge text="organization_subscriptions" variant="param" /> row) | **CREATOR** — see <Badge text="SubscriptionService.resolveTier" variant="path" /> |
| Plan limits | CREATOR limits from <Badge text="pricing.ts" variant="path" /> (storage, features, and so on) |
| <Badge text="PermissionsService.assertPolicies" variant="path" /> | **Skipped** — subscription policy checks do not run |
| <Badge text="/account/billing" variant="path" /> | Shows an info alert: billing is not configured; no upgrade cards |

Use this for contributors, Docker self-host, or internal instances where Stripe is intentionally disabled.

#### SaaS or production billing

Set **all three** backend Stripe variables. With <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> set:

| Behavior | Effect |
| --- | --- |
| `billingEnabled` | `true` |
| Effective tier (no subscription row) | **FREE** — paid limits until the user subscribes |
| Plan limits | Enforced from the active tier (FREE or paid row in Postgres) |
| <Badge text="PermissionsService.assertPolicies" variant="path" /> | **Active** — storage, team seats, share preview, public API, and related gates |
| <Badge text="/account/billing" variant="path" /> | Upgrade UI, Checkout redirect, Customer Portal when a Stripe customer exists |

Checkout and webhooks still require <Badge text="STRIPE_SECRET_KEY" variant="envBackend" /> and <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" />.

<Callout type="note">
Openquok checkout is **redirect-based** (hosted Stripe Checkout URL from the API), not embedded Stripe.js in the browser. You do **not** need <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> for `loadStripe()` on the server — only as the billing-enabled switch. A future embedded checkout would use <Badge text="VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY" variant="envWeb" /> on the web app separately.
</Callout>

### Stripe Price ids (web — required for checkout)

Create **recurring** prices in the Stripe Dashboard for each paid tier (**SOLO**, **CREATOR**, **TEAM**, **ULTIMATE**) and cadence (**monthly** and **yearly**). Copy each `price_…` id into the matching **web** variable in <Badge text="web/.env.development.local" variant="envWeb" /> (resolved by <Badge text="web/src/lib/billing/constants/config.ts" variant="path" />):

```bash
VITE_PUBLIC_STRIPE_PRICE_ID_SOLO_MONTHLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_SOLO_YEARLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_CREATOR_MONTHLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_CREATOR_YEARLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_TEAM_MONTHLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_TEAM_YEARLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_ULTIMATE_MONTHLY=price_...
VITE_PUBLIC_STRIPE_PRICE_ID_ULTIMATE_YEARLY=price_...
```

On upgrade, the billing page sends the selected `stripePriceId` to <Badge text="/api/v1/billing/subscribe" variant="path" />. The API verifies the price amount and interval against <Badge text="common/src/subscription/pricing.ts" variant="path" /> before opening Checkout.

Plan limits (channels, storage, workspaces, and so on) are edited in <Badge text="pricing.ts" variant="path" />, not in Stripe metadata.

### Web (publishable key — optional, not used for checkout today)

```bash
VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

Reserved for a future **embedded** Stripe.js checkout. Current billing uses a **redirect** from <Badge text="POST /api/v1/billing/subscribe" variant="path" />; the web app reads `billingEnabled` from the API (driven by backend <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" />), not from this Vite variable.

See <a href="/docs/configuration-web/vite">Vite (SvelteKit)</a> for other <Badge text="VITE_*" variant="envWeb" /> variables.

## Steps (Stripe Dashboard)

<Callout type="note">
Use Test mode before going live. Complete setup in **Test mode** in the <DocsExternalLink href="https://dashboard.stripe.com/test/dashboard">Stripe Dashboard</DocsExternalLink>. Repeat with live keys only when checkout and webhooks work end-to-end.
</Callout>

<Steps>

### Create API keys

In the Stripe Dashboard, open **Developers** → **API keys**.

Copy:

- **Publishable key** → <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> (billing mode flag; required for SaaS-style enforcement). Mirror on web as <Badge text="VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY" variant="envWeb" />.
- **Secret key** → <Badge text="STRIPE_SECRET_KEY" variant="envBackend" /> (required for Checkout, Portal, and API calls).

### Configure the Customer Portal

Open <DocsExternalLink href="https://dashboard.stripe.com/test/settings/billing/portal">Customer portal settings (test)</DocsExternalLink> and save a default configuration (payment method updates, cancellation, and so on). The API opens the portal with return URL built from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus <Badge text="/account/billing" variant="path" />.

### Create a webhook endpoint

In **Developers** → **Webhooks**, add an endpoint whose URL is your **public API base** plus:

```txt
/api/v1/billing/webhooks/stripe
```

**Production** (API on its own host):

```bash
https://api.yourdomain.com/api/v1/billing/webhooks/stripe
```

**Local** (Stripe CLI only) — use forwarding below; do not register `localhost` in the Dashboard.

Subscribe at least these events:

```bash
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

<Callout type="warning">
After creating the endpoint, open it and reveal the <Badge text="Signing secret" variant="param" /> (starts with <code>whsec_</code>). Copy that value to <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" />. Do NOT paste the webhook id (<code>we_...</code>).
</Callout>

### Align frontend and backend origins

Set <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and <Badge text="VITE_FRONTEND_DOMAIN_URL" variant="envWeb" /> to the **same** scheme and host users use in the browser.

</Steps>

## Local webhook testing (Stripe CLI)

Stripe cannot call `localhost` directly. Use the **Stripe CLI** to forward events to your API process (default port **3000**).

<Steps>

### Install and log in

Install the <DocsExternalLink href="https://stripe.com/docs/stripe-cli">Stripe CLI</DocsExternalLink>, then:

```bash
stripe login
```

### Forward events to the API

With the backend running on port 3000:

```bash
stripe listen --forward-to localhost:3000/api/v1/billing/webhooks/stripe
```

The CLI prints a **webhook signing secret** for this session. Put that value in <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" /> in <Badge text="backend/.env.development.local" variant="envBackend" /> and restart the API.

<Callout type="warning" title="CLI vs Dashboard secret">
The signing secret from <code>stripe listen</code> is **different** from the secret on a Dashboard webhook endpoint. Use the CLI secret only while forwarding locally; use the Dashboard <code>whsec_</code> in deployed environments.
</Callout>

### Trigger a test subscription flow

1. Open the web app → **Account** → **Billing** (<Badge text="/account/billing" variant="path" />).
2. Choose a plan (for example **SOLO**) and complete Stripe Checkout (test card <Badge text="4242 4242 4242 4242" variant="param" />).
3. Confirm the CLI shows <Badge text="customer.subscription.created" variant="param" /> (or <Badge text="customer.subscription.updated" variant="param" />) and the API returns `200`.
4. Refresh billing: tier and **media storage** quota should match the plan in <Badge text="openquok-common" variant="path" /> pricing.

</Steps>

## How plans map to product behavior

| Concern | Where it is defined |
| --- | --- |
| Tier names, limits, and USD amounts | <Badge text="common/src/subscription/pricing.ts" variant="path" /> |
| Stripe Checkout `price_…` | Web <Badge text="VITE_PUBLIC_STRIPE_PRICE_ID_SOLO_MONTHLY" variant="envWeb" /> (one key per tier and cadence; see env list above) |
| Media library **total** bytes per workspace | <Badge text="media_storage_bytes_per_workspace" variant="default" /> on each tier |
| Per-file upload cap | 30 MB images / 1 GB videos (frontend); 10 MB images / 1 GB videos (API); separate from storage quota |
| Active subscription row | <Badge text="organization_subscriptions" variant="default" /> |
| Stripe customer id | <Badge text="organizations.stripe_customer_id" variant="default" /> |

Tiers: <Badge text="FREE" variant="param" />(authenticated, no paid row), <Badge text="SOLO" variant="param" />, <Badge text="CREATOR" variant="param" />, <Badge text="TEAM" variant="param" />, <Badge text="ULTIMATE" variant="param" />. Changing features or list prices is a code change in <Badge text="pricing.ts" variant="path" /> plus matching Stripe prices in the Dashboard.

## API routes (reference)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/billing/plans` | Public plan catalog and limits |
| `GET` | `/api/v1/billing/current?organizationId=` | Tier, drive usage, trial flags |
| `POST` | `/api/v1/billing/subscribe` | Start Checkout or upgrade existing sub |
| `GET` | `/api/v1/billing/portal?organizationId=` | Stripe Customer Portal URL |
| `GET` | `/api/v1/billing/check/:id?organizationId=` | Poll after Checkout redirect |
| `POST` | `/api/v1/billing/webhooks/stripe` | Stripe webhooks (raw body; no JWT) |

Webhook requests must use the raw JSON body for signature verification; the route is registered **before** the global JSON parser.

## Production checklist

<Steps>

### Use live keys

Switch Dashboard to **Live mode**, create live API keys and a live webhook endpoint (same path suffix), and set live values in your host’s secrets.

### Confirm webhook delivery

In Stripe → **Webhooks** → your endpoint, verify recent events show **Succeeded**. Failed deliveries usually mean wrong <Badge text="STRIPE_WEBHOOK_SECRET" variant="envBackend" />, a blocked URL, or TLS issues.

### Verify billing UI

Signed-in users with a workspace should see usage on **Billing** and in the media library sidebar (**used / total** from the subscription tier).

</Steps>

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Billing page says Stripe is not configured | <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> empty on the API (`billingEnabled: false`) — expected for self-host; set it for SaaS |
| Self-host wants full product without Stripe | Leave <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> unset; effective tier **CREATOR**, policies not enforced |
| SaaS user stuck on FREE limits | Set <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> **and** complete Checkout; confirm webhooks update <Badge text="organization_subscriptions" variant="param" /> |
| Checkout works but tier never updates | Webhook not reaching the API; wrong signing secret; migrations not applied |
| `402` on media upload | Workspace over <Badge text="media_storage_bytes_per_workspace" variant="default" /> for its tier |
| Webhook `400` / signature error | Body parsed as JSON before the webhook handler; use CLI forward URL on port **3000** |

## Related configuration

<CardGrid>
<LinkCard title="Configuration - Backend" description="FRONTEND_DOMAIN_URL, env templates, and service overview" href="/docs/configuration-backend" />
<LinkCard title="Vite (SvelteKit)" description="VITE_* variables and HTTPS dev proxy" href="/docs/configuration-web/vite" />
<LinkCard title="Cloudflare R2" description="Object storage for workspace media files" href="/docs/configuration-backend/cloudflare-r2" />
<LinkCard title="Database & migrations" description="Apply billing tables before subscriptions" href="/docs/configuration-backend/database" />
<LinkCard title="Production deployment" description="Deploy API and web with matching origins" href="/docs/installation/production-deployment" />
</CardGrid>
