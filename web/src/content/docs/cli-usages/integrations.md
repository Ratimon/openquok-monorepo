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

The <Badge text="integrations:*" variant="default" />  wraps the <a href="/docs/apis-integrations">Integrations APIs</a>. Use it to enumerate the connected channels, inspect what each provider supports, and dispatch one-off tool calls (e.g. fetch followers, list boards).

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

Capture an integration id into a shell variable for later commands:

```bash
INTEGRATION_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="threads") | .id')
```

## Inspect a channel's settings

The <Badge text="integrations:settings" variant="default" /> returns the **rules**, **max post length**, **settings schema**, and the list of allow-listed **tools** the channel exposes.


```bash
openquok integrations:settings <integration-id>
```

<Callout type="tip">
Run it before scripting a new platform so you know which `--settings` keys to send to `posts:create`.
</Callout>


Show only the tool list (the input for `integrations:trigger`):

```bash
openquok integrations:settings <integration-id> \
  | jq .output.tools
```

Show the maximum content length the provider accepts:

```bash
openquok integrations:settings <integration-id> \
  | jq '.output.maxLength'
```

<Callout type="tip" title="Settings schema first">
<p>Each <code>output.tools[]</code> entry has a <code>methodName</code> (the second positional for <code>integrations:trigger</code>) and a <code>dataSchema</code> describing the JSON object it expects in <Badge text="-d" variant="param" />. Validate your payload against that schema locally before scripting it into a loop.</p>
</Callout>

## Trigger a provider tool

The <Badge text="integrations:trigger" variant="default" /> dispatches a single allow-listed provider method on a connected channel. Pass JSON input with <Badge text="-d" variant="param" /> (alias <Badge text="--data" variant="param" />).

```bash
openquok integrations:trigger <integration-id> getThings
openquok integrations:trigger <integration-id> searchThings \
  -d '{"query":"openquok"}'
```

The response shape is provider-specific. Most tools return a top-level <Badge text="output" variant="param" /> array of entries that expose <Badge text="id" variant="param" />, <Badge text="value" variant="param" />, and <Badge text="name" variant="param" /> fields you can feed back into <Badge text="posts:create" variant="default" /> <Badge text="--providerSettingsByIntegrationId" variant="param" />.

## Discovery workflow

When working with a channel for the first time:

```bash
INTEGRATION_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="threads") | .id')

openquok integrations:settings "$INTEGRATION_ID" | jq '{maxLength: .output.maxLength, tools: [.output.tools[].methodName]}'

openquok integrations:trigger "$INTEGRATION_ID" getThings | jq '.output[0:3]'

openquok posts:create \
  -s "2026-01-15T12:00:00Z" \
  -c "Hello, world!" \
  -i "$INTEGRATION_ID"
```

## Disconnecting a channel

<p>The CLI does not currently expose an <Badge text="integrations:delete" variant="default" /> due to accidental delete by AI. Disconnect a channel from the web UI, or call the underlying <Badge text={"DELETE /public/integrations/{id}"} variant="path" /> endpoint via the SDK — see <a href="/docs/apis-integrations/delete">Delete Channel</a>.</p>

<Callout type="warning" title="Removing a channel is destructive">
<p>Once an integration row is deleted, any <code>scheduled</code> post that targeted it fails at publish time with <code>integration_not_found</code>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Managing Posts" description="Create, list, and delete posts using the channel IDs you discover here" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Analytics" description="Review channel and post performance after content goes live" href="/docs/cli-usages/analytics" />
<LinkCard title="Integrations APIs" description="Call the API for the same list, settings, and tool workflows as the CLI" href="/docs/apis-integrations" />
<LinkCard title="Social integrations" description="Connect accounts with OAuth before you automate them from the terminal" href="/docs/social-integration" />
</CardGrid>
