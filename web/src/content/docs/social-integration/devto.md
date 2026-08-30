---
title: Dev.to
description: Connect Dev.to to OpenQuok with a personal API key — and schedule markdown articles.
order: 9
lastUpdated: 2026-08-21
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Dev.to publishing uses a <strong>personal API key</strong> you paste in the dashboard. There is no operator-registered developer app and <strong>no</strong> backend env vars such as a client ID or secret. OpenQuok keeps the key on the server so workers can publish markdown articles through the DEV Community API.

CLI walkthroughs: <a href="/docs/cli-examples/devto">CLI Examples — Dev.to</a>.

<Callout type="note" title="Dashboard connect only">
<strong>Add Dev.to Channel</strong><p> in the workspace . <Badge text="GET /api/v1/public/social/devto" variant="path" /> returns <strong>400</strong> — there is no public OAuth start URL for this channel.</p>
</Callout>

## How OpenQuok stores the API key

OpenQuok needs a <strong>reversible</strong> copy of the key to call DEV on your behalf (one-way hashing is not an option for publishing).

| Layer | What happens |
| --- | --- |
| Browser | You paste once in Add Channel. The key is <strong>not</strong> kept in <code>localStorage</code> or other client storage. |
| HTTP APIs | List, connect, and public integration responses <strong>omit</strong> token fields — the browser never reads the key back. |
| Database | The key is stored as AES-GCM ciphertext on the connected channel (when <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> or <Badge text="SECURITY_SECRET" variant="envBackend" /> is set) so the API and publish workers can decrypt it only when publishing, refreshing, or triggering tools. Treat it like a password. |

OpenQuok uses field-level encryption at rest for provider secrets when a server encryption key is configured. Protect that key and database backups the same way you protect other server secrets. If the Dev.to key leaks, rotate it in DEV Settings → Extensions, then reconnect the channel in OpenQuok.

<Callout type="warning" title="Treat the key as a secret">
<p>Anyone with the key can publish as that Dev.to user. Rotate it in DEV Settings if it leaks, then reconnect the channel in OpenQuok.</p>
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
| Series | Optional free-text name; Dev.to creates the series if missing |
| Canonical URL | Optional syndication URL |
| Analytics | Account and per-article page views, reactions, and comments (<Badge text="7" variant="param" /> / <Badge text="30" variant="param" /> / <Badge text="90" variant="param" /> days) |
| Tools | <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" /> via <Badge text="integrations:trigger" variant="default" /> |
| Body length | Up to <strong>100,000</strong> characters |

### Not supported

| Feature | Notes |
| --- | --- |
| Operator OAuth app | No OpenQuok env keys; users paste their own API key |
| Public OAuth connect | Dashboard only |
| Follow-up comments | Not implemented |

## Create an API key

<Steps
	howToName="Dev.to Setup"
	howToDescription="Connect Dev.to to OpenQuok with a personal API key — and schedule markdown articles."
>

### Open DEV Settings → Extensions

Sign in to Dev.to and open <DocsExternalLink href="https://dev.to/settings/extensions">Settings → Extensions</DocsExternalLink>.

### Generate a key

Create an API key. Copy it once — OpenQuok keeps it on the server for publishing after you paste it (see <a href="#how-openquok-stores-the-api-key">How OpenQuok stores the API key</a>).

![Step 1 - Generate an devto key](/docs/_assets/social-integration/devto/generate-api-key.webp)

### Connect in OpenQuok

In the workspace, choose <strong>Add Channel</strong> → <strong>Dev.to</strong>, paste the key, and connect. OpenQuok calls the DEV current-user endpoint to confirm the key, then saves the channel.

To refresh an existing channel, open the same credentials form (do not expect a platform OAuth redirect).

</Steps>

## Compose settings

The post <strong>body</strong> is markdown. Title, tags, cover, organization, series, and canonical URL live in Dev.to settings (composer or CLI).

| Setting | Keys |
| --- | --- |
| Title | <Badge text="title" variant="param" /> or <Badge text="devto.title" variant="param" /> (required, min 2 characters) |
| Tags | <Badge text="tags" variant="param" /> — up to 4 names; strings or value/label objects |
| Cover | <Badge text="main_image" variant="param" /> / <Badge text="mainImage" variant="param" /> with a <Badge text="path" variant="param" /> from a prior upload |
| Canonical URL | <Badge text="canonical" variant="param" /> (aliases <Badge text="canonical_url" variant="param" />, <Badge text="canonicalUrl" variant="param" />) |
| Organization | <Badge text="organization" variant="param" /> (id; aliases <Badge text="organization_id" variant="param" />, <Badge text="organizationId" variant="param" />) |
| Series | <Badge text="series" variant="param" /> or <Badge text="devto.series" variant="param" /> — free-text name; creates the series on Dev.to if missing |

Discover the typed schema with <Badge text="openquok integrations:settings" variant="default" />. List tag and organization options with <Badge text="openquok integrations:trigger" variant="default" /> <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" />.

## Self-host

Dev.to needs <strong>no</strong> operator OAuth pair. Leave the social-app ID/secret rows in <Badge text="infra/self-host/.env.example" variant="path" /> unchanged. Users still paste an API key in the dashboard after the stack is up. See <a href="/docs/installation/docker-compose">Self-host — Docker Compose</a>.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="posts:create with title, tags, series, and organization; analytics:platform and analytics:post" href="/docs/cli-examples/devto" />
<LinkCard title="Adding a provider" description="OAuth vs credentials-in-app contributor checklist" href="/docs/contribution-opportunities/add-provider" />
<LinkCard title="Security guidelines" description="Service key rules, channel credentials at rest, and RLS" href="/docs/developer-guidelines/security" />
</CardGrid>
