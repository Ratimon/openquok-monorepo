---
title: Config defaults
description: How the web app derives default values from Vite env and fallbacks.
order: 2
lastUpdated: 2026-03-31
---

<script>
import { Badge, Callout, CardGrid, ExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The web app centralizes its default configuration in:

<ExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/config/constants/config.ts"><Badge text="web/src/lib/config/constants/config.ts" variant="path" /></ExternalLink>

This file exports schema objects like:

- <Badge text="CONFIG_SCHEMA_BACKEND" variant="path" />
- <Badge text="CONFIG_SCHEMA_COMPANY" variant="path" />
- <Badge text="CONFIG_SCHEMA_MARKETING" variant="path" />
- <Badge text="CONFIG_SCHEMA_LANDING_PAGE" variant="path" />

Pages and repositories use these defaults when a value is missing from runtime data (for example when backend-provided config hasn’t been set yet).

## How defaults are chosen

Some defaults are resolved from Vite env first, then fall back to a safe constant.

Examples:

- **API base URL** — <Badge text="VITE_API_BASE_URL" variant="envWeb" /> → fallback `http://localhost:3000`

<Callout type="note" title="Vite env changes require restart/rebuild">
When you change <Badge text="VITE_*" variant="envWeb" /> values, restart the web dev server or rebuild so Vite picks them up.
</Callout>

## What each section is for

### `CONFIG_SCHEMA_BACKEND`

- **What it controls**: where the web app sends API requests.
- **Common changes**:
  - Point local web → local API with <Badge text="VITE_API_BASE_URL" variant="envWeb" />
  - Point production web → production API (via your hosting env/secret injection)

### `CONFIG_SCHEMA_COMPANY`

- **What it controls**: company/legal identity shown across the site.
- **Common changes**:
  - **Company name** (`NAME`)
  - **Website URL** (`URL`)
  - **Support email** (`SUPPORT_EMAIL`) — static default in the schema (and company config when stored)
  - **Legal name / VAT / address** (`LEGAL_NAME`, `VAT_ID`, `COMPANY_ADDRESS`)
- **Where it appears** (examples): About page and legal pages. Secret admin email sending uses <Badge text="SITE_NAME" variant="envBackend" /> + <Badge text="SENDER_EMAIL_ADDRESS" variant="envBackend" /> on the backend; the email manager may still show the schema support email as read-only context.

### `CONFIG_SCHEMA_MARKETING`

- **What it controls**: SEO defaults and social links.
- **Common changes**:
  - **Meta title & description** (`META_TITLE`, `META_DESCRIPTION`)
  - **Meta keywords** (`META_KEYWORDS`)
  - **Social links** (`SOCIAL_LINKS_*`)

### `CONFIG_SCHEMA_LANDING_PAGE`

- **What it controls**: default public home/landing page copy and toggles.
- **Common changes**:
  - **Hero title / slogan** (`HERO_TITLE`, `HERO_SLOGAN`)
  - **Top banner toggle** (`ACTIVE_TOP_BANNER`)

### Navigation and footer constants

`config.ts` also exports navigation/footer link constants (for example `PUBLIC_NAVBAR_LINKS` and `PUBLIC_FOOTER_LINKS`). These are not env-driven; they’re static defaults used by the public layout.

<Callout type="tip" title="Defaults vs stored config">
If your backend provides stored company/marketing configuration, pages typically prefer the stored values and fall back to these schema defaults when a field is missing.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Environment variables" description="VITE_* values for API/Supabase/Stripe/analytics" href="/docs/configuration-web/environment" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>

