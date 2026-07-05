---
title: Overview - OAuth2 for apps
description: Build third-party OpenQuok apps that act on behalf of subscribed users using OAuth2 Authorization Code flow.
order: 0
lastUpdated: 2026-07-05
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

<Callout type="note">
<p><strong>This section</strong> is for apps you register under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> (client ID <Badge text="oqc_" variant="default" />). For automation in <strong>your own</strong> workspace — scripts and CI — rotate a programmatic token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> instead. See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a> and <a href="/docs/getting-started-for-cli/authentication#programmatic-token">CLI programmatic token</a>.</p>
</Callout>

## Overview

OpenQuok supports OAuth2 **Authorization Code** flow, allowing you to build **third-party applications** that act on behalf of OpenQuok users.

Your app redirects users to OpenQuok where they approve access, and you receive an <Badge text="opo_" variant="default" /> access token to call the public API on their behalf.

<CardGrid>
<LinkCard title="Implementation" description="Register your app, Authorization Code flow, API calls, and credential management" href="/docs/oauth2-for-apps/implementation" />
<LinkCard title="Node.js example" description="Copy-paste Express server with Authorization Code flow" href="/docs/oauth2-for-apps/nodejs-example" />
<LinkCard title="Error reference" description="OAuth callback and token exchange error codes" href="/docs/oauth2-for-apps/error-reference" />
</CardGrid>

## Related configuration

<CardGrid>
<LinkCard title="Public API authentication" description="Workspace programmatic tokens (opo_) vs third-party OAuth" href="/docs/getting-started-for-public-api#authentication" />
<LinkCard title="Admin: OAuth apps" description="Redirect URLs for hosted vs self-hosted servers and operator notes" href="/docs/admin/oauth-server" />
<LinkCard title="Configuration - Backend" description="Backend env vars and public API surfaces" href="/docs/configuration-backend" />
</CardGrid>
