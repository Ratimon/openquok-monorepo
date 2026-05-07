<h1>Openquok CLI</h1>

- [What is it for](#what-is-it-for)
- [Quickstart](#quickstart)


## What Is It For

`@openquok/auto-cli` is a **Programmatic CLI for the Openquok scheduling API** — designed for automation and AI agents. It is to automate social media posting, manage scheduled content, and upload media via the Openquok API across the social platforms you’ve connected to Openquok (e.g. Twitter/X, LinkedIn, Reddit, YouTube, TikTok, Instagram, Facebook, and more).

- Create and schedule posts via the programmatic API
- List posts and manage post groups
- Upload media for use in posts
- Manage programmatic integrations (list, generate OAuth/connect URLs, delete)


## Quickstart

**Programmatic CLI for the Openquok scheduling API** — designed for automation and AI agents. All command output is JSON.

This package lives in this monorepo under `agent/` and is published as `@openquok/auto-cli`.

---

## Install

```bash
npm install -g @openquok/auto-cli
# or
pnpm add -g @openquok/auto-cli
```

---

## Authentication

### Option 1: OAuth2 (Recommended)

```bash
openquok auth:login
```

This uses a **device flow** via an auth helper server (see `agent/server`). The CLI will print a one-time code and a verification URL, then poll until the user completes authorization. The resulting access token is stored in `~/.openquok/credentials.json`.

**Custom auth server (self-host or hosted):**

```bash
export OPENQUOK_AUTH_SERVER="http://localhost:3111"
openquok auth:login
```

### Option 2: API Key

#### Use environment variables (recommended for CI)

```bash
export OPENQUOK_API_KEY="opo_..."
export OPENQUOK_API_URL="https://api.openquok.com" # optional
```

#### Store credentials locally

```bash
openquok auth:login --apiKey "your_token"
openquok auth:status
openquok auth:logout
```

> **Note:** `OPENQUOK_API_KEY` always takes precedence over stored credentials.

---

## Commands

### Integrations

```bash
openquok integrations:list
openquok integrations:oauth-url <integration>
openquok integrations:delete <id>
```

### Posts

```bash
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"

openquok posts:create \
  --scheduledAt "2026-01-01T12:00:00Z" \
  --status scheduled \
  --body "Hello from Openquok" \
  --integrationIds "uuid1,uuid2"

openquok posts:group <postGroupUuid>
openquok posts:update-group <postGroupUuid> --json '{"scheduledAt":"...","status":"draft"}'
openquok posts:delete-group <postGroupUuid>
```

### Media upload

```bash
openquok upload ./image.png
```

Upload returns JSON including `data.filePath` and `data.id`, which you can pass into `posts:create` as `--media`.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENQUOK_API_KEY` | No* | - | Programmatic API key / token (Bearer) |
| `OPENQUOK_API_URL` | No | `https://api.openquok.com` | Base URL (the CLI calls `{OPENQUOK_API_URL}/api/v1/...`) |
| `OPENQUOK_AUTH_SERVER` | No | `http://localhost:3111` | OAuth2 device flow auth server base URL (`/device/*`) |

*Either `OPENQUOK_API_KEY` or `openquok auth:login` (stored credentials) is required for authenticated commands.

---

## Development

```bash
pnpm --filter ./agent install
pnpm --filter ./agent dev
pnpm --filter ./agent build
pnpm --filter ./agent start -- --help
```

