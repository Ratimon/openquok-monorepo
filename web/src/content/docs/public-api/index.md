---
title: Overview - Public API
description: Getting Started automate your Social Scheduling with Openquok 's public api.
order: 0
lastUpdated: 2026-05-11
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Installation

<CardGrid>
<LinkCard title="Development environment" description="Local development commands" href="/docs/installation/development-environment" />
<LinkCard title="Vercel" description="Vercel-focused deployment detail for backend and web" href="/docs/installation/vercel" />
</CardGrid>

## API reference pages

Add **`openapi: 'METHOD /path'`** to YAML frontmatter. With the backend running so **`GET /api/v1/openapi.json`** matches your **`@openapi`** blocks in **`backend/swagger/jsdoc/*.doc.ts`**, **`/docs`** shows request/response panels and an **OpenAPI playground** for that operation.

## Related Section(s)

