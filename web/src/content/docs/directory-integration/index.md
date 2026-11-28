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

A **directory integration** is a launch path on a product directory site. OpenQuok stores a **start URL** on that site and **extension config** that maps fields from a workspace business profile into the submit form. The user opens the directory in a supported browser, reviews autofill from the <a href="/docs/installation/chrome-extension">Chrome</a>, <a href="/docs/installation/edge-extension">Edge</a>, or <a href="/docs/installation/firefox-extension">Firefox</a> extension, and submits on the directory site.

Operators do not register OAuth apps per directory in the backend. Catalog data can come from database seeds, internal admin tools, and contributor migrations. Optional links tie each row to **Build Backlinks** editorial context (cost, dofollow, and similar).

<Callout type="note">
<p>Workspace <strong>integrations</strong> in the public API and CLI mean connected <strong>social</strong> posting channels. Directory launches use the dashboard auto-launch flow. They are not the same as scheduling with <Badge text="POST /public/posts" variant="path" />.</p>
</Callout>

## What each destination includes

Behind each guide path OpenQuok typically stores:

- A **start URL** (submit form, pricing page, queue page, and so on)
- **Extension config** for profile → form field mapping
- Optional **Build Backlinks** links for listing metadata

New **social** networks follow <a href="/docs/contribution-opportunities/add-provider">Adding a social provider</a>. New directory sites follow <a href="/docs/contribution-opportunities/add-directory">Adding a directory channel</a>.

## Guides

<CardGrid>
<LinkCard title="PeerPush" description="Standard launch and free queue — profile fields and public landing" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Open Launch" description="Premium launch and free queue — tech stack, extension wizard autofill" href="/docs/directory-integration/open-launch" />
<LinkCard title="TinyLaunch" description="Premium and Standard create-startup — category catalog, pledge manual" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Fazier" description="Company page wizard and product launch — badge and tier steps manual" href="/docs/directory-integration/fazier" />
<LinkCard title="DevHunt" description="Free listing and $49 paid launch week — developer tools, screenshots, manual checkout" href="/docs/directory-integration/devhunt" />
<LinkCard title="Nick Launches" description="Free launch, paid tiers, and maker profile — categories, badge, manual plan checkout" href="/docs/directory-integration/nick-launches" />
<LinkCard title="IndieHub" description="Basic and Pro paid listings — submit wizard step 1 autofill, manual payment and publish" href="/docs/directory-integration/indiehub" />
<LinkCard title="AlternativeTo" description="Free listing, paid review tiers, and user profile — manage-item autofill" href="/docs/directory-integration/alternativeto" />
<LinkCard title="Trustpilot" description="Company profile on Trustpilot Business — settings autofill, business email verify, nofollow" href="/docs/directory-integration/trustpilot" />
<LinkCard title="StartupInspire" description="Free listing and Starter launch — create form autofill, manual checkout, dofollow verify" href="/docs/directory-integration/startupinspire" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory submission" description="Launch workflow from My Products" href="/docs/directory-submission" />
<LinkCard title="Profile variants per directory" description="Optional site copies before you launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Domain rating for your product site on paid plans" href="/docs/insights/directory-analytics" />
<LinkCard title="Directory SEO" description="Optional domain rating cache for analytics" href="/docs/configuration-backend/directory-seo" />
<LinkCard title="Social integrations" description="OAuth, API keys, and extension setup for posting channels" href="/docs/social-integration" />
<LinkCard title="Chrome extension" description="Install guide and feature walkthrough" href="/docs/installation/chrome-extension" />
<LinkCard title="Edge extension" description="Edge Add-ons install" href="/docs/installation/edge-extension" />
<LinkCard title="Firefox extension" description="Firefox Add-ons install" href="/docs/installation/firefox-extension" />
</CardGrid>
