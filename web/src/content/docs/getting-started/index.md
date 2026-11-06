---
title: Introduction to OpenQuok
description: Social scheduling and directory launch in one workspace — connect channels, draft posts, build product profiles, and review before you publish or submit.
order: 0
lastUpdated: 2026-11-02
sidebar:
  label: Overview
---

<script>
import { CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

const chromeWebStoreHref = getPublicBrowserExtensionChromeStoreCtaHref();
const chromeWebStoreLinkLabel = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL;
</script>

## Overview

> Schedule social posts and launch product listings from one workspace. Review on the calendar or kanban before posts publish. Review each directory form before you submit on the directory site.

![Save hours scheduling social media at scale](/docs/_assets/getting-started/landing-page-hero.webp)

OpenQuok is a **content workspace** for **social scheduling** and **directory launch**. Agents can draft at scale. You keep quality when you review and approve work before it goes live.

Use the dashboard, the [browser extension](/browser-extension), the CLI, MCP, and the public API (the TypeScript Node.js SDK is also supported). Self-host when you need an open alternative to closed SaaS tools.

### Social posting channels

Connect social channels in a workspace. Write in the post editor, reuse templates, or send drafts from an agent. Review drafts on the **calendar** and **kanban** before anything publishes to a network.

<p class="not-prose flex flex-wrap items-center gap-3">
<a href="/channels/facebook" title="Facebook Page"><img src="/docs/_assets/platforms/socials/facebook.svg" alt="Facebook Page" width="32" height="32" /></a>
<a href="/channels/instagram" title="Instagram"><img src="/docs/_assets/platforms/socials/instagram.svg" alt="Instagram" width="32" height="32" /></a>
<a href="/channels/threads" title="Threads"><img src="/docs/_assets/platforms/socials/threads.svg" alt="Threads" width="32" height="32" /></a>
<a href="/channels/youtube" title="YouTube"><img src="/docs/_assets/platforms/socials/youtube.svg" alt="YouTube" width="32" height="32" /></a>
<a href="/channels/tiktok" title="TikTok"><img src="/docs/_assets/platforms/socials/tiktok.svg" alt="TikTok" width="32" height="32" /></a>
<a href="/channels/linkedin" title="LinkedIn"><img src="/docs/_assets/platforms/socials/linkedin.svg" alt="LinkedIn" width="32" height="32" /></a>
<a href="/channels/x" title="X"><img src="/docs/_assets/platforms/socials/x.svg" alt="X" width="32" height="32" /></a>
<a href="/channels/bluesky" title="Bluesky"><img src="/docs/_assets/platforms/socials/bluesky.svg" alt="Bluesky" width="32" height="32" /></a>
<a href="/channels/reddit" title="Reddit"><img src="/docs/_assets/platforms/socials/reddit.svg" alt="Reddit" width="32" height="32" /></a>
<a href="/channels/devto" title="Dev.to"><img src="/docs/_assets/platforms/socials/devto.svg" alt="Dev.to" width="32" height="32" /></a>
<a href="/channels/skool" title="Skool"><img src="/docs/_assets/platforms/socials/skool.svg" alt="Skool" width="32" height="32" /></a>
</p>

### Directory launch destinations

Build a **product profile** on [My Products](/account/products). Pick a directory destination such as **PeerPush** or **Uneed**. Launch with the browser extension to autofill each form — install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing on Chrome, or see [Browser extension](/docs/installation/chrome-extension). You submit the listing on the directory site yourself. Directory destinations are not OAuth social channels — see [Directory integration](/docs/directory-integration).

<p class="not-prose flex flex-wrap items-center gap-3">
<a href="/channels/peerpush" title="PeerPush"><img src="/icons/link-directory/peerpush.svg" alt="PeerPush" width="32" height="32" /></a>
<a href="/channels/uneed" title="Uneed"><img src="/icons/link-directory/uneed.svg" alt="Uneed" width="32" height="32" /></a>
</p>


## Choose your paths

Start with the track that matches you — the product, Cloud, a self-hosted install, or free creator tools.

<CardGrid>
<LinkCard title="Quickstart" description="First channel, first post, then approve it on calendar or kanban." href="/docs/getting-started/quickstart" />
<LinkCard title="Cloud" description="Trial, plan limits, and Billing for our hosted version." href="/docs/cloud" />
<LinkCard title="Self-hosting" description="No Cloud bill. Install by your self, run it locally or in production." href="/docs/installation" />
<LinkCard title="Free tools" description="Creator tools — photo editor, humanizer, best time to post, and more." href="/tools" />
</CardGrid>

## Social scheduling

Guides for the dashboard — connect channels, compose draft posts, review on calendar or kanban, schedule and publish when you approve.

<CardGrid>
<LinkCard title="Channels" description="Connect, group, and maintain social accounts in your workspace" href="/docs/channels" />
<LinkCard title="Creating posts" description="Write and schedule posts — editor, media, previews, and scheduling" href="/docs/creating-posts" />
<LinkCard title="Posts management" description="My Dashboard Posts tab kanban, calendar, post actions, and client approvals" href="/docs/posts-management" />
<LinkCard title="Saved" description="Explore the catalog, bookmark building blocks, compose stacks, and publish playbooks" href="/docs/saved" />
<LinkCard title="Settings" description="Timezone, team, profile, developers, signatures, and approved apps" href="/docs/settings" />
<LinkCard title="Platforms" description="Character limits, media rules, and follow-up support by network" href="/docs/platforms" />
<LinkCard title="Automations" description="CLI, MCP, public API, RSS, and webhooks for social workflows" href="/docs/automations" />
</CardGrid>

## Directory launch

Guides for product profiles, directory autofill, and submission tracking — you prefill your main profile then submit each listing on the directory site via our browser extention's autofill.

<CardGrid>
<LinkCard title="Directory submission" description="Business profile, extension handoff, readiness, and mark each launch complete" href="/docs/directory-submission" />
<LinkCard title="Directory submission tool" description="DIY autofill and tracking vs done-for-you bulk packages — FAQs and product overview" href="/directory-submission-tool" />
<LinkCard title="Track submissions" description="Listing URLs, dofollow notes, and progress on My Products" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Profile variants" description="Site-specific copies per directory and which profile the extension uses" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Domain rating charts and competitor tracking on paid plans" href="/docs/insights/directory-analytics" />
<LinkCard title="Directory integration" description="How directory destinations differ from OAuth social channels" href="/docs/directory-integration" />
<LinkCard title="Browser extension" description="Install the OpenQuok Chrome extension for directory autofill" href="/docs/installation/chrome-extension" />
<LinkCard title="Build Backlinks" description="Public catalog, bookmarks, and research" href="/docs/directory-submission/build-backlinks" />
<LinkCard title="Backlinks management" description="Reorder and mark outreach done on Account → Saved" href="/docs/saved/backlinks" />
</CardGrid>

## Building on OpenQuok

Integrate, automate, or contribute.

<CardGrid>
<LinkCard title="MCP" description="Connect Cursor, Claude, and other MCP clients." href="/docs/getting-started-for-mcp" />
<LinkCard title="CLI" description="Terminal commands and agent skills for a workspace." href="/docs/getting-started-for-cli" />
<LinkCard title="Skill Builder" description="Compose and export SKILL.md for agents in the creative economy." href="/tools/skill-builder" />
<LinkCard title="Public API" description="Posts, channels, and analytics over HTTP." href="/docs/getting-started-for-public-api" />
<LinkCard title="Maintain or work on OpenQuok" description="Code guidelines, catalog listings, and docs authoring." href="/docs/developer-guidelines" />
</CardGrid>

## Related Section(s)

More product guides plus automation and contribution paths.

<CardGrid>
<LinkCard title="Channels" description="Connect, group, and maintain social accounts in your workspace" href="/docs/channels" />
<LinkCard title="Posts management" description="My Dashboard Posts tab kanban, calendar, post actions, and client approvals" href="/docs/posts-management" />
<LinkCard title="Platforms" description="Character limits, media rules, and follow-up support by network" href="/docs/platforms" />
<LinkCard title="Automations" description="CLI, MCP, public API, RSS, and webhooks" href="/docs/automations" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Glossary" description="The concepts OpenQuok uses, defined once" href="/docs/getting-started/glossary" />
<LinkCard title="Tour the app" description="Sidebar, header, composer, and settings after you sign in" href="/docs/getting-started/tour-the-app" />
<LinkCard title="CLI" description="Terminal commands and agent skills for a workspace" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP" description="Connect Cursor, Claude Code, and other MCP clients" href="/docs/getting-started-for-mcp" />
<LinkCard title="Public API" description="Posts, channels, and analytics over HTTP" href="/docs/getting-started-for-public-api" />
<LinkCard title="Contributing" description="Code guidelines, catalog listings, and docs authoring" href="/docs/developer-guidelines" />
<LinkCard title="Troubleshooting" description="Connect, uploads, login, and failed posts" href="/docs/troubleshooting" />
<LinkCard title="Help" description="Support channels and how to describe a problem" href="/docs/help" />
</CardGrid>
