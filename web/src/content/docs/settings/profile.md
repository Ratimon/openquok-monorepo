---
title: Profile
description: Your OpenQuok account profile — display name, username, avatar, website, and password reset.
order: 3
lastUpdated: 2026-09-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Profile

> Your personal account details — separate from any workspace you belong to.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Profile" variant="default" /> (<a href="/account/settings?section=profile">/account/settings?section=profile</a>).

This setting section holds **your user account**, not workspace settings. Teammates in the same workspace each manage their own profile. Changes here follow you across every workspace you join.

![Profile Setting](/docs/_assets/settings/profile-setting.webp)

## What's on the page

| Field | What it does |
| --- | --- |
| **Full name** | Shown in the app and on blog posts you author |
| **Username** | Public creator handle for <Badge text="/creators/&#123;username&#125;" variant="path" /> and listing URLs |
| **Email** | Sign-in address — read-only in Settings |
| **Password** | Request a change-password email, or set a new password after the link |
| **Avatar** | Optional profile picture — shown on blog posts |
| **Website** | Optional author link on blog posts |

Each editable row opens a dialog. Click <Badge text="Save" variant="new" /> in the dialog to persist changes.

## Full name

Click <Badge text="Update full name" variant="default" />, enter your name, and save. The field is required — you cannot save an empty value.

## Username and creator profile

Your username powers public creator URLs:

- Creator profile: <Badge text="/creators/&#123;username&#125;" variant="path" />
- Building blocks and playbooks you publish appear under that path once approved

Click <Badge text="Set username" variant="new" /> or <Badge text="Update username" variant="default" /> on the Profile row. Rules:

| Rule | Detail |
| --- | --- |
| Length | 3–30 characters |
| Characters | Lowercase letters, numbers, and hyphens only |
| Format | Must start and end with a letter or number |

<Callout type="note">
<p>If you try to publish a listing before choosing a username, OpenQuok sends you to <a href="/account/choose-username">Choose username</a> first. You can also set it anytime from Profile.</p>
</Callout>

## Email

The **Email** row shows the address you used to sign up. It cannot be changed in Settings. Contact support if you need to move your account to a different address.

## Change your password

From Profile, click <Badge text="Change password" variant="default" />. OpenQuok emails you a link. Follow it to confirm, then enter a new password on the change-password page.

<Steps howToName="Change your password" howToDescription="Request a change-password email from Settings and set a new password.">

### Request the email

On <Badge text="Profile" variant="default" />, click <Badge text="Change password" variant="default" />. Check the inbox for your account email.

### Open the link

The email link opens a confirmation step. If the link is invalid or expired, request a new email from Profile.

### Set a new password

After confirmation, enter and confirm a new password. It must be at least **8 characters**. When you are already signed in, you can also open <a href="/account/settings/password">/account/settings/password</a> directly to update your password without the email step.

</Steps>

## Avatar

Click <Badge text="Update picture" variant="default" /> to upload or replace your avatar.

- **Formats:** PNG, JPG, or WebP
- **Max size:** 4 MB
- **Optional** — a custom picture is shown on blog posts; without one, posts use a default avatar

You can remove the picture from the upload dialog before saving.

## Website

Click <Badge text="Update website" variant="default" /> to add or change your author site. The URL must start with <code>http://</code> or <code>https://</code>. Leave the field empty to clear it. The link appears on blog posts you author.

## Account vs workspace

| Scope | Where to manage |
| --- | --- |
| **Your account** (this page) | Full name, username, email display, password, avatar, website |
| **A workspace** | Name, team, invites, roles — see <a href="/docs/settings/team">Team</a> |
| **Display preferences** | Clock format and posting timezone — see <a href="/docs/settings/timezone">Timezone</a> |

Profile has no plan gate on Cloud or self-hosted. See <a href="/docs/settings">Settings overview</a> for sections that do.

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="Publish your listing" description="Set a username and submit building blocks or playbooks" href="/docs/publish-listings/publish-your-listing" />
<LinkCard title="Team" description="Workspace invites, roles, and switching workspaces" href="/docs/settings/team" />
<LinkCard title="Timezone" description="Clock format and posting timezone for the calendar" href="/docs/settings/timezone" />
<LinkCard title="Tour the app" description="Where Settings sits in the signed-in layout" href="/docs/getting-started/tour-the-app" />
</CardGrid>
