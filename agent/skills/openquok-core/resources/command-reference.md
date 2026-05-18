# Openquok CLI — command reference

Agent-oriented reference for `@openquok/auto-cli` (`openquok`). Hard rules, auth, and workflows live in [SKILL.md](../SKILL.md).

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENQUOK_API_KEY` | No* | — | Programmatic API key (Bearer) |
| `OPENQUOK_API_URL` | No | `https://api.openquok.com` | API base (`{OPENQUOK_API_URL}/api/v1/...`) |
| `OPENQUOK_AUTH_SERVER` | No | `https://cli-auth.openquok.com` | OAuth2 device-flow server (`/device/*`, `/health`) |

\*Either `OPENQUOK_API_KEY` or stored credentials from `openquok auth:login` is required. **Stored credentials take priority** over the env var until `auth:logout`.

## Config

```bash
openquok config:show
```

Prints resolved `api_url`, `auth_server_url`, deployment mode (`openquok_cloud` vs `custom`), and value sources — no secrets.

## Authentication

```bash
openquok auth:login --json          # agents: device flow on stdout
openquok auth:login --apiKey "opo_…"
openquok auth:status
openquok auth:logout
```

## Integrations

```bash
openquok integrations:list
openquok integrations:settings <integration-uuid>
openquok integrations:trigger <integration-uuid> <method-name> [--data '<json>' | -d '<json>']
```

- `integrations:settings` — rules, `maxLength`, settings schema, allow-listed `tools` (`methodName`, `dataSchema`).
- `integrations:trigger` — single allow-listed method; `--data` must be a JSON object when required.
- New channels are connected in the web app; the CLI uses integration UUIDs from `integrations:list`.

## Posts

```bash
openquok posts:list
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"

openquok posts:create -c "…" -s "2026-01-01T12:00:00Z" -i "<uuid>"
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>"
openquok posts:create -c "…" -s "…" -i "<uuid>" -m '<[{id,path}]>'
openquok posts:create -c "main" -c "reply" -s "…" -d 5000 -i "<uuid>"
openquok posts:create --json ./post.json

openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule
openquok posts:review-todo <post-id> --note "…"
openquok posts:delete <post-id>
openquok posts:missing <post-id>
openquok posts:connect <post-id> --release-id "<provider-release-id>"
```

### `posts:list`

- Default window: ±30 **local calendar** days from today (ISO on the wire).
- Override: `--start` / `--end` (aliases `--startDate` / `--endDate`).
- Filter: `-i` / `--integrations` / `--integrationIds` (CSV), `--customer` / `--customerGroupId`.

### `posts:status`

- Takes a **post row** id from `posts:list` (same as `posts:delete`).
- Flips `draft` ↔ `scheduled` at the stored publish time.

### `posts:missing` / `posts:connect`

- Use when `release_id` is `"missing"`: list provider candidates, then link with `--release-id` (aliases `--releaseId`, `-r`) for per-post analytics.

### Media flags (`-m` / `--media`)

- Value must be a JSON array of `{ "id", "path" }` from `openquok upload` or `openquok upload-from-url` (see Rule 2 in SKILL.md).
- **Thread-style posts:** repeated `-c` for segments; optional repeated `-m` pairs with leading segments. `-d` is **milliseconds** between segments (default 5000).

### `--json` / `-j`

- Full `POST /public/posts` payload: `scheduledAt`, `status`, `bodiesByIntegrationId`, `providerSettingsByIntegrationId`, `media`, tags, etc.

## Analytics

```bash
openquok analytics:platform <integration-uuid> [--days 7|30|90]
openquok analytics:post <post-id> [--days 7|30|90]
```

- `--days` / `-d` must be **7**, **30**, or **90** (default 7).
- `analytics:post` returns `[]` for drafts/queued rows.

## Media upload

```bash
openquok upload ./image.png
openquok upload-from-url "https://cdn.example.com/banner.png"
```

Both return `data.id` and `data.path` or `data.filePath` for use in `-m` / JSON `media`.

## Help

```bash
openquok --help
openquok posts:create --help
```
