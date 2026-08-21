---
title: Dev.to
description: OpenQuok CLI examples for Dev.to — markdown articles with title, tags, series, organization, and analytics.
order: 9
lastUpdated: 2026-08-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="devto" variant="default" /> |
| Max body length | 100,000 characters (<Badge text="-c" variant="param" /> markdown) |
| Required attachments | None — markdown body plus a title |
| Connect | Dashboard API key (not <Badge text="GET /public/social/devto" variant="path" />) |
| Setup guide | <a href="/docs/social-integration/devto">Dev.to</a> |

```bash
DEVTO_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="devto") | .id')
```

Connect the channel in the workspace first. The CLI cannot start a Dev.to OAuth URL.

## Article with title and tags

The post body is markdown. Set <strong>title</strong> (min 2 characters) and up to <strong>4</strong> tags in settings:

```bash
openquok posts:create \
  -c "Technical writing cadence — queue this markdown article before it stalls in drafts." \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-id>" \
  --settings '{"title":"Keep technical posts shipping","tags":["webdev","productivity"]}'
```

## Nested devto bucket

The backend accepts <strong>flat</strong> keys and a nested <Badge text="devto" variant="default" /> bucket (same shape as the web composer):

```bash
openquok posts:create \
  -c "Scheduled from the CLI." \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-id>" \
  --providerSettingsByIntegrationId '{"<integration-id>":{"devto":{"title":"Weekly changelog","tags":[{"value":"webdev","label":"webdev"},{"value":"opensource","label":"opensource"}]}}}'
```

## Series

Pass a free-text series name. Dev.to creates the series if it does not already exist:

```bash
openquok posts:create \
  -c "Part of an ongoing shipping-notes series." \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-id>" \
  --settings '{"title":"Shipping notes — week 12","series":"Shipping notes","tags":["webdev"]}'
```

## Canonical URL

When the long-form post already lives on your site, pass a canonical URL:

```bash
openquok posts:create \
  -c "This tutorial already lives on our docs site. Dev.to should point at the original." \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-id>" \
  --settings '{"title":"Syndicate this tutorial without losing the original URL","canonical":"https://example.com/blog/tutorial","tags":["webdev"]}'
```

## Cover image and organization

Upload a cover (recommended 1000×420), then pass its storage path. Resolve an organization id with <Badge text="integrations:trigger" variant="default" /> <Badge text="organizations" variant="default" /> first:

```bash
test -f ./cover.webp && test -s ./cover.webp
COVER_PATH=$(openquok upload ./cover.webp | jq -r '.data.path // .data.filePath')
openquok integrations:trigger "<integration-id>" organizations
openquok posts:create \
  -c "Release notes for the latest workspace update." \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-id>" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "<integration-id>" --arg cover "$COVER_PATH" '{($id):{devto:{title:"Workspace update — what shipped this week",organization:12345,tags:[{value:"opensource",label:"opensource"}],mainImage:{path:$cover}}}}')"
```

Replace <code>12345</code> with an <Badge text="id" variant="param" /> from the <Badge text="organizations" variant="default" /> tool output.

## List tags and organizations

```bash
openquok integrations:settings "$DEVTO_ID"
openquok integrations:trigger "$DEVTO_ID" tags
openquok integrations:trigger "$DEVTO_ID" organizations
```

## Platform analytics

Account-wide page views, reactions, and comments over <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" /> days:

```bash
openquok analytics:platform "$DEVTO_ID" -d 30
```

## Post insights

Per-article metrics for a <strong>published</strong> Dev.to post (page views, reactions, comments):

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="devto") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```

<Callout type="note" title="Validation">
<p>Title must be at least 2 characters. At most 4 tags. Follow-up comments are not supported. Drafts and queued rows return empty analytics until the article is published. Run <Badge text="integrations:settings" variant="default" /> for <code>output.rules</code> and <code>output.settings</code> before batch scripts.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Dev.to setup guide" description="Personal API key from DEV Settings → Extensions — no operator env vars" href="/docs/social-integration/devto" />
<LinkCard title="Analytics" description="analytics:platform and analytics:post windows and response shape" href="/docs/cli-usages/analytics" />
<LinkCard title="Managing posts" description="posts:create, posts:list, and status commands" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Integrations" description="integrations:settings and integrations:trigger" href="/docs/cli-usages/integrations" />
</CardGrid>
