---
title: Overview - Settings
description: OpenQuok workspace settings — timezone, workspace and team, profile, developers, signatures, and approved apps.
order: 0
lastUpdated: 2026-09-21
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Timezone, workspace, profile, developers, signatures, and approved apps — from the account menu.

**Where:** Open the account menu in the header, then click <Badge text="Settings" variant="default" /> on the top right. The page opens at <a href="/account/settings">/account/settings</a> with a section list on the left.

![Open Settings Menu on the top right](/docs/_assets/settings/open-settings.webp)

Billing is separate. It lives under the same account menu, not inside Settings. Only the workspace <strong>owner</strong> can change a Cloud subscription. See <a href="/docs/cloud/subscription">Subscription</a>.

## The sections

| Section | What it holds |
| --- | --- |
| **Timezone** | Clock format and posting timezone |
| **Workspace** | Workspace list, name, team invites, and roles — see <a href="/docs/settings/team">Team</a> |
| **Profile** | Your display name, username, avatar, and password reset |
| **Developers** | Programmatic token, MCP snippets, and OAuth apps — see <a href="/docs/settings/developers">Developers</a> |
| **Approved Apps** | Third-party apps you authorized through OpenQuok OAuth |
| **Signatures** | Reusable sign-offs in post editor — see <a href="/docs/settings/signatures">Signatures</a> |

Templates and saved channel bundles live outside Settings — on <a href="/account/templates">Templates</a> and in the <a href="/account/calendar">calendar</a> scheduler.

## When a section looks limited

<Tabs items={["OpenQuok Cloud", "Self-hosted"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p>Every Settings section is visible on every plan. Limits apply to <strong>actions</strong>, not to tabs.</p>

| Area | Typical gate |
| --- | --- |
| Team seats | Invite or accept blocked at the seat cap — see <a href="/docs/cloud/limits">Cloud limits</a> |
| Workspaces | Cannot create another workspace past the plan cap |
| Developers | Public API, programmatic token, and OAuth apps need a paid tier that includes the API |
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

<p>HTTP rate limits still apply when <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> is on. See <a href="/docs/cloud/limits">Cloud limits</a> and <a href="/docs/configuration-backend/rate-limiting">Rate limiting</a>.</p>

</TabItem>
</Tabs>

## Date metrics (Timezone)

The <Badge text="Timezone" variant="default" /> section controls how times appear when you schedule posts and read the calendar.

### Clock format

Switch between **AM or PM** and **24 hours**.

### Posting timezone

Pick the IANA zone used for schedule slots, the calendar, and the Time table editor. This is your working timezone for OpenQuok — not necessarily your laptop clock.

<Callout type="note" title="Stored in this browser">
<p>Both clock format and timezone are saved in <strong>local storage</strong> on your device. They do not sync to your account. Open Settings on another machine if you need the same display there.</p>
</Callout>

Full detail: <a href="/docs/settings/timezone">Timezone</a>.

## Approved apps

<p><Badge text="Approved Apps" variant="default" /> lists every external application that completed OpenQuok OAuth for your account. These are not channels you connected for posting — they are separate clients (integrations, automations, or partner tools) that asked for permission to use your workspace on your behalf.</p>

<p>Each row shows the app name, an optional description, and an <strong>Authorized on</strong> date. Use <Badge text="Revoke" variant="default" /> when you want to cut access. OpenQuok asks you to confirm in a dialog; after you confirm, that app’s tokens stop working until someone runs the OAuth flow again.</p>

<p>Check this list when you rotate staff, retire a vendor, or stop using a tool. Remove rows you do not expect — stale OAuth access is an easy gap to close. For how third-party apps register and request consent, see <a href="/docs/oauth2-for-apps">OAuth2 for apps</a>.</p>

## Related Section(s)

<CardGrid>
<LinkCard title="Team" description="Invite members, roles, workspaces, and seat limits" href="/docs/settings/team" />
<LinkCard title="Tour the app" description="Where Settings sits in the signed-in layout" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Cloud limits" description="What happens when a workspace hits a plan cap" href="/docs/cloud/limits" />
<LinkCard title="Glossary" description="Workspace, channel, and organization terms" href="/docs/getting-started/glossary" />
</CardGrid>
