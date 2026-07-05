---
title: Error reference
description: OAuth callback and token exchange error codes for OpenQuok third-party apps.
order: 3
lastUpdated: 2026-07-05
---

<script>
import { Badge, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Error reference

| Error | When | Description |
| --- | --- | --- |
| <Badge text="invalid_client" variant="default" /> | Token exchange | Client ID or Client Secret is wrong |
| <Badge text="invalid_grant" variant="default" /> | Token exchange | Code is invalid, expired, or already used |
| <Badge text="unsupported_grant_type" variant="default" /> | Token exchange | <Badge text="grant_type" variant="default" /> is not <Badge text="authorization_code" variant="default" /> |
| <Badge text="access_denied" variant="default" /> | Callback | User denied the authorization request |

## Related

<CardGrid>
<LinkCard title="Implementation" description="Register your app, Authorization Code flow, and credential management" href="/docs/oauth2-for-apps/implementation" />
<LinkCard title="Public API authentication" description="Workspace programmatic tokens vs third-party OAuth" href="/docs/getting-started-for-public-api#authentication" />
<LinkCard title="Admin: OAuth apps" description="Redirect URLs for hosted vs self-hosted servers" href="/docs/admin/oauth-server" />
</CardGrid>
