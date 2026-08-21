---
title: Dev.to
description: Connect Dev.to to OpenQuok with a personal API key — and schedule markdown articles.
order: 9
lastUpdated: 2026-08-20
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Dev.to publishing uses a <strong>personal API key</strong> you paste in the OpenQuok dashboard. There is no operator-registered developer app and <strong>no</strong> backend env vars such as a client ID or secret. OpenQuok stores the key on the connected channel and publishes markdown articles through the DEV Community API.

CLI walkthroughs: <a href="/docs/cli-examples/devto">CLI Examples — Dev.to</a>.

<Callout type="note" title="Dashboard connect only">
<p>Connect Dev.to in the workspace (<strong>Add Channel</strong>). <Badge text="GET /api/v1/public/social/devto" variant="path" /> returns <strong>400</strong> — there is no public OAuth start URL for this channel.</p>
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Connect | Personal API key from DEV Settings → Extensions |
| Article body | Markdown in the normal composer (no separate markdown editor) |
| Title | Required; at least <strong>2</strong> characters |
| Tags | Up to <strong>4</strong> names |
| Cover image | Optional; recommended <strong>1000×420</strong> |
| Organization | Optional; publish under an organization the key can access |
| Canonical URL | Optional syndication URL |
| Tools | <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" /> via <Badge text="integrations:trigger" variant="default" /> |
| Body length | Up to <strong>100,000</strong> characters |

### Not supported

| Feature | Notes |
| --- | --- |
| Operator OAuth app | No OpenQuok env keys; users paste their own API key |
| Public OAuth connect | Dashboard only |
| Series | Not implemented |
| Date-range analytics | Not implemented |
| Follow-up comments | Not implemented |

## Create an API key

<Steps>

### Open DEV Settings → Extensions

Sign in to Dev.to and open <DocsExternalLink href="https://dev.to/settings/extensions">Settings → Extensions</DocsExternalLink>.

### Generate a key

Create an API key. Copy it once — OpenQuok stores it on the channel after you paste it.

### Connect in OpenQuok

In the workspace, choose <strong>Add Channel</strong> → <strong>Dev.to</strong>, paste the key, and connect. OpenQuok calls the DEV current-user endpoint to confirm the key, then saves the channel.

To refresh an existing channel, open the same credentials form (do not expect a platform OAuth redirect).

</Steps>

<Callout type="warning" title="Treat the key as a secret">
<p>Anyone with the key can publish as that Dev.to user. Rotate it in DEV Settings if it leaks, then reconnect the channel in OpenQuok.</p>
</Callout>

## Compose settings

The post <strong>body</strong> is markdown. Title, tags, cover, organization, and canonical URL live in Dev.to settings (composer or CLI).

| Setting | Keys |
| --- | --- |
| Title | <Badge text="title" variant="param" /> or <Badge text="devto.title" variant="param" /> (required, min 2 characters) |
| Tags | <Badge text="tags" variant="param" /> — up to 4 names; strings or value/label objects |
| Cover | <Badge text="main_image" variant="param" /> / <Badge text="mainImage" variant="param" /> with a <Badge text="path" variant="param" /> from a prior upload |
| Canonical URL | <Badge text="canonical" variant="param" /> (aliases <Badge text="canonical_url" variant="param" />, <Badge text="canonicalUrl" variant="param" />) |
| Organization | <Badge text="organization" variant="param" /> (id; aliases <Badge text="organization_id" variant="param" />, <Badge text="organizationId" variant="param" />) |

Discover the typed schema with <Badge text="openquok integrations:settings" variant="default" />. List tag and organization options with <Badge text="openquok integrations:trigger" variant="default" /> <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" />.

## Self-host

Dev.to needs <strong>no</strong> operator OAuth pair. Leave the social-app ID/secret rows in <Badge text="infra/self-host/.env.example" variant="path" /> unchanged. Users still paste an API key in the dashboard after the stack is up. See <a href="/docs/installation/docker-compose">Self-host — Docker Compose</a>.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="posts:create with title, tags, canonical URL, and organization" href="/docs/cli-examples/devto" />
<LinkCard title="Adding a provider" description="OAuth vs credentials-in-app contributor checklist" href="/docs/developer-guidelines/add-provider" />
</CardGrid>
