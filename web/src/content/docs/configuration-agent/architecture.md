---
title: Auth Server Architecture
description: How the Openquok CLI auth server works — request flow, endpoints, and Postgres state.
order: 1
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The CLI auth server (<Badge text="agent/server" variant="path" />) is a small Node.js service that implements OAuth2 **device flow** for the Openquok CLI. It exists so the CLI can authenticate **without embedding** OAuth client secrets.

Deploy-time env vars and templates for this service live under <a href="/docs/configuration-agent">Configuration - Agent</a>. Implementation reference: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/server/app.ts"><Badge text="agent/server/app.ts" variant="path" /></DocsExternalLink>.

Browser routes on the web app: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/tree/main/web/src/routes/(public)/cli/device"><Badge text="web/src/routes/(public)/cli/device" variant="path" /></DocsExternalLink>.

## Openquok hosted (Production)

```text
CLI                    cli-auth.openquok.com          www.openquok.com              Openquok API
 │                              │                            │                            │
 ├─ POST /device/code ─────────►│                            │                            │
 │◄── verification_uri ─────────│  (points to www)           │                            │
 │                              │                            │                            │
 │  User opens browser ──────────────────────────────────────►│ GET /cli/device/verify     │
 │                              │◄── server proxies POST ────│                            │
 │                              ├─ redirect to OAuth UI ────────────────────────────────►│
 │                              │                            │  /oauth/authorize          │
 │                              │◄── OAuth callback ─────────│ GET /cli/device/callback   │
 │                              │    (proxied)               │                            │
 │                              ├─ exchange for token ──────────────────────────────────►│
 │                              │◄── opo_ access_token + organizationId ────────────────│
 │  POST /device/token (poll) ─►│                            │                            │
 │◄── access_token + org id ────│                            │                            │
```

<Callout type="note">
<p><Badge text="OPENQUOK_AUTH_SERVER" variant="envBackend" /> (CLI) targets <Badge text="cli-auth.openquok.com" variant="new" /> for API calls only. Users never need to open that host in a browser when <Badge text="BROWSER_ORIGIN" variant="envBackend" /> is set to <Badge text="www.openquok.com" variant="new" />.</p>
</Callout>

## Request flow (device login)

```text
CLI                        Auth Server                    Openquok (web + API)
 │                              │                           │
 ├─ POST /device/code ─────────►│                           │
 │◄── device_code + user_code ──│                           │
 │    + verification_uri        │                           │
 │                              │                           │
 │  User opens browser ────────►│ (or web /cli/device/*)    │
 │  Enters code                 │                           │
 │                              ├─ redirect to OAuth UI ───►│
 │                              │◄── callback with code ────│
 │                              ├─ exchange for token ─────►│
 │                              │◄── access_token ──────────│
 │                              │  (stored in Postgres)     │
 │  POST /device/token (poll) ─►│                           │
 │◄── access_token ─────────────│                           │
```

## Components and responsibilities

- **CLI**
  - Calls <Badge text="/device/code" variant="path" /> on the auth server API origin.
  - Opens <Badge text="verification_uri" variant="default" /> in a browser (production: <Badge text="www.openquok.com/cli/device/verify" variant="new" />).
  - Polls <Badge text="/device/token" variant="path" /> until the user finishes approval.

- **Auth server** (<Badge text="agent/server" variant="path" />)
  - Holds the OAuth **client secret** and performs the server-to-server exchange with the Openquok API.
  - Stores short-lived device flow state in Postgres (not in memory).
  - Returns an API token to the CLI once approval is complete.
  - Emits browser URLs from <Badge text="BROWSER_ORIGIN" variant="envBackend" /> when configured.

- **Web app** (<Badge text="web" variant="path" />, when <Badge text="BROWSER_ORIGIN" variant="envBackend" /> ≠ <Badge text="SERVER_URL" variant="envBackend" />)
  - Serves <Badge text="/cli/device/verify" variant="path" /> and proxies to the auth server using <Badge text="CLI_AUTH_SERVER_URL" variant="envBackend" />.
  - Proxies <Badge text="/cli/device/callback" variant="path" /> so OAuth redirects stay on the trusted web origin.

