# Openquok CLI Auth Server

Device flow OAuth2 server that allows CLI users to authenticate without embedding client credentials. The server holds the OAuth app secret and mediates the authorization flow.

## How it works

```
CLI                        Auth Server                    Openquok
 │                              │                           │
 ├─ POST /device/code ─────────►│                           │
 │◄── device_code + user_code ──│                           │
 │                              │                           │
 │  User opens browser ────────►│                           │
 │  Enters code                 │                           │
 │                              ├─ redirect to OAuth UI ───►│
 │                              │◄── callback with code ────│
 │                              ├─ exchange for token ─────►│
 │                              │◄── access_token ──────────│
 │                              │  (stored in Postgres)     │
 │                              │                           │
 │  POST /device/token (poll) ─►│                           │
 │◄── access_token ─────────────│                           │
```

## Prerequisites

- Node.js >= 18
- PostgreSQL

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Postgres connection string |
| `OPENQUOK_OAUTH_CLIENT_ID` | Yes | - | OAuth app client ID (prefix: `oqc_...`) |
| `OPENQUOK_OAUTH_CLIENT_SECRET` | Yes | - | OAuth app client secret (prefix: `oqs_...`) |
| `PORT` | No | `3111` | Server port |
| `SERVER_URL` | No | `http://localhost:{PORT}` | Public origin of this server (no trailing slash), used for links and OAuth `redirect_uri`. For the hosted CLI auth service, use `https://cli-auth.openquok.com`. |
| `OPENQUOK_FRONTEND_URL` | No | `https://www.openquok.com` | Openquok web URL hosting the OAuth approval UI |
| `OPENQUOK_API_URL` | No | `https://api.openquok.com` | Openquok API base URL (token exchange uses `/api/v1/oauth/token`) |
| `OPENQUOK_AUTHORIZE_PATH` | No | `/oauth/authorize` | Frontend path that must implement OAuth approve UX |

## Setup

### 1. Create an OAuth app in Openquok

Create an OAuth app and set the callback URL to:

```
https://cli-auth.openquok.com/device/callback
```

(Self-hosters: use your own `SERVER_URL` instead, e.g. `https://auth.example.com/device/callback`.)

### 2. Set up Postgres

Create a database. The server auto-creates the `device_requests` table on startup.

### 3. Configure environment

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/openquok_cli_auth"
export OPENQUOK_OAUTH_CLIENT_ID="oqc_..."
export OPENQUOK_OAUTH_CLIENT_SECRET="oqs_..."
export SERVER_URL="https://cli-auth.openquok.com"
```

### 4. Run

```bash
cd agent/server
pnpm install
pnpm dev
curl http://localhost:3111/health
```

## Deployment

Any platform that runs Node.js and can reach Postgres works (Railway, Fly.io, Render, a VPS, etc.). The process is stateless aside from Postgres, so you can run **multiple instances behind a load balancer** as long as they share the same `DATABASE_URL` and the same `SERVER_URL` (and OAuth client credentials). No sticky sessions are required: device-flow state lives in Postgres.

For **serverless (Vercel)** this repo includes `vercel.json` plus **`api/[slug].ts`** (e.g. `/api/health`) and **`api/device/[slug].ts`** (e.g. `/api/device/callback`). Vercel’s filesystem routing matches **one dynamic segment per file**; a single catch-all under `/api` did not reliably invoke Node for multi-segment paths in production. `vercel.json` sets **`outputDirectory`** to **`public`**; the build step creates an empty placeholder there after `tsc` — same idea as the backend: there is no real static site; do **not** add **`public/index.html`** or static files will shadow API routes. `maxDuration` is set via `export const config` in that file (not `vercel.json` `functions` globs, which are easy to misconfigure with dynamic segment names).

**Monorepo / Vercel:** In the Vercel project, set **Root Directory** to **`agent/server`**. Install is **`pnpm install --frozen-lockfile --ignore-workspace`** (standalone package only — avoids a full monorepo install on the builder). Link the CLI once from that directory: **`cd agent/server && npx vercel link`**. Deploy from the repo root with **`pnpm vercel:deploy:agent-server`** or **`pnpm vercel:deploy:agent-server:prod`** — the script runs the Vercel CLI with **`cwd` `agent/server`**, so it picks up `vercel.json` and `.vercel/project.json` in one place. You can also run **`npx vercel`** / **`npx vercel --prod`** directly inside **`agent/server`** after linking.

Public routes stay at the root (`/health`, `/device/*`); rewrites send them to the function under `/api`. Set `SERVER_URL` to your deployment’s public origin (for example `https://your-project.vercel.app` or `https://cli-auth.openquok.com`). Use a managed Postgres with pooling (for example Neon, Supabase, or Vercel Postgres) and a connection string suited to serverless concurrency.

After changing `agent/server/package.json` dependencies, regenerate and commit the standalone lockfile:

```bash
pnpm agent-server:sync-standalone-lockfile
```

When `agent/server/pnpm-lock.yaml` is present, Vercel uses `--frozen-lockfile`; otherwise it resolves from `package.json` ranges.

The local CLI may sit on **“Building…”** while Vercel runs install + `buildCommand` + serverless bundling remotely — that is normal; open the **Inspect** link from the CLI output for live build logs.

Run **`pnpm agent-server:build`** locally before deploy if you want a fast TypeScript check; it is no longer part of the deploy script (the remote build still runs `tsc`).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/device/code` | CLI calls this to start a new device flow. Returns `device_code`, `user_code`, `verification_uri`. |
| `GET` | `/device/verify` | Browser page where the user enters their code. Supports `?code=` prefill. |
| `POST` | `/device/verify` | Validates the user code and redirects to the Openquok OAuth approval UI. |
| `GET` | `/device/callback` | Openquok redirects here after authorization. Exchanges the code for an access token and stores it. |
| `POST` | `/device/token` | CLI polls this with `{"device_code": "..."}` until completed, then returns token. |
| `GET` | `/health` | Health check. |

## Database

The server uses a single table that is auto-created on startup:

```sql
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

Rows are deleted after the CLI retrieves the token, or on next access if expired (15 minutes).


## todo check again (Openquok web UX)

This server redirects the user to:

- `${OPENQUOK_FRONTEND_URL}${OPENQUOK_AUTHORIZE_PATH}?client_id=...&response_type=code&state=...`

Openquok web must implement the OAuth approval UI for third-party clients and eventually redirect back to:

- `${SERVER_URL}/device/callback?code=...&state=...`


