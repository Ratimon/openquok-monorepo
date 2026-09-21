---
title: Developers
description: Workspace programmatic tokens, MCP snippets, CLI setup, and OAuth apps for the OpenQuok Public API.
order: 4
lastUpdated: 2026-09-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Developers

> Programmatic access for your workspace — tokens, MCP snippets, CLI setup, and OAuth apps.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> (<a href="/account/settings?section=developers">/account/settings?section=developers</a>).

The Developer section is the control panel for everything programmatic in a workspace. You can reference to:
- <a href="/docs/getting-started-for-public-api">Public API</a> covers authentication and the Node SDK
- The <a href="/docs/apis-integrations">API reference</a> sections document each endpoint
- <a href="/docs/cli-usages">CLI usage</a> lists command recipes.

Our Settings uses two sub-tabs:

| Tab | URL | What it holds |
| --- | --- | --- |
| **Access** | <a href="/account/settings?section=developers">/account/settings?section=developers</a> | Programmatic token, CLI install, MCP client snippets |

![Developer Access settings](/docs/_assets/settings/developer-access-setting.webp)

| Tab | URL | What it holds |
| --- | --- | --- |
| **Apps** | <a href="/account/settings?section=developers&amp;tab=apps">/account/settings?section=developers&amp;tab=apps</a> | Workspace OAuth application (client ID and secret) |

![Developer App settings](/docs/_assets/settings/developer-app-setting.webp)

<Callout type="note">
<p>Tokens and OAuth apps belong to the <strong>active workspace</strong> in the header switcher. Switch workspaces before copying credentials for another team.</p>
</Callout>

## Plan availability

