---
title: Overview - Integrations APIs
description: Programmatic endpoints for connecting social channels, and invoking provider-specific tools using a workspace programmatic token.
order: 0
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List Integrations" description="Return every connected social channel for the token's workspace" href="/docs/apis-integrations/list" />
<LinkCard title="Connect Channel (OAuth)" description="Generate an OAuth authorization URL for a provider — the first step in connecting a new channel" href="/docs/apis-integrations/connect" />
<LinkCard title="Delete Channel" description="Soft-delete a connected channel so it stops publishing and disappears from List Integrations" href="/docs/apis-integrations/delete" />
<LinkCard title="Check Connection" description="Lightweight healthcheck — confirm the supplied programmatic or OAuth app token is accepted" href="/docs/apis-integrations/is-connected" />
<LinkCard title="Channel settings & tools" description="Fetch rules, max post length, settings schema, and the allow-listed tools for a connected channel" href="/docs/apis-integrations/integration-settings" />
<LinkCard title="Trigger a channel tool" description="Invoke an allow-listed provider method on a connected channel" href="/docs/apis-integrations/integration-trigger" />
</CardGrid>

<Callout type="note">
<p>OAuth <strong>callback</strong> exchange (the redirect that finalizes a connection) is handled internally by the web app and is intentionally <strong>not</strong> part of the public API surface — see <a href="/docs/apis-integrations/connect#after-the-redirect">Connect Channel → After the redirect</a>.</p>
</Callout>

## Typical flow

1. <strong>Connect</strong> — call <Badge text={"GET /public/social/{integration}"} variant="default" />, redirect the user to the returned URL, and let the provider complete the OAuth handshake. The new channel then appears in <Badge text="GET /public/integrations" variant="default" />.
2. <strong>Inspect</strong> — call <Badge text={"GET /public/integration-settings/{id}"} variant="default" /> to discover the channel's <code>rules</code>, <code>maxLength</code>, <code>settings</code> schema, and the list of allow-listed <code>tools</code>.
3. <strong>Invoke</strong> — for any tool advertised in step&nbsp;2, call <Badge text={"POST /public/integration-trigger/{id}"} variant="default" /> with the <code>methodName</code> and (optionally) a <code>data</code> payload matching that tool's <code>dataSchema</code>.

## Related Section(s)

<CardGrid>
<LinkCard title="Public API" description="Entry point for the programmatic API surface and OpenAPI playground" href="/docs/getting-started-for-public-api" />
<LinkCard title="Posts APIs" description="Schedule, update, and delete post groups against the connected channels you list here" href="/docs/apis-posts" />
<LinkCard title="Uploads APIs" description="Upload media to attach to scheduled posts" href="/docs/apis-uploads" />
<LinkCard title="CLI" description="Same endpoints, surfaced as openquok CLI commands" href="/docs/getting-started-for-cli" />
<LinkCard title="Self-host: Social integration" description="Backend env vars and provider dashboards (e.g. Meta, Threads, Instagram)" href="/docs/social-integration" />
</CardGrid>
