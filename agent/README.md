<h1>Openquok CLI</h1>

- [What is it for](#what-is-it-for)
- [Quickstart](#quickstart)


## What Is It For

`@openquok/auto-cli` is a **Programmatic CLI for the Openquok scheduling API** — designed for automation and AI agents. It is to automate social media posting, manage scheduled content, and upload media via the Openquok API across the social platforms you’ve connected to Openquok (e.g. Twitter/X, LinkedIn, Reddit, YouTube, TikTok, Instagram, Facebook, and more).

- Create and schedule posts via the programmatic API
- List posts and manage post groups
- Upload media for use in posts
- List programmatic integrations and trigger provider-specific tools (e.g. fetch subreddits, pages, playlists)


## Quickstart

**Programmatic CLI for the Openquok scheduling API** — designed for automation and AI agents.

This package lives in this monorepo under `agent/` and is published as `@openquok/auto-cli`.

---

## Install

Requires **Node.js 20.19+** (or 22.12+, or 23+). Older versions may install with warnings or fail at runtime.

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

By default the CLI uses the hosted device-flow server at `https://cli-auth.openquok.com`. For **local development** of `agent/server`, point the CLI at your machine:

```bash
export OPENQUOK_AUTH_SERVER="http://localhost:3111"
openquok auth:login
```

### Option 2: API Key

#### Use environment variables (recommended for CI)

```bash
export OPENQUOK_API_KEY="opo_..."
```

#### Store credentials locally

```bash
openquok auth:login --apiKey "your_token"
openquok auth:status
openquok auth:logout
```

> **Note:** Stored credentials (from `openquok auth:login`) take priority over `OPENQUOK_API_KEY` when both are present. Run `openquok auth:logout` to clear them if you want the env var to be used.

---

## Commands

### Integrations

```bash
openquok integrations:list
openquok integrations:settings <id>
openquok integrations:trigger <id> <method> [--data '<json>']
```

- `integrations:settings` returns the provider's rules, max post length, settings schema, and the list of allow-listed `tools` you can invoke via `integrations:trigger`.
- `integrations:trigger` dispatches a single allow-listed provider method (e.g. `getSubreddits`). The `--data` payload, when present, must be a JSON object; its shape is provider-specific (see the `dataSchema` field of the corresponding tool in `integrations:settings`).
- Connecting new channels (OAuth) is done from the web UI; the CLI consumes the resulting integration IDs.

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

openquok posts:find-slot [integrationId]
openquok posts:delete <postId>
openquok posts:missing <postId>
openquok posts:connect <postId> --releaseId <providerReleaseId>
```

- `posts:find-slot` returns the next free ISO timestamp considering connected channels' posting_times. Pass an integration UUID to scope to a single channel.
- `posts:delete` removes a single post (and the post group it belongs to — a row never publishes in isolation).
- `posts:missing` and `posts:connect` are the workflow for posts whose `release_id` came back as `"missing"`: list provider-side candidates with `posts:missing`, then link the matching id with `posts:connect --releaseId <id>` to unlock per-post analytics.

### Analytics

```bash
openquok analytics:platform <integrationId> [--days 7|30|90]
openquok analytics:post <postId> [--days 7|30|90]
```

- `analytics:platform` returns platform-native metrics for a connected channel (followers, impressions, engagement, …).
- `analytics:post` returns per-post metrics (likes, comments, shares, …) for a **published** post. Drafts/queued posts return `[]`.
- The `--days` window is one of `7`, `30`, or `90` (default `7`); the backend will reject any other value.

### Notifications

```bash
openquok notifications:list [--page <n>]
```

Paginated in-app notification history for the workspace (100 entries per page, zero-based `--page`).

### Media upload

```bash
openquok upload ./image.png
openquok upload-from-url "https://cdn.example.com/banner.png"
```

- `upload` posts a local file as multipart form data.
- `upload-from-url` instructs the API to fetch a publicly reachable http(s) URL server-side (no local file needed); the response shape matches `upload`.

Both return JSON including `data.filePath` and `data.id`, which you can pass into `posts:create` as `--media`.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENQUOK_API_KEY` | No* | - | Programmatic API key / token (Bearer) |
| `OPENQUOK_API_URL` | No | `https://api.openquok.com` | Base URL (the CLI calls `{OPENQUOK_API_URL}/api/v1/...`) |
| `OPENQUOK_AUTH_SERVER` | No | `https://cli-auth.openquok.com` | OAuth2 device flow auth server origin (paths `/device/*`, `/health`). Use `http://localhost:3111` when running `agent/server` locally. |

*Either `OPENQUOK_API_KEY` or `openquok auth:login` (stored credentials) is required for authenticated commands.

---

## Development

Install once from the repo root, then iterate either from source (no build) or against the compiled bundle.

```bash
# From the repo root
pnpm install
pnpm --filter ./agent dev     # tsx watch: re-prints --help on every save
pnpm --filter ./agent build   # produces dist/index.js (the published bin)
```

### Run the CLI without installing

```bash
# Source-mode (recommended for daily dev) — picks up changes immediately
pnpm --filter ./agent cli -- --help
pnpm --filter ./agent cli -- analytics:platform --help
pnpm --filter ./agent cli -- posts:missing --help

# Compiled bundle — verifies the published bin behaves identically
pnpm --filter ./agent build
pnpm --filter ./agent start -- --help
```

> The bare `--` separator is required: `pnpm` consumes its own flags first, so without it `pnpm --filter ./agent cli --help` prints pnpm's help, not the CLI's.

### Smoke test the CLI surface

After adding or renaming commands, run these to confirm every group is wired into `registerAllCommands`:

```bash
# 1. Top-level groups should list `analytics`, `notifications`, and the new posts:* / upload-from-url verbs
pnpm --filter ./agent cli -- --help

# 2. Each group must respond to `--help` with its yargs `Examples:` block
pnpm --filter ./agent cli -- analytics:platform --help
pnpm --filter ./agent cli -- analytics:post --help
pnpm --filter ./agent cli -- notifications:list --help
pnpm --filter ./agent cli -- posts:find-slot --help
pnpm --filter ./agent cli -- posts:delete --help
pnpm --filter ./agent cli -- posts:missing --help
pnpm --filter ./agent cli -- posts:connect --help
pnpm --filter ./agent cli -- upload-from-url --help
```

For a connectivity smoke (requires a valid API key or stored credentials):

```bash
# 3. Confirm auth + workspace plumbing end-to-end
pnpm --filter ./agent cli -- auth:status
pnpm --filter ./agent cli -- integrations:list | jq '.[] | {id, identifier}'
pnpm --filter ./agent cli -- posts:find-slot
pnpm --filter ./agent cli -- notifications:list --page 0 | jq '.total'
```

Each command emits machine-readable JSON on stdout, so piping into `jq` is the recommended way to assert on shape during smoke runs and CI.

