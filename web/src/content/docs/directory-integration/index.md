---
title: Directory integration overview
description: Self-host operator guides for directory launch destinations, extension handoff, and per-site catalog setup.
order: 0
lastUpdated: 2026-10-24
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="tip" title="Self-host operators">
<p>These pages are for people who run OpenQuok and maintain <strong>directory launch</strong> destinations (catalog rows, extension field maps, and shipped seeds). End-user workflow lives under <a href="/docs/directory-submission">Directory submission</a>. Social OAuth and posting env vars live under <a href="/docs/social-integration">Social integrations</a>.</p>
</Callout>

A **directory integration** is a launch path on a product directory site. OpenQuok stores a **start URL** on that site and **extension config** that maps fields from a workspace business profile into the submit form. The user opens the directory in Chrome, reviews autofill from the <a href="/docs/installation/chrome-extension">browser extension</a>, and submits on the directory site.

Operators do not register OAuth apps per directory in the backend. Catalog data can come from database seeds, internal admin tools, and contributor migrations. Optional links tie each row to **Build Backlinks** editorial context (cost, dofollow, and similar).

<Callout type="note">
<p>Workspace <strong>integrations</strong> in the public API and CLI mean connected <strong>social</strong> posting channels. Directory launches use the dashboard auto-launch flow. They are not the same as scheduling with <Badge text="POST /public/posts" variant="path" />.</p>
</Callout>

## What each destination includes

Behind each guide path OpenQuok typically stores:

- A **start URL** (submit form, pricing page, queue page, and so on)
- **Extension config** for profile → form field mapping
- Optional **Build Backlinks** links for listing metadata

New **social** networks follow <a href="/docs/contribution-opportunities/add-provider">Adding a provider</a>. New directory sites follow the auto-launch contribution path in engineering documentation.

## Guides

<CardGrid>
<LinkCard title="PeerPush" description="Standard launch and free queue — profile fields and public landing" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory submission" description="Launch workflow from My Products" href="/docs/directory-submission" />
<LinkCard title="Tailor profiles per directory" description="Per-site profile variants before you launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Domain rating for your product site on paid plans" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Directory SEO & DataForSEO" description="Optional domain rating cache for analytics" href="/docs/configuration-backend/directory-seo" />
<LinkCard title="Social integrations" description="OAuth, API keys, and extension setup for posting channels" href="/docs/social-integration" />
<LinkCard title="Browser extension" description="Build and install the OpenQuok Chrome extension" href="/docs/installation/chrome-extension" />
</CardGrid>
