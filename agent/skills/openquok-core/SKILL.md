---
name: openquok-core
description: >-
  18/5/26:2 - Schedule and publish social posts via the Openquok CLI (`openquok`, package `@openquok/auto-cli` ≥ 0.0.6).
  Use for auth, integrations, media upload, posts, analytics, and agent drafts with human review.
homepage: https://www.npmjs.com/package/@openquok/auto-cli
metadata: {"openclaw":{"emoji":"📮","requires":{"bins":["openquok"],"env":[]}}}
---

<!-- SPDX-FileCopyrightText: 2026 Rati Montreewat -->
<!-- SPDX-License-Identifier: MIT -->

| Property | Value |
|----------|-------|
| **name** | openquok |
| **description** | AI-ready social scheduling: CLI-first `@openquok/auto-cli` (install **≥ 0.0.6** globally — skills do not upgrade npm), posts, integrations, media; complements stacks like OpenClaw. |
| **allowed-tools** | Bash(openquok:*) |

---

## ⚠️ Hard Rules (Read First)

**0 — CLI version (once per chat).** Skills do not install or upgrade the binary. At session start only: `openquok --version`, report it, offer `npm install -g @openquok/auto-cli@latest` if the user wants an upgrade, then re-check. Do not repeat before every command.

**1 — Auth first.** API commands fail without credentials. Run `openquok auth:status` before anything else.

**2 — Media via workspace upload.** Every `-m` / `--media` / JSON `media[]` entry must be `{id, path}` from `openquok upload` or `openquok upload-from-url`. Never pass raw local paths or bare CDN URLs.

```bash
media_json() { openquok upload "$1" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]'; }
openquok posts:create -c "…" -s "2026-01-01T12:00:00Z" -i "<uuid>" -m "$(media_json ./photo.jpg)"
```

Verify upload stdout with `jq` (require `id` and `path`/`filePath`). Remote assets: `openquok upload-from-url "https://…"`.

---

## Authentication

| Path | When |
|------|------|
| API key | Agents, CI, OpenClaw — `export OPENQUOK_API_KEY=opo_…` or `openquok auth:login --apiKey "opo_…"` |
| Device OAuth | User can open a link on phone/desktop — **`openquok auth:login --json` only** on non-interactive hosts |

- Keys: [Openquok dashboard](https://www.openquok.com/) → developer / API settings.
- Device flow: use **`verification_uri_complete` from CLI stdout only** — never invent URLs or codes.
- Wait until `openquok auth:status` succeeds before other commands.
- `~/.openquok/credentials.json` wins over `OPENQUOK_API_KEY` until `auth:logout`.
- Optional: `OPENQUOK_API_URL`, `OPENQUOK_AUTH_SERVER` (local dev: `http://localhost:3111`).

Details and troubleshooting: [resources/command-reference.md](./resources/command-reference.md#authentication).

---

## Shell safety

- Run **fixed** `openquok` invocations; do not build commands by concatenating untrusted chat text into the shell.
- Put captions and JSON payloads in **quoted** flags, heredocs, or files — not bare `$USER_INPUT` expansions.
- Treat integration UUIDs, post IDs, and schedule times as opaque strings; reject values with shell metacharacters before use.

---

## Workflow

| Step | Action |
|------|--------|
| 1 | `openquok auth:status` (login if needed) |
| 2 | `openquok integrations:list` → `integrations:settings <uuid>` per channel |
| 3 | `integrations:trigger <uuid> <method> -d '{}'` when `output.tools` requires it |
| 4 | `upload` / `upload-from-url` for media; ask user for file or direct image URL if missing in chat |
| 5 | `posts:create` / `posts:status`; agent drafts: `-t draft` + `--note`; update with `posts:review-todo` |
| 6 | `analytics:platform` / `analytics:post` with `-d 7` \| `30` \| `90` |
| 7 | Missing release id: `posts:missing` → `posts:connect --release-id` |

Connect new channels in the web app; the CLI only uses UUIDs from `integrations:list`.

---

## Posting essentials

```bash
# Scheduled post
openquok posts:create -c "Caption" -s "2026-01-01T12:00:00Z" -i "<uuid>"

# Draft + human checklist
openquok posts:create -c "…" -s "…" -t draft -i "<uuid>" --note "Check CTA before schedule"

# Per-channel captions (multi integration)
openquok posts:create -s "…" -i "<uuid-a>,<uuid-b>" \
  --bodiesByIntegrationId '{"<uuid-a>":"Short","<uuid-b>":"Long"}'

# Provider fields (confirm keys via integrations:settings)
openquok posts:create -c "…" -s "…" --settings '{"post_type":"post"}' -i "<uuid>"

# Full API body
openquok posts:create --json ./post.json
```

- Flag-based create **requires** `-s` (ISO-8601) unless `--json` includes `scheduledAt`.
- `--settings` merges into `providerSettingsByIntegrationId` for each `-i` UUID.
- Repeated `-c` (+ optional `-m`, `-d` in **milliseconds**) builds threaded segments — see [resources/command-reference.md](./resources/command-reference.md#media-flags--m----media).

Command surface (list, status, analytics, env): [resources/command-reference.md](./resources/command-reference.md).

---

## Channels (Meta)

Run `integrations:settings` before platform-specific flags.

| Channel | `identifier` | Examples |
|---------|----------------|----------|
| Threads | `threads` | [threads-examples.md](./resources/threads-examples.md) |
| Instagram Login | `instagram-standalone` | [instagram-standalone-examples.md](./resources/instagram-standalone-examples.md) |
| Instagram Page | `instagram-business` | [instagram-business-examples.md](./resources/instagram-business-examples.md) |

Threads publish failures (public URL, SVG, empty object): [threads-publish.md](./resources/threads-publish.md).

---

## More recipes

[resources/patterns.md](./resources/patterns.md) — multi-attachment posts, `integrations:trigger`, JSON campaigns, length checks, batching, retries.

---

## Pitfalls

| Symptom | Fix |
|---------|-----|
| API 401 / auth errors | `auth:login --json` or API key; never fake device URLs |
| Invalid or expired device code | Re-run `auth:login --json`; use fresh `verification_uri_complete` (~15 min) |
| Wrong channel | Re-fetch UUID from `integrations:list` |
| Media rejected at publish | Rule 2: upload first; for Threads see [threads-publish.md](./resources/threads-publish.md) |
| “Image” in chat, no file | Stop; get file path or `https://` URL for `upload-from-url` |
| Empty upload / `Content-Length: 0` | Re-upload a non-empty asset |
| Unknown `integrations:trigger` | Method must appear in `output.tools` |
| `--settings` parse error | Single-quoted JSON: `'{"post_type":"post"}'` |
| Thread timing wrong | `-d` is **milliseconds**, not minutes |
| Analytics rejected | `-d` must be **7**, **30**, or **90** |
| Env key ignored | `auth:logout` if disk credentials exist |
| Old CLI / wrong verify host | `npm install -g @openquok/auto-cli@latest` (≥ 0.0.6); skills install does not upgrade npm |
