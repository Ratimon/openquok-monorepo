---
title: Overview - Integrations APIs
description: Programmatic endpoints for connecting social channels, inspecting their capabilities, and invoking provider-specific tools using an organization API key.
order: 0
lastUpdated: 2026-05-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

This section covers the **programmatic** integration endpoints under <Badge text="/api/v1/public" variant="default" />. They're designed for **servers, scripts, and AI agents** that authenticate with an **organization API key** in the <Badge text="Authorization" variant="default" /> header — distinct from the session-scoped <Badge text="/api/v1/integrations/*" variant="default" /> routes the web app uses for logged-in users.

Together, the three endpoints below cover the full lifecycle of a connected channel from the API side: **connect** a new channel via OAuth, **inspect** what it supports, and **invoke** an allow-listed provider method.

<Callout type="note" title="Scope of this section">
<p>OAuth <strong>callback</strong> exchange (the redirect that finalizes a connection) is handled internally by the web app and is intentionally <strong>not</strong> part of the public API surface — see <a href="/docs/apis-integrations/connect#after-the-redirect">Connect Channel → After the redirect</a>.</p>
</Callout>

## Endpoints

<CardGrid>
<LinkCard title="Connect Channel (OAuth)" description="Generate an OAuth authorization URL for a provider — the first step in connecting a new channel" href="/docs/apis-integrations/connect" />
<LinkCard title="Channel settings & tools" description="Fetch rules, max post length, settings schema, and the allow-listed tools for a connected channel" href="/docs/apis-integrations/integration-settings" />
<LinkCard title="Trigger a channel tool" description="Invoke an allow-listed provider method on a connected channel (e.g. list subreddits, fetch playlists)" href="/docs/apis-integrations/integration-trigger" />
</CardGrid>

## Typical flow

1. <strong>Connect</strong> — call <Badge text="GET /public/social/{integration}" variant="default" />, redirect the user to the returned URL, and let the provider complete the OAuth handshake. The new channel then appears in <Badge text="GET /public/integrations" variant="default" />.
2. <strong>Inspect</strong> — call <Badge text="GET /public/integration-settings/{id}" variant="default" /> to discover the channel's <code>rules</code>, <code>maxLength</code>, <code>settings</code> schema, and the list of allow-listed <code>tools</code>.
3. <strong>Invoke</strong> — for any tool advertised in step&nbsp;2, call <Badge text="POST /public/integration-trigger/{id}" variant="default" /> with the <code>methodName</code> and (optionally) a <code>data</code> payload matching that tool's <code>dataSchema</code>.

## Related Section(s)

<CardGrid>
<LinkCard title="Public API" description="Entry point for the programmatic API surface and OpenAPI playground" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI" description="Same endpoints, surfaced as openquok integrations:list/settings/trigger commands" href="/docs/getting-started-for-cli" />
<LinkCard title="Social integration" description="Backend env vars and provider dashboards (Meta, Threads, Instagram, …) that back these endpoints" href="/docs/social-integration" />
</CardGrid>
