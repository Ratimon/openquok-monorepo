---
title: Product analytics and campaign attribution
description: Configure PostHog, Meta Pixel, Google Analytics, and UTM capture for marketing links and checkout attribution on OpenQuok.
order: 3
lastUpdated: 2026-05-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The web app records **product analytics** (usage and conversion events) and **first-touch campaign data** from query parameters. Attribution runs in the browser via <Badge text="UtmAttribution.svelte" variant="path" /> on the root layout; no extra page wiring is required for basic UTM storage.

<p>This is separate from <strong>platform analytics</strong> (followers, impressions, per-post metrics from social providers). See <a href="/docs/apis-analytics">Analytics APIs</a> for channel and post insights.</p>

## Environment variables

<Steps>

### Web (<Badge text="web/.env.production.local" variant="envWeb" /> or development local)

| Variable | Purpose |
|----------|---------|
| <Badge text="VITE_PUBLIC_POSTHOG_KEY" variant="envWeb" /> | PostHog project token (<code>phc_…</code>) |
| <Badge text="VITE_PUBLIC_POSTHOG_HOST" variant="envWeb" /> | PostHog ingest host (e.g. <code>https://us.i.posthog.com</code>) |
| <Badge text="VITE_PUBLIC_FACEBOOK_PIXEL" variant="envWeb" /> | Meta Pixel ID for browser <code>fbq</code> |
| <Badge text="VITE_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID" variant="envWeb" /> | Google Analytics measurement ID (<code>G-…</code>) |
| <Badge text="VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY" variant="envWeb" /> | When empty, PostHog product events are skipped (self-hosted without billing) |

### Backend (<Badge text="backend/.env.production.local" variant="envBackend" /> or development local)

| Variable | Purpose |
|----------|---------|
| <Badge text="FACEBOOK_PIXEL_ID" variant="envBackend" /> | Same numeric Pixel ID as <Badge text="VITE_PUBLIC_FACEBOOK_PIXEL" variant="envWeb" /> |
| <Badge text="FACEBOOK_PIXEL_ACCESS_TOKEN" variant="envBackend" /> | Meta Conversions API access token (server only; never expose in the web app) |

</Steps>

<Callout type="note">
<p>PostHog and Meta are optional. Leave keys empty for local dev or self-hosted installs that do not run paid checkout or ad attribution.</p>
</Callout>

More detail on Vite keys: <a href="/docs/configuration-web/vite">Configuration — Vite (SvelteKit)</a>.

## Where to get credentials

- **PostHog** — <DocsExternalLink href="https://posthog.com">posthog.com</DocsExternalLink> → Project settings → **Project token** (<code>phc_…</code>) and **API host**.
- **Meta Pixel** — <DocsExternalLink href="https://business.facebook.com/events_manager2">Meta Events Manager</DocsExternalLink> → your Pixel → **Pixel ID**; **Conversions API** → **Generate access token** (backend only).
- **Google Analytics** — Google Analytics → Admin → Data streams → **Measurement ID**.

## UTM and campaign capture

On every visit, the app can persist:

| <code>localStorage</code> key | Set when | Meaning |
|-------------------------------|----------|---------|
| <code>utm</code> | First matching query param | Campaign source string (first-touch) |
| <code>landingUrl</code> | First visit only | Full URL of the first page loaded |
| <code>referrer</code> | First visit only | <code>document.referrer</code> on that first visit |

### Supported query parameters

The first non-empty value wins and is stored once (later visits do not overwrite <code>utm</code>):

- <Badge text="utm_source" variant="param" />
- <Badge text="utm" variant="param" />
- <Badge text="ref" variant="param" />

### Example marketing links

**Newsletter**

```text
https://www.openquok.com/sign-up?utm_source=newsletter&utm_medium=email&utm_campaign=march
```

Stored value: <code>newsletter</code> (only <code>utm_source</code> is read into <code>utm</code>; medium and campaign are not saved unless you extend <Badge text="utm.ts" variant="path" />).

**Partner or affiliate**

```text
https://www.openquok.com/?ref=partner_acme
```

Stored value: <code>partner_acme</code>.

**Paid social**

```text
https://www.openquok.com/?utm_source=meta&utm_campaign=prospecting
```

Stored value: <code>meta</code>.

### Verify in the browser

1. Open your site with a tagged URL, e.g. <code>https://localhost:5173/?utm_source=test_dev</code>.
2. DevTools → **Application** → **Local Storage** → your origin.
3. Confirm <code>utm</code>, <code>landingUrl</code>, and <code>referrer</code>.
4. Navigate to another route without query params — <code>utm</code> should still be <code>test_dev</code>.

### Post-checkout return (<Badge text="check" variant="param" />)

If the user lands with <Badge text="?check=1" variant="param" /> (or any truthy <code>check</code> query), the layout fires:

- PostHog event <code>purchase</code> (when Stripe + PostHog are configured)
- Meta conversion <code>StartTrial</code> (when Pixel + CAPI token are configured)

Example:

```text
https://www.openquok.com/account/billing?check=1
```

Use this on return URLs after Stripe Checkout or trial confirmation flows you control.

### Reading stored UTM in app code

Export <Badge text="readStoredUtm()" variant="default" /> from <Badge text="$lib/product-analytics" variant="path" /> returns the stored campaign string. You can attach it to checkout payloads or analytics event properties, for example:

```typescript
import { readStoredUtm, fireProductEvent } from '$lib/product-analytics';

const utm = readStoredUtm();
fireProductEvent('initiate_checkout', { utm });
```

<Callout type="tip">
<p>Subscribe and Stripe Checkout in the current app do not yet send <code>utm</code> to the API automatically. Wire <code>readStoredUtm()</code> into your billing flow when you want server-side or Stripe metadata attribution.</p>
</Callout>

## Event map (hosted product)

When billing is enabled (<Badge text="VITE_PUBLIC_STRIPE_PUBLISHABLE_KEY" variant="envWeb" /> set), common events include:

| User action | PostHog (approx.) | Meta conversion |
|-------------|-------------------|-----------------|
| Sign-up success | <code>register</code> | <code>CompleteRegistration</code> |
| Subscribe click | — | <code>InitiateCheckout</code> |
| Checkout return with <code>check</code> | <code>purchase</code> | <code>StartTrial</code> |
| Billing poll after checkout | <code>purchase</code> | <code>Purchase</code> |
| Channel connected (<code>added</code> query) | <code>channel_added</code> | — |

## Related

<CardGrid>
<LinkCard title="Roles overview" description="Other admin setup guides" href="/docs/admin" />
<LinkCard title="Stripe billing" description="Checkout, webhooks, and price IDs" href="/docs/configuration-backend/stripe" />
<LinkCard title="Vite (SvelteKit)" description="All VITE_* analytics variables" href="/docs/configuration-web/vite" />
</CardGrid>
