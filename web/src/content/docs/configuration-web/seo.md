---
title: SEO & marketing defaults
description: Meta tags, keywords, and social links from CONFIG_SCHEMA_MARKETING in the web config schema.
order: 1.5
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Public SEO and marketing copy defaults live in the same schema file as other web defaults:

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/config/constants/config.ts"><Badge text="web/src/lib/config/constants/config.ts" variant="path" /></DocsExternalLink>

The section <Badge text="CONFIG_SCHEMA_MARKETING" variant="path" /> drives **meta title**, **description**, **keywords**, and **social profile links** used when the app falls back to built-in defaults (before or alongside backend-stored config).

## What it controls

- **Meta title & description** — <code>META_TITLE</code>, <code>META_DESCRIPTION</code>
- **Meta keywords** — <code>META_KEYWORDS</code>
- **Social links** — <code>SOCIAL_LINKS_*</code> (icons and URLs shown in marketing surfaces)

Landing hero copy and feature toggles for the public home page are under <Badge text="CONFIG_SCHEMA_LANDING_PAGE" variant="path" /> in the same file; see <a href="/docs/configuration-web/config-defaults">Config defaults</a> for that section.

<Callout type="tip" title="Defaults vs stored config">
If your backend provides stored marketing configuration, pages typically prefer the stored values and fall back to these schema defaults when a field is missing.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Vite (SvelteKit)" description="VITE_* variables for API, Supabase, Stripe, and analytics" href="/docs/configuration-web/vite" />
<LinkCard title="Config defaults" description="Backend URL, company, landing page, and navigation defaults" href="/docs/configuration-web/config-defaults" />
<LinkCard title="Configuration - Web" description="Back to the web configuration hub" href="/docs/configuration-web" />
</CardGrid>
