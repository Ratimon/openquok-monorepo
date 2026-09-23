---
title: Known issues
description: OpenQuok limitations and environment pitfalls we track, with workarounds where they exist.
order: 5
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Known issues

> Confirmed behavior that may look like a bug, plus workarounds when we have one.

We remove entries when a fix ships. If something is missing, report it on <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/issues">GitHub</DocsExternalLink> or <a href="/docs/help">Discord</a>.

## Channel connect

### Invalid state on self-host with more than one API instance

OAuth state lives in cache for about one hour. If production uses in-memory cache across multiple API replicas, connect can fail with <Badge text="Invalid state" variant="param" /> even when you follow the flow correctly.

**Workaround:** use Redis for <Badge text="CACHE_PROVIDER" variant="envBackend" /> — <a href="/docs/troubleshooting/oauth-connect">OAuth and channel connect</a> and <a href="/docs/configuration-backend/redis">Redis cache</a>.

## Uploads

### Dashboard upload may not cancel cleanly

Closing the dialog or navigating away during an active upload can leave a partial upload running. The library may show the file only after the transfer finishes.

**Workaround:** wait for completion, then delete the asset from the library or post if you did not want it. Multipart API uploads can call <Badge text="abort-multipart" variant="param" /> — <a href="/docs/apis-uploads/abort-multipart">Abort multipart</a>.

## Public API

### Large JSON post bodies

Default JSON body size is about **10 MB**. Inlining big base64 blobs in create-post requests triggers payload errors.

**Workaround:** upload media first, then reference <Badge text="id" variant="param" /> and <Badge text="path" variant="param" /> — <a href="/docs/troubleshooting/uploads">Uploads and media</a>.

## Where to report new bugs

<Callout type="warning">
<p>Do not post API keys, OAuth secrets, or payment details in Discord or public GitHub issues. Use <a href="mailto:admin@openquok.com">admin@openquok.com</a> for account-specific secrets on Cloud.</p>
</Callout>

| Channel | Best for |
| --- | --- |
| <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/issues">GitHub issues</DocsExternalLink> | Reproducible defects with version and steps |
| <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink> | Quick questions, screenshots, self-host setup |
| <a href="mailto:admin@openquok.com">admin@openquok.com</a> | Cloud billing and account-specific problems |

## Related

<CardGrid>
<LinkCard title="Help" description="How to ask so you get a useful answer" href="/docs/help" />
<LinkCard title="Troubleshooting overview" description="Topic index for common fixes" href="/docs/troubleshooting" />
</CardGrid>
