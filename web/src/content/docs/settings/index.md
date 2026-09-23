---
title: Overview - Settings
description: OpenQuok workspace settings — timezone, workspace and team, profile, developers, signatures, and approved apps.
order: 0
lastUpdated: 2026-09-21
sidebar:
  label: Overview
---

<script>
import { Badge, CardGrid, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Timezone, workspace, profile, developers, signatures, and approved apps — from the account menu.

**Where:** Open the account menu in the header, then click <Badge text="Settings" variant="default" /> on the top right. The page opens at <a href="/account/settings">/account/settings</a> with a section list on the left.

![Open Settings Menu on the top right](/docs/_assets/settings/open-settings.webp)

Billing is separate. It lives under the same account menu, not inside Settings. Only the workspace <strong>owner</strong> can change a Cloud subscription. See <a href="/docs/billing/subscription">Subscription</a>.

## The sections

| Section | What it holds |
| --- | --- |
| **Timezone** | Clock format and posting timezone |
| **Workspace** | Workspace list, name, team invites, and roles — see <a href="/docs/settings/team">Team</a> |
| **Profile** | Your display name, username, avatar, and password reset |
| **Developers** | Programmatic token, MCP snippets, and OAuth apps — see <a href="/docs/settings/developers">Developers</a> |
| **Approved Apps** | Third-party apps you authorized through OpenQuok OAuth |
| **Signatures** | Reusable sign-offs in post editor — see <a href="/docs/settings/signatures">Signatures</a> |

Templates and saved channel bundles live outside Settings — on <a href="/account/templates">Templates</a> (see <a href="/docs/posts-management/templates">Templates</a>) and in the <a href="/account/calendar">calendar</a> scheduler.

## When a section looks limited

<Tabs items={["OpenQuok Cloud", "Self-hosted"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p>New accounts on the <strong>FREE</strong> tier hit the <strong>first-billing gate</strong> before the app loads — pick a plan and complete Stripe checkout. You can start a <a href="/docs/cloud/trial">7-day trial</a> with <strong>$0 due today</strong>.</p>

| Area | Typical gate |
| --- | --- |
| Team seats | Invite or accept blocked at the seat cap — see <a href="/docs/billing/limits">Cloud limits</a> |
| Workspaces | Cannot create another workspace past the plan cap |
| Developers | First-billing gate until a paid tier or trial is active; programmatic token and OAuth apps need a plan that includes the Public API — see <a href="/docs/settings/developers">Developers</a> |
| Shareable preview | Client preview links need Team or above — see <a href="/docs/posts-management/approvals">Approvals</a> |

<p>Exact numbers are on <a href="/pricing">Pricing</a>.</p>

</TabItem>
<TabItem label="Self-hosted">

<p>You see the same six sections in the left list.</p>

<p>When billing is off or <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> is unset, plan guards are skipped. Limits apply to <strong>actions</strong>, not to tabs — same as Cloud, but most Cloud limits do not apply.</p>

| Area | When Stripe is unset |
| --- | --- |
| Timezone, Profile, Signatures, Approved Apps | No billing gate |
| Team seats | Invite and accept are not blocked by a seat cap |
| Workspaces | The server accepts another workspace. The UI may still show a <strong>1/1</strong> SOLO label and a locked <strong>Create New Workspace</strong> button when you already own one workspace |
| Developers | Programmatic token, OAuth apps, and MCP snippets work — the effective tier is SOLO and includes the public API |
| Shareable preview | Client preview links work from post actions without a Team plan — see <a href="/docs/posts-management/approvals">Approvals</a> |

<p>Channels, scheduled posts, media storage, and public API calls are also not capped by plan guards.</p>

<p>HTTP rate limits still apply when <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> is on. See <a href="/docs/billing/limits">Cloud limits</a> and <a href="/docs/configuration-backend/rate-limiting">Rate limiting</a>.</p>

</TabItem>
</Tabs>

## In this section

<CardGrid>
<LinkCard title="Team" description="Workspace list, invites, roles, and client access options" href="/docs/settings/team" />
<LinkCard title="Timezone" description="Clock format and posting timezone for the calendar" href="/docs/settings/timezone" />
<LinkCard title="Profile" description="Display name, username, avatar, and password reset" href="/docs/settings/profile" />
<LinkCard title="Developers" description="Programmatic token, MCP snippets, and OAuth apps" href="/docs/settings/developers" />
<LinkCard title="Approved apps" description="Third-party apps you authorized through OpenQuok OAuth" href="/docs/settings/approved-apps" />
<LinkCard title="Signatures" description="Reusable sign-offs in the post editor" href="/docs/settings/signatures" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Tour the app" description="Where Settings sits in the signed-in layout" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Cloud limits" description="What happens when a workspace hits a plan cap" href="/docs/billing/limits" />
<LinkCard title="Glossary" description="Workspace, channel, and organization terms" href="/docs/getting-started/glossary" />
</CardGrid>
