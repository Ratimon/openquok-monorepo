---
title: Overview - Troubleshooting
description: Common OpenQuok problems — channel connect, uploads, sign-in, failed posts, and known limitations.
order: 0
lastUpdated: 2026-09-23
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Troubleshooting

> Fixes for the issues people hit most often in the dashboard, CLI, and public API.

If your problem is not listed here, see <a href="/docs/help">Help</a> for how to reach support or the community.

## Common topics

<CardGrid>
<LinkCard title="OAuth and channel connect" description="Invalid state, expired codes, and fetch errors during Add Channel" href="/docs/troubleshooting/oauth-connect" />
<LinkCard title="Uploads and media" description="Size limits, upload-from-url, storage full, and rejected file types" href="/docs/troubleshooting/uploads" />
<LinkCard title="Activation and login" description="Verification links, sign-in, and session checks" href="/docs/troubleshooting/activation-and-login" />
<LinkCard title="A post failed to publish" description="Red ring on the calendar, reconnect, and platform rules" href="/docs/troubleshooting/failed-posts" />
<LinkCard title="Known issues" description="Tracked limitations and self-host pitfalls" href="/docs/troubleshooting/known-issues" />
</CardGrid>

## Self-hosting and billing

| Area | Where to look |
| --- | --- |
| Install, CORS, Redis, workers | <a href="/docs/installation">Installation</a> and <a href="/docs/installation/production-deployment">Production deployment</a> |
| Provider keys and connect always fails | <a href="/docs/social-integration">Social integrations</a> |
| Plan caps and payment | <a href="/docs/cloud/limits">Cloud limits</a> and <a href="/docs/cloud/refunds-and-support">Refunds and support</a> |

<Callout type="note">
<p>OpenQuok Cloud customers can also use <a href="/docs/help">Help</a> for Discord and email. Self-hosters rely mainly on community channels listed there.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Connect a channel" description="OAuth redirect vs credentials, invite links, and status badges" href="/docs/channels/connect" />
<LinkCard title="Help" description="How to ask for support and what to include" href="/docs/help" />
<LinkCard title="Platforms" description="Posting rules when the network rejects content" href="/docs/platforms" />
</CardGrid>