- **Openquok (web + API)**
  - Hosts the approval UI at <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> + <Badge text="OPENQUOK_AUTHORIZE_PATH" variant="envBackend" />.
  - Exchanges the OAuth authorization code for an API access token via <Badge text="/api/v1/oauth/token" variant="path" />.

## OAuth client credentials vs user access tokens

Deployers configure one OAuth **application** on the auth server (<Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> and <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" />). That pair identifies the **platform CLI app** to the API. It is **not** the credential end users send on programmatic routes.

| Credential | Who holds it | Purpose |
| --- | --- | --- |
| <Badge text="oqs_…" variant="default" /> client secret | Auth server only | Server-to-server <Badge text="POST /api/v1/oauth/token" variant="path" /> after the user approves in the browser |
| <Badge text="opo_…" variant="default" /> access token | Each CLI user (stored locally after login) | <Badge text="Authorization: Bearer" variant="default" /> on <Badge text="/api/v1/public/*" variant="path" /> |

Every successful device login produces a **new** <Badge text="opo_…" variant="default" /> token. Tokens are not shared across users or workspaces.

<Callout type="tip">
<p>This is not the same as Developers → Access. Workspace owners can also rotate a programmatic token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> in the dashboard. That token is issued against the <strong>workspace OAuth app</strong> created under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> (one app per workspace). It does <strong>not</strong> use <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> on the API server — that env var is for the auth server deployment only. See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a>.</p>
</Callout>

## Workspace scoping and subscription plans

Plan limits are **not** inherited from whoever operates <Badge text="cli-auth.openquok.com" variant="new" />. They are enforced on **the workspace the user selects** when approving the OAuth app.

```text
1. User completes device verify → OAuth authorize UI
2. User picks a workspace and chooses Authorize
3. API upserts oauth_authorizations (user, workspace, app) and issues opo_…
4. Each /public/* request: resolve token → organization_id → subscription guard for that workspace
```

The auth server stores <Badge text="organization_id" variant="default" /> on the completed <Badge text="device_requests" variant="default" /> row (returned from token exchange) so the CLI knows which workspace the token belongs to.

<Callout type="tip" title="Why a shared secret is safe">
<p>The client secret only proves that <strong>your auth server</strong> may exchange authorization codes for that registered OAuth app. A Solo-plan user still receives a token bound to <em>their</em> Solo workspace; Ultimate-only capabilities remain blocked by the API subscription guard for that <Badge text="organization_id" variant="default" />.</p>
</Callout>

<Callout type="warning" title="Platform OAuth app registration">
<p>The OAuth app referenced by <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> must exist in the same Openquok project as the API. Its redirect URL must match <Badge text="/cli/device/callback" variant="path" /> on <Badge text="BROWSER_ORIGIN" variant="envBackend" /> (or <Badge text="SERVER_URL" variant="envBackend" /> when browser steps run on the auth server). Register it with <Badge text="agent/server/scripts/generate-oauth-app-env.mjs" variant="path" /> or manually under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> in a workspace you control, then copy the client id and secret into the auth server env.</p>
</Callout>

## Workspace isolation (users do not share one workspace)

Device login does **not** hand every CLI user the same token or the operator’s workspace. Isolation works in three layers:

```text
Browser authorize UI
  → user must pick a workspace they belong to
  → API checks membership for that workspace
  → authorization row stores (user_id, organization_id, oauth_app_id)

/public/* request
  → Bearer opo_… hashed and looked up in oauth_authorizations
  → organization_id comes from that row only (not from the auth server env)
  → data queries are scoped to that organization
```

| Question | Answer |
| --- | --- |
| Do all CLI users share one <Badge text="opo_…" variant="default" /> token? | **No.** Each login mints a new token tied to that user’s authorization row. |
| Can User B’s token read User A’s workspace? | **No.** The API resolves workspace only from the token’s authorization; another user’s channels and posts are unreachable. |
| Can a Solo user get a token for the operator’s workspace without permission? | **No.** Approve requires an active <Badge text="user_organizations" variant="default" /> membership for the selected workspace. |
| Can someone use the client secret to call <Badge text="/public/*" variant="path" /> as the operator? | **No.** The secret only exchanges OAuth codes; it is not accepted as a programmatic bearer token. |

<Callout type="note" title="Pick the correct workspace in the browser">
<p>On <Badge text="/oauth/authorize" variant="path" />, the signed-in user chooses which workspace to authorize. The UI defaults to the current workspace cookie when possible, but the user must confirm the selection before **Authorize**. If they are a member of multiple workspaces (for example their own Solo workspace and a shared Team workspace), the token applies only to the workspace they select — not to every workspace they belong to.</p>
</Callout>

<Callout type="note" title="Platform app and workspace matching">
<p>Today, approve also requires the OAuth app’s owning workspace to match the workspace being authorized. A single global <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> is therefore tied to one <Badge text="oauth_apps.organization_id" variant="default" /> row. End users can authorize **that** workspace (if they are members), not an arbitrary unrelated workspace through the same client id. Product work may relax this for a dedicated platform-app flag; until then, customers who need automation only in their own workspace should use <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> after creating an app on <Badge text="Apps" variant="default" />.</p>
</Callout>

## Endpoints

### Auth server API (<Badge text="SERVER_URL" variant="envBackend" />)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/device/code` | CLI starts the flow. Returns `device_code`, `user_code`, `verification_uri`. |
| `POST` | `/device/token` | CLI polls with `{"device_code": "..."}` until completed. |
| `GET` | `/health` | Health check. |

### Browser steps

When <Badge text="BROWSER_ORIGIN" variant="envBackend" /> equals <Badge text="SERVER_URL" variant="envBackend" /> (typical local dev), the auth server serves these directly:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/device/verify` | Code entry page. Supports `?code=` prefill. |
| `POST` | `/device/verify` | Validates code; redirects to OAuth authorize UI. |
| `GET` | `/device/callback` | OAuth redirect target; exchanges code and stores token. |

When <Badge text="BROWSER_ORIGIN" variant="envBackend" /> is the web app (Openquok production), the same behavior is exposed at:

| Method | Path | Host |
|--------|------|------|
| `GET` | `/cli/device/verify` | <Badge text="BROWSER_ORIGIN" variant="envBackend" /> |
| `POST` | `/cli/device/verify` | proxied to auth server |
| `GET` | `/cli/device/callback` | proxied to auth server |

## Postgres state model

The server is effectively stateless beyond one Postgres table (<Badge text="device_requests" variant="default" />). Rows are deleted after the CLI retrieves the token, or on next access if expired (15 minutes).

```text
CREATE TABLE device_requests (
  device_code TEXT PRIMARY KEY,
  user_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' or 'completed'
  access_token TEXT,
  api_url TEXT,
  organization_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Deployment and scaling

- **Works anywhere**: any platform that runs Node.js and can reach Postgres (VPS, Railway, Fly.io, Render, etc.).
- **Horizontal scaling**: safe as long as every instance shares the same <Badge text="DATABASE_URL" variant="envBackend" />, <Badge text="SERVER_URL" variant="envBackend" />, <Badge text="BROWSER_ORIGIN" variant="envBackend" />, and OAuth client credentials. No sticky sessions required.
- **Serverless**: use a managed Postgres connection string appropriate for high concurrency (pooling).
- **Openquok production**: deploy both <Badge text="agent/server" variant="path" /> and <Badge text="web" variant="path" />; see <a href="/docs/configuration-agent#common-setup-steps">Configuration - Agent → Common setup steps</a>.

## Next steps

<CardGrid>
<LinkCard title="CLI" description="Install the Openquok CLI and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="Device login, OPENQUOK_AUTH_SERVER, and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Configuration - Agent" description="Deploy the auth server: env vars, SERVER_URL, BROWSER_ORIGIN" href="/docs/configuration-agent" />
<LinkCard title="Scaling & Postgres" description="Multi-instance notes and serverless Postgres pooling" href="/docs/configuration-agent/scaling" />
<LinkCard title="Vercel (installation)" description="Deploy the CLI auth server on Vercel" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
</CardGrid>
