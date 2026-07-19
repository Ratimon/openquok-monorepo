---
title: Global Plugs
description: Configure channel-level engagement rules (auto-reply, repost when likes cross a threshold) via the CLI.
order: 3
lastUpdated: 2026-07-19
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The <Badge text="plugs:*" variant="default" /> commands wrap the global plug endpoints under <a href="/docs/apis-integrations">Integrations APIs</a>. Use them to manage <strong>channel-level</strong> rules that fire when a published post crosses a likes threshold.

<Callout type="note" title="Internal vs global plugs">
<p><strong>Internal plugs</strong> (same-account replies, cross-account comments on create) are set on <Badge text="posts:create" variant="default" /> via <Badge text="providerSettingsByIntegrationId" variant="param" /> — not these commands. See <a href="/docs/getting-started-for-public-api#plugs">Public API → Plugs</a> and <a href="/docs/cli-examples/threads">Threads CLI examples</a>.</p>
</Callout>

## Plug catalog

```bash
openquok plugs:catalog
```

Filter to one provider:

```bash
openquok plugs:catalog | jq '.plugs[] | select(.identifier=="threads")'
```

Use each catalog entry's <Badge text="methodName" variant="param" /> as <Badge text="--func" variant="param" /> on upsert. Field names match <Badge text="fields[].name" variant="param" /> in the catalog JSON.

## List saved rules

```bash
openquok plugs:list <integration-id>
```

## Create or update a rule

```bash
openquok plugs:upsert <integration-id> \
  --func autoPlugPost \
  --fields '[{"name":"likesAmount","value":"100"},{"name":"post","value":"Thanks for reading!"}]'
```

Pass <Badge text="--plug-id" variant="param" /> to update an existing row instead of creating another rule for the same plug type.

## Pause, resume, or delete

```bash
openquok plugs:activate <plug-id> --activated false
openquok plugs:activate <plug-id> --activated true
openquok plugs:delete <plug-id>
```

## Related

<CardGrid>
<LinkCard title="Upsert Global Plug" description="POST /public/integration-plugs/{id} request body and response" href="/docs/apis-integrations/integration-plugs-upsert" />
<LinkCard title="Integrations" description="List channels and channel groups before configuring plugs" href="/docs/cli-usages/integrations" />
<LinkCard title="Public API → Plugs" description="Internal vs global plugs, curl examples, and SDK usage" href="/docs/getting-started-for-public-api#plugs" />
</CardGrid>
