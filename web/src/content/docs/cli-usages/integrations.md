---
title: Integrations
description: Discover connected channels, fetch each provider's settings schema, and trigger allow-listed provider tools.
order: 2
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

`integrations:*` wraps the <a href="/docs/apis-integrations">Integrations APIs</a>. Use it to enumerate the channels your API key has access to, inspect what each provider supports, and dispatch one-off tool calls (e.g. fetch followers, list boards) without leaving the CLI.

<Callout type="note" title="OAuth happens in the web UI">
<p>Connecting a brand-new channel still goes through the web app's OAuth flow (see <a href="/docs/social-integration">Social integrations</a>). Once connected, every other operation — listing, inspecting settings, triggering provider tools, deleting — is available from the CLI.</p>
</Callout>

## List connected channels

```bash
openquok integrations:list
```

Pipe through `jq` to extract just the identifying fields:

```bash
openquok integrations:list | jq '.[] | {id, identifier, name}'
```

Find a specific provider by identifier:

```bash
openquok integrations:list | jq '.[] | select(.identifier=="threads")'
openquok integrations:list | jq '.[] | select(.identifier | startswith("instagram"))'
```

Capture an integration UUID into a shell variable for later commands:

```bash
INTEGRATION_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="threads") | .id')
```

## Inspect a channel's settings

`integrations:settings` returns the **rules**, **max post length**, **settings schema**, and the list of allow-listed **tools** the channel exposes. Run it before scripting a new platform so you know which `--settings` keys to send to `posts:create`.

```bash
openquok integrations:settings 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b
```

Show only the tool list (the input for `integrations:trigger`):

```bash
openquok integrations:settings 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b \
  | jq .output.tools
```

Show the maximum content length the provider accepts:

```bash
openquok integrations:settings 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b \
  | jq '.output.maxLength'
```

<Callout type="tip" title="Settings schema first">
<p>Each <code>output.tools[]</code> entry has a <code>methodName</code> (the second positional for <code>integrations:trigger</code>) and a <code>dataSchema</code> describing the JSON object it expects in <code>--data</code>. Validate your payload against that schema locally before scripting it into a loop.</p>
</Callout>

## Trigger a provider tool

`integrations:trigger` dispatches a single allow-listed provider method on a connected channel. Pass JSON input with `--data` (alias `-d`).

```bash
openquok integrations:trigger 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b getThings
openquok integrations:trigger 4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b searchThings \
  --data '{"query":"openquok"}'
```

The response shape is provider-specific. Most tools return a top-level <code>output</code> array of entries that expose <code>id</code>, <code>value</code>, and <code>name</code> fields you can feed back into `posts:create --providerSettingsByIntegrationId`.

## Discovery workflow

When working with a channel for the first time:

```bash
INTEGRATION_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="threads") | .id')

openquok integrations:settings "$INTEGRATION_ID" | jq '{maxLength: .output.maxLength, tools: [.output.tools[].methodName]}'

openquok integrations:trigger "$INTEGRATION_ID" getThings | jq '.output[0:3]'

openquok posts:create \
  --scheduledAt "2026-01-15T12:00:00Z" \
  --body "Hello, world!" \
  --integrationIds "$INTEGRATION_ID"
```

## Disconnecting a channel

<p>The CLI does not currently expose an <code>integrations:delete</code> verb. Disconnect a channel from the Integrations page in the web UI, or call the underlying <Badge text={"DELETE /public/integrations/{id}"} variant="default" /> endpoint via the SDK — see <a href="/docs/apis-integrations/delete">Delete Channel</a>.</p>

<Callout type="warning" title="Removing a channel is destructive">
<p>Once an integration row is deleted, any <code>scheduled</code> post that targeted it fails at publish time with <code>integration_not_found</code>. Cancel impacted post groups with <a href="/docs/cli-usages/managing-posts">`openquok posts:delete-group`</a> first.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Managing Posts" description="Use integration UUIDs from `integrations:list` as `--integrationIds`" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Analytics" description="Run `analytics:platform` against the same integration UUIDs" href="/docs/cli-usages/analytics" />
<LinkCard title="Integrations APIs" description="Underlying REST endpoints used by every `integrations:*` command" href="/docs/apis-integrations" />
<LinkCard title="Social integrations" description="One-time OAuth setup for each provider (Meta Threads, Instagram, …)" href="/docs/social-integration" />
</CardGrid>
