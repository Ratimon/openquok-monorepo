---
title: Config defaults
description: How the Openquok web app derives default values from Vite env and fallbacks (backend URL, company, landing, navigation).
order: 2
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The web app centralizes its default configuration in:

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/config/constants/config.ts"><Badge text="web/src/lib/config/constants/config.ts" variant="path" /></DocsExternalLink>

This file exports schema objects like:

- <Badge text="CONFIG_SCHEMA_BACKEND" variant="path" />
- <Badge text="CONFIG_SCHEMA_COMPANY" variant="path" />
- <Badge text="CONFIG_SCHEMA_MARKETING" variant="path" />
- <Badge text="CONFIG_SCHEMA_LANDING_PAGE" variant="path" />

Pages and repositories use these defaults when a value is missing from runtime data (for example when backend-provided config hasn’t been set yet).

## How defaults are chosen

Some defaults are resolved from Vite env first, then fall back to a safe constant.

Examples:

- **API base URL** — if <Badge text="VITE_API_BASE_URL" variant="envWeb" /> is set in <Badge text=".env.development.local" variant="envWeb" />, that value is used as the origin for API requests. If it is <strong>not</strong> set and Vite is in <strong>development</strong> mode, the default is an <strong>empty</strong> base so requests use same-origin paths such as <code>/api/v1/...</code> (required for HTTPS local dev; see <a href="/docs/configuration-web/vite#https-local-development-and-the-api-base-url">Vite (SvelteKit) → HTTPS local development</a>). In non-dev builds when the variable is still unset, the fallback is <Badge text="http://localhost:3000" variant="new" />.

<Callout type="note" title="Vite env changes require restart/rebuild">
When you change <Badge text="VITE_*" variant="envWeb" /> values, restart the web dev server or rebuild so Vite picks them up.
</Callout>

## What each section is for

### `CONFIG_SCHEMA_BACKEND`

- **What it controls**: where the web app sends API requests.
- **Common changes**:
  - <strong>Local HTTPS</strong> — leave <Badge text="VITE_API_BASE_URL" variant="envWeb" /> unset so the dev server proxies <code>/api</code> to the API (see <a href="/docs/configuration-web/vite">Vite (SvelteKit)</a>).
  - <strong>Explicit origin</strong> — set <Badge text="VITE_API_BASE_URL" variant="envWeb" /> when you need a fixed API URL (for example production or a custom port).
  - Point production web → production API (via your hosting env/secret injection)

### `CONFIG_SCHEMA_COMPANY`

- **What it controls**: company/legal identity shown across the site.
- **Common changes**:
  - **Company name** (`NAME`)
  - **Website URL** (`URL`)
  - **Support email** (`SUPPORT_EMAIL`) — static default in the schema (and company config when stored)
  - **Legal name / VAT / address** (`LEGAL_NAME`, `VAT_ID`, `COMPANY_ADDRESS`)
- **Where it appears** (examples): About page and legal pages. Secret admin email sending uses <Badge text="SITE_NAME" variant="envBackend" /> + <Badge text="SENDER_EMAIL_ADDRESS" variant="envBackend" /> on the backend; the email manager may still show the schema support email as read-only context.

### `CONFIG_SCHEMA_LANDING_PAGE`

- **What it controls**: default public home/landing page copy and toggles.
- **Common changes**:
  - **Hero title / slogan** (`HERO_TITLE`, `HERO_SLOGAN`)
  - **Top banner toggle** (`ACTIVE_TOP_BANNER`)
  - **Product demo video** (`DEMO_SUBTITLE`, `DEMO_TITLE`, `DEMO_DESCRIPTION`, `DEMO_YOUTUBE_VIDEO_ID`, `DEMO_THUMBNAIL_ALT`)
  - **Secondary feature sections** (`FEATURE_1_*` … `FEATURE_5_*` — subtitle, title, description per block)
  - **Landing FAQ section** (`FAQ_SUBTITLE`, `FAQ_TITLE`, `FAQ_DESCRIPTION` on the home page)
- **Public FAQ section** (`CONFIG_SCHEMA_PUBLIC_FAQ` — `SUBTITLE`, `TITLE`, `DESCRIPTION` on `/pricing#faq`; Q&A copy lives in code at `publicFaqCatalog.ts`)

### Navigation and footer constants

<code>config.ts</code> also exports navigation/footer link constants (for example <Badge text="PUBLIC_NAVBAR_LINKS" variant="default" /> and <Badge text="PUBLIC_FOOTER_LINKS" variant="default" />). These are not env-driven; they’re static defaults used by the public layout.

Meta tags, keywords, and social links live under <Badge text="CONFIG_SCHEMA_MARKETING" variant="path" /> — see <a href="/docs/configuration-web/seo">SEO & marketing defaults</a>.

<Callout type="tip" title="Defaults vs stored config">
If your backend provides stored company or marketing configuration, pages typically prefer the stored values and fall back to these schema defaults when a field is missing.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Vite (SvelteKit)" description="VITE_* values for API/Supabase/Stripe/analytics" href="/docs/configuration-web/vite" />
<LinkCard title="SEO & marketing defaults" description="Meta tags and social links in CONFIG_SCHEMA_MARKETING" href="/docs/configuration-web/seo" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>

