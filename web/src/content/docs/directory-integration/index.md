---
title: Directory integration overview
description: How directory launch destinations differ from OAuth social channels in OpenQuok.
order: 0
lastUpdated: 2026-10-17
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Two channel families

OpenQuok talks about **channels** in two ways:

| Family | Connect model | What OpenQuok automates |
| --- | --- | --- |
| **Social** | OAuth, API key, or extension session for posting | Schedule and publish posts from the composer, calendar, and agents |
| **Directory** | No OAuth to the directory | Autofill submit forms from your business profile; **you** submit on the directory site |

Social channels appear on <a href="/account">My Dashboard</a> with avatars and post to networks on a schedule. Directory destinations appear on <a href="/account/products">My Products</a> and in the public <a href="/channels#public-directory-channels-hub-heading">directory launch platforms</a> section of the Channels hub.

<Callout type="note">
<p>The public API and CLI still use <strong>integration</strong> for connected <strong>social</strong> accounts. Directory launches use the dashboard auto-launch API. They are not the same as posting with <Badge text="POST /public/posts" variant="path" />.</p>
</Callout>

## How a directory destination is built

Behind each launch path OpenQuok stores:

- A **start URL** on the directory site (submit form, pricing page, and so on)
- **Extension config** that maps profile fields to form inputs
- Optional links to **Build Backlinks** editorial rows for cost and dofollow context

Operators can add catalog rows through internal tools. Shipped exemplars also live in database seeds. New **social** networks use <a href="/docs/contribution-opportunities/add-provider">Adding a provider</a>. New directory sites follow the auto-launch contribution path in engineering documentation.

## Per-site guides

<CardGrid>
<LinkCard title="PeerPush" description="Standard launch and free queue — profile fields and public landing" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Directory submission" description="Launch workflow from My Products" href="/docs/directory-submission" />
<LinkCard title="Tailor profiles per directory" description="Per-site profile variants before you launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Domain rating for your product site on paid plans" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Channels overview" description="Social connect vs directory launch in one workspace" href="/docs/channels" />
<LinkCard title="Social integrations (self-host)" description="OAuth and env setup for posting channels only" href="/docs/social-integration" />
<LinkCard title="Browser extension" description="Install the extension for directory handoff" href="/docs/installation/chrome-extension" />
</CardGrid>
