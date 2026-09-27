---
title: Dev.to
description: How to add Dev.to to OpenQuok with a personal API key.
order: 10
lastUpdated: 2026-09-27
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="note">
<p>Operators and self-host installs do not register a Dev.to developer app or add Dev.to operator keys to the backend. Each account just pastes their own API key in the dashboard.</p>
</Callout>

You connect with a <strong>personal API key</strong> from your Dev.to Settings.

<Callout type="danger">
<p>Anyone with the key can publish as that Dev.to user. Revoke it in DEV Settings if it leaks, then reconnect the channel in OpenQuok.</p>
</Callout>

<Callout type="note">
<p>OpenQuok stores the API key on the server in encrypted form (see <a href="#how-openquok-stores-the-api-key">How OpenQuok stores the API key</a>).</p>
</Callout>



## Create an API key

<Steps
	howToName="Dev.to Setup"
	howToDescription="Connect Dev.to to OpenQuok with a personal API key."
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


## Features

### Supported

| Feature | Details |
| --- | --- |
| Connect | Personal API key from DEV Settings → Extensions |
| Article body | Markdown in the post editor (no separate markdown editor) |
| Title | Required; at least <strong>2</strong> characters |
| Tags | Up to <strong>4</strong> names |
| Cover image | Optional; recommended <strong>1000×420</strong> |
| Organization | Optional; publish under an organization the key can access |
| Series | Optional free-text name; Dev.to creates the series if missing |
| Canonical URL | Optional syndication URL |
| Analytics | Account and per-article page views, reactions, and comments (<Badge text="7" variant="param" /> / <Badge text="30" variant="param" /> / <Badge text="90" variant="param" /> days) |
| Tools | <Badge text="tags" variant="default" /> and <Badge text="organizations" variant="default" /> via <Badge text="integrations:trigger" variant="default" /> |
| Body length | Up to <strong>100,000</strong> characters |

<Callout type="tip">
<p>CLI walkthroughs: <a href="/docs/cli-examples/devto">CLI Examples — Dev.to</a>.</p>
</Callout>

### Not supported

| Feature | Notes |
| --- | --- |
| Operator OAuth app | No OpenQuok env keys; users paste their own API key |
| Public OAuth connect | Dashboard only |
| Follow-up comments | Not implemented |

## How OpenQuok stores the API key

Workers need a <strong>reversible</strong> API key on the server to call DEV at publish time (a hash is not enough).

| Layer | What happens |
| --- | --- |
| Browser | Paste once in Add Channel — not kept in <code>localStorage</code> |
| APIs | Connect and list responses omit token fields |
| Database | AES-GCM on the channel when <Badge text="INTEGRATIONS_TOKEN_ENCRYPTION_KEY" variant="envBackend" /> or <Badge text="SECURITY_SECRET" variant="envBackend" /> is set |

Create and rotate keys in <DocsExternalLink href="https://dev.to/settings/extensions">DEV Settings → Extensions</DocsExternalLink>. Protect your server encryption key and database backups like any other secret.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="posts:create with title, tags, series, and organization; analytics:platform and analytics:post" href="/docs/cli-examples/devto" />
<LinkCard title="Adding a provider" description="OAuth vs credentials-in-app contributor checklist" href="/docs/contribution-opportunities/add-provider" />
<LinkCard title="Security guidelines" description="Service key rules, channel credentials at rest, and RLS" href="/docs/developer-guidelines/security" />
</CardGrid>
