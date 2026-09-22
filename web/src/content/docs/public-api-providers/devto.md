---
title: Dev.to Settings
description: OpenQuok public API provider settings for Dev.to — title, tags, canonical URL, organization, series, and cover image for markdown articles.
order: 10
lastUpdated: 2026-09-14
sidebar:
  label: Dev.to Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="devto" variant="default" /> |
| Connect | Dashboard API key — <Badge text="GET /api/v1/public/social/devto" variant="path" /> returns <strong>400</strong> |
| Setup guide | <a href="/docs/social-integration/devto">Dev.to</a> |
| Body cap | **100,000** characters (markdown on top-level <Badge text="body" variant="param" />) |
| Main-post media | Optional cover image in settings — not required on the media strip |

<Callout type="note">
<p>Connect Dev.to in the dashboard with a personal API key (DEV Settings → Extensions). The article <strong>body</strong> is markdown on <Badge text="body" variant="param" />; <Badge text="title" variant="param" /> and optional metadata go in <Badge text="providerSettingsByIntegrationId" variant="param" />.</p>
</Callout>

## Settings on create post

Flat keys and the <Badge text="devto" variant="default" /> nested bucket are both accepted.

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="title" variant="param" /> | <Badge text="devto.title" variant="param" /> | Article title (**≥2** chars, required) |
| <Badge text="tags" variant="param" /> | <Badge text="devto.tags" variant="param" /> | Up to **4** tag names |
| <Badge text="canonical" variant="param" /> | <Badge text="devto.canonical" variant="param" /> | Syndication URL |
| <Badge text="canonical_url" variant="param" /> / <Badge text="canonicalUrl" variant="param" /> | — | Aliases for <Badge text="canonical" variant="param" /> |
| <Badge text="organization" variant="param" /> | <Badge text="devto.organization" variant="param" /> | Numeric org id from trigger tool |
| <Badge text="organization_id" variant="param" /> / <Badge text="organizationId" variant="param" /> | — | Aliases for <Badge text="organization" variant="param" /> |
| <Badge text="series" variant="param" /> | <Badge text="devto.series" variant="param" /> | Series name (created if missing) |
| <Badge text="main_image" variant="param" /> / <Badge text="mainImage" variant="param" /> | <Badge text="devto.mainImage" variant="param" /> | Cover <Badge text="&#123; path &#125;" variant="param" /> from upload |

List tag and organization options with <a href="/docs/apis-integrations/integration-trigger">Trigger integration tool</a> methods <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" />.

```json
{
  "providerSettingsByIntegrationId": {
    "<devto-integration-id>": {
      "title": "Shipping faster with scheduled social posts",
      "tags": ["opensource", "productivity"],
      "canonical": "https://example.com/blog/original-post",
      "main_image": { "path": "FILE_PATH_FROM_UPLOAD" }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="title" variant="param" /> / <Badge text="devto.title" variant="param" /> | string | **Yes** | Minimum **2** characters |
| <Badge text="tags" variant="param" /> / <Badge text="devto.tags" variant="param" /> | array | No | Max **4** — strings or <Badge text="&#123; value, label &#125;" variant="param" /> objects |
| <Badge text="canonical" variant="param" /> | string | No | Optional canonical URL for syndication |
| <Badge text="organization" variant="param" /> | integer | No | From <Badge text="organizations" variant="default" /> trigger tool |
| <Badge text="series" variant="param" /> | string | No | Dev.to creates the series if it does not exist |
| <Badge text="main_image" variant="param" /> / <Badge text="mainImage" variant="param" /> | object | No | <Badge text="path" variant="param" /> from <Badge text="POST /api/v1/public/upload" variant="path" /> |

Run <Badge text="GET /api/v1/public/integrations/:id/settings" variant="path" /> (or <Badge text="openquok integrations:settings" variant="default" />) for the typed <Badge text="settingsSchema" variant="param" /> Dev.to exposes.

## Complete example

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "## Introduction\n\nThis article explains how we schedule Dev.to posts alongside social channels.\n\n## Setup\n\nConnect your API key in the dashboard...",
    "scheduledAt": "2026-05-15T12:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<devto-integration-id>"],
    "isGlobal": true,
    "providerSettingsByIntegrationId": {
      "<devto-integration-id>": {
        "title": "Scheduling Dev.to articles with OpenQuok",
        "tags": ["devops", "writing"],
        "canonical": "https://example.com/blog/scheduling-devto"
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="Provider settings overview" description="Hub catalog — credentials vs OAuth channels" href="/docs/public-api-providers" />
<LinkCard title="Dev.to CLI examples" description="openquok recipes for tags, series, and organizations" href="/docs/cli-examples/devto" />
<LinkCard title="Dev.to setup" description="API key and dashboard connect" href="/docs/social-integration/devto" />
<LinkCard title="Trigger integration tool" description="List tags and organizations before publishing" href="/docs/apis-integrations/integration-trigger" />
<LinkCard title="Writing the post" description="Markdown editor for Dev.to" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Media rules" description="Body and title constraints" href="/docs/platforms/media-rules" />
</CardGrid>
