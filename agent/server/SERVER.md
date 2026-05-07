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
| `SERVER_URL` | No | `http://localhost:{PORT}` | Public URL of this server (used for generating links) |
| `OPENQUOK_FRONTEND_URL` | No | `https://www.openquok.com` | Openquok web URL hosting the OAuth approval UI |
| `OPENQUOK_API_URL` | No | `https://api.openquok.com` | Openquok API base URL (token exchange uses `/api/v1/oauth/token`) |
| `OPENQUOK_AUTHORIZE_PATH` | No | `/oauth/authorize` | Frontend path that must implement OAuth approve UX |

## Setup

### 1. Create an OAuth app in Openquok

Create an OAuth app and set the callback URL to:

```
https://your-server-domain.com/device/callback
```

### 2. Set up Postgres

Create a database. The server auto-creates the `device_requests` table on startup.

### 3. Configure environment

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/openquok_cli_auth"
export OPENQUOK_OAUTH_CLIENT_ID="oqc_..."
export OPENQUOK_OAUTH_CLIENT_SECRET="oqs_..."
export SERVER_URL="https://your-server-domain.com"
```

### 4. Run

```bash
cd agent/server
pnpm install
pnpm dev
curl http://localhost:3111/health
```

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

## Current limitation (Openquok web UX)

This server redirects the user to:

- `${OPENQUOK_FRONTEND_URL}${OPENQUOK_AUTHORIZE_PATH}?client_id=...&response_type=code&state=...`

Openquok web must implement the OAuth approval UI for third-party clients and eventually redirect back to:

- `${SERVER_URL}/device/callback?code=...&state=...`


