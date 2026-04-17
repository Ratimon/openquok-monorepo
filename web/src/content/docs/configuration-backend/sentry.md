---
title: Sentry
description: Enable backend error monitoring with Sentry 's DSN for Openquok.
order: 3
lastUpdated: 2026-03-30
---

<script>
import { Badge, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Sentry is optional. To enable error monitoring, set <Badge text="SENTRY_DSN" variant="envBackend" /> in your env (get the DSN from <DocsExternalLink href="https://sentry.io">sentry.io</DocsExternalLink> → Project Settings → SDK Setup → Client Keys). If unset, Sentry stays disabled.

## Steps

<Steps>

### Create a Sentry project and copy the DSN

Create a project at <DocsExternalLink href="https://sentry.io">sentry.io</DocsExternalLink> and copy the DSN for the backend.

### Set environment variables

```bash
SENTRY_DSN=
SENTRY_ENABLED=true
```

### Restart the backend

Restart the backend process so the new values are loaded.

</Steps>
