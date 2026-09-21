---
title: Approved apps
description: Third-party apps that can access your workspace — review and revoke access.
order: 5
lastUpdated: 2026-09-21
---

<script>
import { Badge, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Approved apps

> Third-party apps that can access your workspace — review and revoke access.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Approved Apps" variant="default" /> (<a href="/account/settings?section=approved-apps">/account/settings?section=approved-apps</a>).

<p>This settings' tab lists apps that completed OpenQuok OAuth for your account. They are not posting channels. They are integrations, automations, or partner tools that access your workspace.</p>

![Approved App Setting](/docs/_assets/settings/approved-app-setting.webp)

<p>Each row shows the app name, an optional description, and <strong>Authorized on</strong>. Click <Badge text="Revoke" variant="new" /> and confirm to remove access. After you confirm, the app can no longer use your workspace.</p>

<p>To use it again, sign in through the app and approve access when it asks. Review the list when staff, vendors, or tools change. See <a href="/docs/oauth2-for-apps">OAuth2 for apps</a> for registration and consent.</p>

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="OAuth2 for apps" description="How third-party apps register and request user consent" href="/docs/oauth2-for-apps" />
<LinkCard title="Node.js OAuth example" description="Authorization Code flow and Bearer opo_ token" href="/docs/oauth2-for-apps/nodejs-example" />
<LinkCard title="Developers" description="Programmatic token, MCP snippets, and OAuth apps for your workspace" href="/docs/settings/developers" />
<LinkCard title="Team" description="Invite members and rotate access when staff changes" href="/docs/settings/team" />
<LinkCard title="Connect a channel" description="OAuth for posting channels — separate from approved apps" href="/docs/channels/connect" />
<LinkCard title="Public API overview" description="API keys, SDK quickstart, and OAuth for integrators" href="/docs/getting-started-for-public-api" />
</CardGrid>