<Tabs items={["OpenQuok Cloud", "Self-hosted"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p>New accounts on the <strong>FREE</strong> tier hit the <strong>first-billing gate</strong> before the app loads — pick a plan and complete Stripe checkout. You can start a <a href="/docs/cloud/trial">7-day trial</a> with <strong>$0 due today</strong>.</p>

<p>After a paid tier or trial is active, the <Badge text="Developers" variant="default" /> tab unlocks programmatic tokens the Public API, OAuth apps, and MCP snippets.</p>

<p>See <a href="/docs/cloud/limits">Cloud limits</a>, <a href="/docs/cloud/subscription">Subscription</a>, and <a href="/pricing">Pricing</a>.</p>

</TabItem>
<TabItem label="Self-hosted">

<p>You see the same <Badge text="Developers" variant="default" /> tab as on Cloud.</p>

<p>When billing is off or <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> is unset, plan guards are skipped on the server. The UI treats your account as <strong>SOLO</strong>, which includes the Public API — programmatic tokens, OAuth apps, and MCP snippets work without a Cloud subscription.</p>

<p>HTTP rate limits still apply when <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> is on. See <a href="/docs/cloud/limits">Cloud limits</a> and <a href="/docs/configuration-backend/rate-limiting">Rate limiting</a>.</p>

</TabItem>
</Tabs>

## Who can manage what

| Action | Member | Admin | Owner |
| --- | --- | --- | --- |
| View <Badge text="Developers" variant="default" /> | Yes | Yes | Yes |
| Generate or rotate programmatic token | No | Yes | Yes |
| Create, edit, rotate secret, or delete OAuth app | No | Yes | Yes |

Members can open the tab but cannot rotate tokens or OAuth apps.

## Start on the Apps tab

OpenQuok ties programmatic tokens to a **workspace OAuth application**. You need to register the app on **Apps** before you can generate an <Badge text="opo_…" variant="default" /> token on **Access**

<Steps howToName="Set up programmatic access" howToDescription="Register a workspace OAuth app, then generate a programmatic token for API, CLI, and MCP use.">

### Create an OAuth app

Open the <Badge text="Apps" variant="default" /> tab. Click <Badge text="Create OAuth app" variant="new" />:

![Create a New App in OpenQuok Developer Access settings](/docs/_assets/settings/developer-app-new.webp)

Then fill in:

| Field | Required | Notes |
| --- | --- | --- |
| **App name** | Yes | Shown on the user consent screen |
| **Description** | No | Optional context for people authorizing your app |
| **Profile image** | No | Defaults to the OpenQuok logo; pick from workspace media or upload |
| **Redirect URL** | Yes | OAuth callback for your integration |

<p>Each workspace gets <strong>one</strong> OAuth app. The <strong>client secret</strong> is shown only when you create the app or rotate it.</p>

### Copy credentials

After creation, copy the <strong>client ID</strong> and <strong>client secret</strong> from the Credentials card.

![Copy secret in OpenQuok Developer OAuth App](/docs/_assets/settings/developer-app-credentials.webp)

Use them for the authorization code flow — see <a href="/docs/oauth2-for-apps">OAuth2 for apps</a>.

### Generate a programmatic token

Switch to <Badge text="Access" variant="default" />. Click <Badge text="Generate token" variant="default" /> (or <Badge text="Rotate token" variant="experimental" />). The token appears once. Use <Badge text="Reveal" variant="param" /> and <Badge text="Copy token" variant="default" />:

![Reveal and copy](/docs/_assets/settings/developer-access-setting.webp)

</Steps>

<Callout type="warning">
<p>Rotating <strong>Programmatic token</strong> issues a new <Badge text="opo_…" variant="default" /> value and invalidates the old one. Update CI, MCP configs, and scripts immediately.</p>
</Callout>

<Callout type="warning">
<p>Rotating <strong>Client secret</strong> generates a new secret and invalidates the old one. Token exchanges using the previous secret fail until you deploy the new value.</p>
</Callout>

<Callout type="warning">
<p><strong>Delete OAuth app</strong> removes the app and revokes tokens issued to users. This cannot be undone.</p>
</Callout>

## Access tab

### Programmatic access token

The token authenticates calls to <Badge text="/api/v1/public/*" variant="path" /> — the same credential powers the Node SDK, <Badge text="openquok" variant="default" /> CLI, and MCP.

| Control | What it does |
| --- | --- |
| <Badge text="Reveal" variant="default" /> / <Badge text="Hide" variant="default" /> | Show or mask the token on screen |
| <Badge text="Copy token" variant="default" /> | Copy the full value to the clipboard |
| <Badge text="Generate token" variant="default" /> / <Badge text="Rotate token" variant="experimental" /> | Create or replace the workspace token (admin or owner) |
| <Badge text="Open Wizard" variant="param" /> | Open the in-app <a href="/account/payload-wizard">payload wizard</a> to explore Public API request shapes |

<Callout type="warning">
Tokens do not expire on their own. Rotate if a key leaks. That is the only way to invalidate an existing token.
</Callout>

<Callout type="tip">
<p>For local development, run <Badge text="openquok auth:login" variant="default" /> (device login) instead of pasting a token. Reserve <Badge text="opo_…" variant="default" /> tokens for CI and headless automation. See <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a>.</p>
</Callout>

### CLI and AI skills

The **CLI &amp; AI Skills** card copies ready-to-run commands:

1. Install the CLI: <Badge text="npm install -g @openquok/node" variant="experimental" />
2. Export your token: <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> with the <Badge text="opo_…" variant="default" /> value

<p> Optionally, you can run <Badge text="openquok auth:login" variant="default" />. Device login opens a browser consent flow and stores credentials under <Badge text="~/.openquok/credentials.json" variant="path" /> — no need to paste an <Badge text="opo_…" variant="default" /> token for everyday use. Stored credentials take priority over <Badge text="OPENQUOK_API_KEY" variant="envBackend" />when both are set.</p>

<Callout type="note">
<p>See More at <a href="/docs/getting-started-for-cli/authentication">CLI authentication</a> and <a href="/docs/getting-started-for-cli">CLI getting started</a>.</p>
</Callout>

### MCP client configuration

Scroll to **MCP client configuration**. Pick:

- **Authentication** — <strong>Authorization header</strong> (recommended) or <strong>API key in URL</strong>
- **Client** — Cursor, Claude Code, ChatGPT, Codex, VS Code / Copilot, and others

![MCP Client Configuration in Developer Settings](/docs/_assets/settings/developer-app-mcp.webp)

Copy the generated snippet into your MCP client. Use <Badge text="Reveal" variant="default" /> before copying if you want to verify the token in the command.

<Callout type="note">
<p> For Self-hosting, replace the default <Badge text="https://api.openquok.com" variant="new" /> origin with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />. Align <Badge text="VITE_API_BASE_URL" variant="envWeb" /> on the web app with the same API host.</p>
</Callout>

## Apps tab (OAuth application)

Use **Apps** when you build something **other OpenQuok users** will authorize — a partner integration, a multi-tenant product, or your own OAuth client for device login.

After the app exists you can:

- <Badge text="Edit app" variant="default" /> — change name, description, profile image, or redirect URL
- <Badge text="Copy client ID" variant="default" /> — always available on the Credentials card
- <Badge text="Rotate secret" variant="experimental" /> — new secret; old exchanges stop working
- <Badge text="Delete app" variant="deprecated" /> — removes the app and revokes user tokens

For OpenQuok-hosted CLI device login, the redirect URL placeholder points at <Badge text="/cli/device/callback" variant="path" /> on the web app. Self-hosted installs use their own callback — see <a href="/docs/configuration-agent">Agent configuration</a>.

Third-party users who approved your app appear under <a href="/docs/settings/approved-apps">Approved apps</a> on their account (not under Developers).

## Programmatic token or OAuth app?

| | Programmatic token (<Badge text="opo_…" variant="default" />) | OAuth app |
| --- | --- | --- |
| **Acts as** | Your workspace in scripts you control | Each user who completes the OAuth consent flow |
| **Good for** | Your CI, cron jobs, MCP, and personal automations | A product other OpenQuok workspaces will connect |
| **Setup** | Apps tab → Access tab → generate token | Apps tab → register app → implement the flow |
| **Revoking** | Rotate the token on Access | User revokes in Approved apps; or delete the app |

Automate your own posting with a programmatic token. Build an OAuth app only when other people's workspaces need to authorize you.

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="Public API getting started" description="Auth, concepts, and SDK quickstart" href="/docs/getting-started-for-public-api" />
<LinkCard title="MCP client setup" description="Generate a token and copy MCP snippets from Developers" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="CLI authentication" description="Device login vs programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="OAuth2 for apps" description="Authorization code flow for third-party integrations" href="/docs/oauth2-for-apps" />
<LinkCard title="Approved apps" description="Review and revoke apps you authorized" href="/docs/settings/approved-apps" />
<LinkCard title="Cloud limits" description="API rate limits and plan gates" href="/docs/cloud/limits" />
</CardGrid>
