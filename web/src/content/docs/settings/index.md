---
title: Overview - Settings
description: OpenQuok workspace settings — timezone, workspace and team, profile, developers, signatures, and approved apps.
order: 0
lastUpdated: 2026-09-17
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

> Timezone, workspace, profile, developers, signatures, and approved apps — from the account menu.

**Where:** Open the account menu in the header, then click <Badge text="Settings" variant="default" />. The page opens at <a href="/account/settings">/account/settings</a> with a section list on the left.

Billing is separate. It lives under the same account menu, not inside Settings. Only the workspace <strong>owner</strong> can change a Cloud subscription. See <a href="/docs/cloud/subscription">Subscription</a>.

## The sections

| Section | What it holds |
| --- | --- |
| **Timezone** | Clock format and posting timezone for schedules and time labels |
| **Workspace** | Workspace list, name, team invites, and roles — see <a href="/docs/settings/team">Team</a> |
| **Profile** | Your display name, username, avatar, and password |
| **Developers** | Programmatic token, MCP snippets, and OAuth apps — see <a href="/docs/settings/developers">Developers</a> |
| **Approved Apps** | Third-party apps you authorized through OpenQuok OAuth |
| **Signatures** | Reusable sign-offs for the composer — see <a href="/docs/settings/signatures">Signatures</a> |

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

<p>With Stripe unset, plan guards do not run. Every Settings section stays available. Operators who enable Stripe get the same limits as Cloud.</p>

</TabItem>
</Tabs>

## Date metrics (Timezone)

The <Badge text="Timezone" variant="default" /> section controls how times appear when you schedule posts and read the calendar.

### Clock format

Switch between **AM or PM** and **24 hours**.

### Posting timezone

Pick the IANA zone used for schedule slots, the calendar, and the Time table editor. This is your working timezone for OpenQuok — not necessarily your laptop clock.

<Callout type="note" title="Stored in this browser">
<p>Both clock format and timezone are saved in <strong>local storage</strong> on the device you use. They do not sync to your account. Open Settings on another machine if you need the same display there.</p>
</Callout>

Full detail: <a href="/docs/settings/timezone">Timezone</a>.

## Approved apps

Third-party applications you approved through OpenQuok OAuth appear on <Badge text="Approved Apps" variant="default" />. Each row shows when access was granted.

Click <Badge text="Revoke" variant="default" /> to remove access immediately. The app cannot call your workspace after revocation.

Review this list occasionally. Revoke anything you no longer recognize.

## Related Section(s)

<CardGrid>
<LinkCard title="Team" description="Invite members, roles, workspaces, and seat limits" href="/docs/settings/team" />
<LinkCard title="Tour the app" description="Where Settings sits in the signed-in layout" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Cloud limits" description="What happens when a workspace hits a plan cap" href="/docs/cloud/limits" />
<LinkCard title="Glossary" description="Workspace, channel, and organization terms" href="/docs/getting-started/glossary" />
</CardGrid>
