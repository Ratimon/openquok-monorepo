-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

INSERT INTO storage.buckets (
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'listing_images',
    'listing_images',
    TRUE,
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.module_configs (module_name, config) VALUES
(
    'listings',
    '{
  "EXTENSIONS_META_TITLE": "Skills & MCP Hub",
  "EXTENSIONS_META_DESCRIPTION": "Browse skills and MCP server extensions for your agent stack.",
  "LISTING_SCHEMA_TYPE": "SoftwareApplication",
  "PRE_ADMIN_APPROVE_NEW_LISTINGS": false,
  "PRE_ADMIN_APPROVE_UPDATED_LISTINGS": true
}'::jsonb
)
ON CONFLICT (module_name) DO NOTHING;



-- ---------------------------
-- Official OpenQuok Core listing (Skills + MCP)
-- Body mirrors agent/skills/openquok-core/SKILL.md (public catalog seed).
-- ---------------------------

INSERT INTO public.listings (
    id,
    owner_id,
    published_at,
    title,
    slug,
    description,
    description_skills,
    description_mcp,
    excerpt,
    click_url,
    click_url_skills,
    click_url_mcp,
    content,
    content_skills,
    content_mcp,
    listing_kind,
    extension_type,
    install_command_skills,
    install_command_mcp,
    is_official,
    source_repo_url,
    skill_source_url,
    skill_name,
    license,
    version,
    mcp_tools,
    mcp_transport,
    mcp_server_config,
    is_user_published,
    is_admin_published,
    schema_type,
    listing_category_id,
    faq,
    listing_tag_slugs
) VALUES (
    'd5f7b000-0000-4000-a000-000000000101',
    NULL,
    NOW(),
    'OpenQuok Core',
    'openquok-core',
    'Schedule and manage social posts with the openquok CLI — authenticate, upload media, create drafts and scheduled posts, and read channel analytics for integrations in your OpenQuok workspace.',
    'Schedule and manage social posts with the openquok CLI — authenticate, upload media, create drafts and scheduled posts, and read channel analytics for integrations in your OpenQuok workspace.',
    NULL,
    'Schedule and manage social posts with the openquok CLI — authenticate, upload media, create drafts and scheduled posts, and read channel analytics for integrati',
    NULL,
    'https://www.openquok.com/docs/getting-started-for-cli',
    'https://www.openquok.com/docs/agent-setup-guides',
    'https://www.openquok.com/docs/mcp-setup-guides',
    $openquok_core_skill$<!-- SPDX-FileCopyrightText: 2026 Rati Montreewat -->
<!-- SPDX-License-Identifier: MIT -->

## Session opening (first turn after reset)

**When:** first assistant reply after `/new`, `/reset`, a new channel thread, or a “new session started” notice.

**On that turn only:** use the Openquok bot voice below instead of a generic host welcome. Do **not** reuse this block on later turns.

**One message only.** Run shell (below), then send **exactly one** assistant message. Forbidden on this turn:

- A persona line before tools (e.g. “Hello, … I’m Atlas … What should we focus on?”).
- A second message with only CLI version (e.g. “The Openquok CLI version is 0.0.6.”).
- Repeating the host greeting after the system “new session started” line.

**Shell (before any user-visible text):**

```bash
openquok --version
openquok auth:status
```

If `auth:status` shows `"connected": true`, also run `openquok auth:workspace`.

**Required opening sentence (verbatim start):** `Hi, I am the Openquok bot.`

**Same message must also include:**

1. Installed CLI version from `openquok --version`.
2. If the user may be on an old build: note that skill install does not upgrade the CLI and offer to walk through upgrade using the [CLI package page](https://www.npmjs.com/package/@openquok/auto-cli) — only after they agree.
3. Auth: if connected, say you are authenticated and name **`workspace.name`**; if not, say not authenticated and offer the **two-step device flow** (below) or a programmatic token (`opo_`). **Never** run `auth:login --json` without `--no-poll` on messaging hosts — the shell exits before credentials are stored.

**Fill-in template (one paragraph — replace `…` from shell output):**

> Hi, I am the Openquok bot. Openquok CLI is …. [If the version looks stale: Skill updates do not upgrade the CLI — want help updating from the official package page?] [If connected: You're authenticated; workspace is …. | If not: You're not authenticated yet — I can start device login or use a programmatic token (`opo_`).]

After this opening message, normal persona and task help are fine. Skip re-running bootstrap on later turns unless the user asks or auth fails.

| Property | Value |
|----------|-------|
| **name** | openquok |
| **description** | AI-ready social scheduling via the `openquok` CLI (global binary — separate from this skill): posts, integrations, media, analytics. |
| **allowed-tools** | Bash(openquok:*) |

---

## ⚠️ Hard Rules (Read First)

**0 — Session opening.** Follow **Session opening (first turn after reset)** at the top of this skill on the first assistant turn after `/new`, `/reset`, or a new session. Skills do not install or upgrade the `openquok` binary.

**Links:** [npm `@openquok/auto-cli`](https://www.npmjs.com/package/@openquok/auto-cli) · [monorepo](https://github.com/Ratimon/openquok-monorepo/) · [CLI package](https://github.com/Ratimon/openquok-monorepo/tree/main/agent) · [openquok.com](https://www.openquok.com/)

**1 — Auth before API work.** Any command that calls the API needs valid credentials. After bootstrap, re-check only when a command fails with auth errors.

**2 — Media via workspace upload.** Every `-m` / `--media` / JSON `media[]` entry must be `{id, path}` from `openquok upload` or `openquok upload-from-url`. Never pass raw local paths or bare CDN URLs.

```bash
media_json() { openquok upload "$1" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]'; }
openquok posts:create -c "…" -s "2026-01-01T12:00:00Z" -i "<uuid>" -m "$(media_json ./photo.jpg)"
```

Verify upload stdout with `jq` (require `id` and `path`/`filePath`). Remote assets: `openquok upload-from-url "https://…"`.

---

## Authentication

| Order | Path | Use |
|-------|------|-----|
| 1 | **Device OAuth (two steps)** | Messaging agents (Telegram/Hermes): `auth:login --json --no-poll` → user opens `verification_uri_complete` → `auth:login:poll --device-code <device_code>` → `auth:status` |
| 2 | **Programmatic token** | Headless or when device flow fails: `export OPENQUOK_API_KEY=opo_…` or `openquok auth:login --apiKey "opo_…"` |

**Device OAuth on messaging hosts (required two-step):**

```bash
openquok auth:login --json --no-poll
# send verification_uri_complete to the user; wait until they confirm they authorized
openquok auth:login:poll --device-code "<device_code from stdout>"
openquok auth:status
```

- Tokens: [Openquok dashboard](https://www.openquok.com/) → **Settings → Developers → Access** → **Generate / Rotate token** (shown once).
- Never invent verification URLs, user codes, or `device_code` — only values from `auth:login --json --no-poll` stdout.
- Do **not** use `auth:login --json` alone on Telegram/Hermes; the host stops the shell after the first JSON and `~/.openquok/credentials.json` is never written.
- Disk credentials in `~/.openquok/credentials.json` take precedence over `OPENQUOK_API_KEY` until `auth:logout`.
- Workspace context: `openquok auth:workspace` → `{ workspace: { id, name } }`.
- Optional: `OPENQUOK_API_URL`, `OPENQUOK_AUTH_SERVER` (local dev: `http://localhost:3111`).

Details: [resources/command-reference.md](./resources/command-reference.md#authentication).

---

## Shell safety

- Run **fixed** `openquok` invocations; do not build commands by concatenating untrusted chat text into the shell.
- Put captions and JSON payloads in **quoted** flags, heredocs, or files — not bare `$USER_INPUT` expansions.
- Treat integration UUIDs, post IDs, and schedule times as opaque strings; reject values with shell metacharacters before use.

---

## Workflow

| Step | Action |
|------|--------|
| 1 | Session opening (Rule 0): shell version/auth check, then one Openquok-bot greeting |
| 2 | `openquok integrations:list` → `integrations:settings <uuid>` per channel |
| 3 | `integrations:trigger <uuid> <method> -d '{}'` when `output.tools` requires it |
| 4 | `upload` / `upload-from-url` for media; ask user for file or direct image URL if missing in chat |
| 5 | `posts:create` / `posts:status`; agent drafts: `-t draft` + `--note`; TikTok inbox/private drafts: `--note` with finish-in-app checklist; update with `posts:review-todo` |
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
openquok posts:create --json ./examples/threads-text-only.json
```

- Flag-based create **requires** `-s` (ISO-8601) unless `--json` includes `scheduledAt`.
- `--settings` merges into `providerSettingsByIntegrationId` for each `-i` UUID; per-UUID maps use `--providerSettingsByIntegrationId`. See [resources/provider-settings.md](./resources/provider-settings.md).
- Repeated `-c` (+ optional `-m`, `-d` in **milliseconds**) can build follow-up segments — for Meta Threads/Instagram follow-ups prefer nested `threads` / `instagram` buckets in channel examples.

Command surface: [resources/command-reference.md](./resources/command-reference.md).

---

## Channels (Meta)

Run `integrations:settings <uuid>` for `rules`, `maxLength`, and `tools`. Match the user’s goal to the **Agent tasks** table in each channel file; publish keys and recipes are there.

Provider settings overview: [resources/provider-settings.md](./resources/provider-settings.md).

| Channel | `identifier` | User intents (see file) | Examples |
|---------|----------------|-------------------------|----------|
| Threads | `threads` | text/media/carousel, reply chain, finisher, engagement plug, missing post | [threads-examples.md](./resources/threads-examples.md) |
| Facebook Page | `facebook` | text, link preview, photo, carousel, Reel, comments | [facebook-examples.md](./resources/facebook-examples.md) |
| Instagram Login | `instagram-standalone` | feed, carousel, Reel, Story, trial reel, comments | [instagram-standalone-examples.md](./resources/instagram-standalone-examples.md) |
| Instagram Page | `instagram-business` | same as standalone (Page-linked OAuth) | [instagram-business-examples.md](./resources/instagram-business-examples.md) |
| YouTube | `youtube` | MP4 upload, title/privacy/tags/thumbnail, channel analytics | [youtube-examples.md](./resources/youtube-examples.md) |
| TikTok | `tiktok` | direct publish, inbox upload (`UPLOAD`), private `SELF_ONLY` drafts, privacy, toggles, analytics | [tiktok-examples.md](./resources/tiktok-examples.md) |
| LinkedIn | `linkedin` | personal profile posts, images, video, text comments | [linkedin-examples.md](./resources/linkedin-examples.md) |
| LinkedIn Page | `linkedin-page` | Page picker, document carousel, Page + post analytics | [linkedin-page-examples.md](./resources/linkedin-page-examples.md) |
| X | `x` | text/media, thread replies, finisher, reply settings, analytics | [x-examples.md](./resources/x-examples.md) |

Threads publish failures: [threads-publish.md](./resources/threads-publish.md).

---

## More recipes

[resources/patterns.md](./resources/patterns.md) — multi-attachment posts, `integrations:trigger`, JSON campaigns, length checks, batching, retries.

---

## Pitfalls

| Symptom | Fix |
|---------|-----|
| API 401 / auth errors | Two-step device OAuth (`auth:login --json --no-poll` then `auth:login:poll`); or programmatic token (`opo_`); never fake device URLs |
| Device login OK in browser but CLI has no credentials | Messaging host ended `auth:login --json` before polling — use `--no-poll` + `auth:login:poll`, or `auth:login --apiKey` |
| Invalid or expired device code | Re-run `auth:login --json --no-poll`; use fresh `verification_uri_complete` (~30 min) |
| Wrong channel | Re-fetch UUID from `integrations:list` |
| Media rejected at publish | Rule 2: upload first; for Threads see [threads-publish.md](./resources/threads-publish.md) |
| “Image” in chat, no file | Stop; get file path or `https://` URL for `upload-from-url` |
| Empty upload / `Content-Length: 0` | Re-upload a non-empty asset |
| Unknown `integrations:trigger` | Method must appear in `output.tools` |
| `--settings` parse error | Single-quoted JSON: `'{"post_type":"post"}'` |
| Thread timing wrong | `-d` is **milliseconds**, not minutes |
| Analytics rejected | `-d` must be **7**, **30**, or **90** |
| Env key ignored | `auth:logout` if disk credentials exist |
| Old CLI / wrong verify host | Compare `openquok --version` with the current release on the [CLI package page](https://www.npmjs.com/package/@openquok/auto-cli); reinstall or upgrade the binary there — skill install does not update it |
$openquok_core_skill$,
    $openquok_core_skill$<!-- SPDX-FileCopyrightText: 2026 Rati Montreewat -->
<!-- SPDX-License-Identifier: MIT -->

## Session opening (first turn after reset)

**When:** first assistant reply after `/new`, `/reset`, a new channel thread, or a “new session started” notice.

**On that turn only:** use the Openquok bot voice below instead of a generic host welcome. Do **not** reuse this block on later turns.

**One message only.** Run shell (below), then send **exactly one** assistant message. Forbidden on this turn:

- A persona line before tools (e.g. “Hello, … I’m Atlas … What should we focus on?”).
- A second message with only CLI version (e.g. “The Openquok CLI version is 0.0.6.”).
- Repeating the host greeting after the system “new session started” line.

**Shell (before any user-visible text):**

```bash
openquok --version
openquok auth:status
```

If `auth:status` shows `"connected": true`, also run `openquok auth:workspace`.

**Required opening sentence (verbatim start):** `Hi, I am the Openquok bot.`

**Same message must also include:**

1. Installed CLI version from `openquok --version`.
2. If the user may be on an old build: note that skill install does not upgrade the CLI and offer to walk through upgrade using the [CLI package page](https://www.npmjs.com/package/@openquok/auto-cli) — only after they agree.
3. Auth: if connected, say you are authenticated and name **`workspace.name`**; if not, say not authenticated and offer the **two-step device flow** (below) or a programmatic token (`opo_`). **Never** run `auth:login --json` without `--no-poll` on messaging hosts — the shell exits before credentials are stored.

**Fill-in template (one paragraph — replace `…` from shell output):**

> Hi, I am the Openquok bot. Openquok CLI is …. [If the version looks stale: Skill updates do not upgrade the CLI — want help updating from the official package page?] [If connected: You're authenticated; workspace is …. | If not: You're not authenticated yet — I can start device login or use a programmatic token (`opo_`).]

After this opening message, normal persona and task help are fine. Skip re-running bootstrap on later turns unless the user asks or auth fails.

| Property | Value |
|----------|-------|
| **name** | openquok |
| **description** | AI-ready social scheduling via the `openquok` CLI (global binary — separate from this skill): posts, integrations, media, analytics. |
| **allowed-tools** | Bash(openquok:*) |

---

## ⚠️ Hard Rules (Read First)

**0 — Session opening.** Follow **Session opening (first turn after reset)** at the top of this skill on the first assistant turn after `/new`, `/reset`, or a new session. Skills do not install or upgrade the `openquok` binary.

**Links:** [npm `@openquok/auto-cli`](https://www.npmjs.com/package/@openquok/auto-cli) · [monorepo](https://github.com/Ratimon/openquok-monorepo/) · [CLI package](https://github.com/Ratimon/openquok-monorepo/tree/main/agent) · [openquok.com](https://www.openquok.com/)

**1 — Auth before API work.** Any command that calls the API needs valid credentials. After bootstrap, re-check only when a command fails with auth errors.

**2 — Media via workspace upload.** Every `-m` / `--media` / JSON `media[]` entry must be `{id, path}` from `openquok upload` or `openquok upload-from-url`. Never pass raw local paths or bare CDN URLs.

```bash
media_json() { openquok upload "$1" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]'; }
openquok posts:create -c "…" -s "2026-01-01T12:00:00Z" -i "<uuid>" -m "$(media_json ./photo.jpg)"
```

Verify upload stdout with `jq` (require `id` and `path`/`filePath`). Remote assets: `openquok upload-from-url "https://…"`.

---

## Authentication

| Order | Path | Use |
|-------|------|-----|
| 1 | **Device OAuth (two steps)** | Messaging agents (Telegram/Hermes): `auth:login --json --no-poll` → user opens `verification_uri_complete` → `auth:login:poll --device-code <device_code>` → `auth:status` |
| 2 | **Programmatic token** | Headless or when device flow fails: `export OPENQUOK_API_KEY=opo_…` or `openquok auth:login --apiKey "opo_…"` |

**Device OAuth on messaging hosts (required two-step):**

```bash
openquok auth:login --json --no-poll
# send verification_uri_complete to the user; wait until they confirm they authorized
openquok auth:login:poll --device-code "<device_code from stdout>"
openquok auth:status
```

- Tokens: [Openquok dashboard](https://www.openquok.com/) → **Settings → Developers → Access** → **Generate / Rotate token** (shown once).
- Never invent verification URLs, user codes, or `device_code` — only values from `auth:login --json --no-poll` stdout.
- Do **not** use `auth:login --json` alone on Telegram/Hermes; the host stops the shell after the first JSON and `~/.openquok/credentials.json` is never written.
- Disk credentials in `~/.openquok/credentials.json` take precedence over `OPENQUOK_API_KEY` until `auth:logout`.
- Workspace context: `openquok auth:workspace` → `{ workspace: { id, name } }`.
- Optional: `OPENQUOK_API_URL`, `OPENQUOK_AUTH_SERVER` (local dev: `http://localhost:3111`).

Details: [resources/command-reference.md](./resources/command-reference.md#authentication).

---

## Shell safety

- Run **fixed** `openquok` invocations; do not build commands by concatenating untrusted chat text into the shell.
- Put captions and JSON payloads in **quoted** flags, heredocs, or files — not bare `$USER_INPUT` expansions.
- Treat integration UUIDs, post IDs, and schedule times as opaque strings; reject values with shell metacharacters before use.

---

## Workflow

| Step | Action |
|------|--------|
| 1 | Session opening (Rule 0): shell version/auth check, then one Openquok-bot greeting |
| 2 | `openquok integrations:list` → `integrations:settings <uuid>` per channel |
| 3 | `integrations:trigger <uuid> <method> -d '{}'` when `output.tools` requires it |
| 4 | `upload` / `upload-from-url` for media; ask user for file or direct image URL if missing in chat |
| 5 | `posts:create` / `posts:status`; agent drafts: `-t draft` + `--note`; TikTok inbox/private drafts: `--note` with finish-in-app checklist; update with `posts:review-todo` |
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
openquok posts:create --json ./examples/threads-text-only.json
```

- Flag-based create **requires** `-s` (ISO-8601) unless `--json` includes `scheduledAt`.
- `--settings` merges into `providerSettingsByIntegrationId` for each `-i` UUID; per-UUID maps use `--providerSettingsByIntegrationId`. See [resources/provider-settings.md](./resources/provider-settings.md).
- Repeated `-c` (+ optional `-m`, `-d` in **milliseconds**) can build follow-up segments — for Meta Threads/Instagram follow-ups prefer nested `threads` / `instagram` buckets in channel examples.

Command surface: [resources/command-reference.md](./resources/command-reference.md).

---

## Channels (Meta)

Run `integrations:settings <uuid>` for `rules`, `maxLength`, and `tools`. Match the user’s goal to the **Agent tasks** table in each channel file; publish keys and recipes are there.

Provider settings overview: [resources/provider-settings.md](./resources/provider-settings.md).

| Channel | `identifier` | User intents (see file) | Examples |
|---------|----------------|-------------------------|----------|
| Threads | `threads` | text/media/carousel, reply chain, finisher, engagement plug, missing post | [threads-examples.md](./resources/threads-examples.md) |
| Facebook Page | `facebook` | text, link preview, photo, carousel, Reel, comments | [facebook-examples.md](./resources/facebook-examples.md) |
| Instagram Login | `instagram-standalone` | feed, carousel, Reel, Story, trial reel, comments | [instagram-standalone-examples.md](./resources/instagram-standalone-examples.md) |
| Instagram Page | `instagram-business` | same as standalone (Page-linked OAuth) | [instagram-business-examples.md](./resources/instagram-business-examples.md) |
| YouTube | `youtube` | MP4 upload, title/privacy/tags/thumbnail, channel analytics | [youtube-examples.md](./resources/youtube-examples.md) |
| TikTok | `tiktok` | direct publish, inbox upload (`UPLOAD`), private `SELF_ONLY` drafts, privacy, toggles, analytics | [tiktok-examples.md](./resources/tiktok-examples.md) |
| LinkedIn | `linkedin` | personal profile posts, images, video, text comments | [linkedin-examples.md](./resources/linkedin-examples.md) |
| LinkedIn Page | `linkedin-page` | Page picker, document carousel, Page + post analytics | [linkedin-page-examples.md](./resources/linkedin-page-examples.md) |
| X | `x` | text/media, thread replies, finisher, reply settings, analytics | [x-examples.md](./resources/x-examples.md) |

Threads publish failures: [threads-publish.md](./resources/threads-publish.md).

---

## More recipes

[resources/patterns.md](./resources/patterns.md) — multi-attachment posts, `integrations:trigger`, JSON campaigns, length checks, batching, retries.

---

## Pitfalls

| Symptom | Fix |
|---------|-----|
| API 401 / auth errors | Two-step device OAuth (`auth:login --json --no-poll` then `auth:login:poll`); or programmatic token (`opo_`); never fake device URLs |
| Device login OK in browser but CLI has no credentials | Messaging host ended `auth:login --json` before polling — use `--no-poll` + `auth:login:poll`, or `auth:login --apiKey` |
| Invalid or expired device code | Re-run `auth:login --json --no-poll`; use fresh `verification_uri_complete` (~30 min) |
| Wrong channel | Re-fetch UUID from `integrations:list` |
| Media rejected at publish | Rule 2: upload first; for Threads see [threads-publish.md](./resources/threads-publish.md) |
| “Image” in chat, no file | Stop; get file path or `https://` URL for `upload-from-url` |
| Empty upload / `Content-Length: 0` | Re-upload a non-empty asset |
| Unknown `integrations:trigger` | Method must appear in `output.tools` |
| `--settings` parse error | Single-quoted JSON: `'{"post_type":"post"}'` |
| Thread timing wrong | `-d` is **milliseconds**, not minutes |
| Analytics rejected | `-d` must be **7**, **30**, or **90** |
| Env key ignored | `auth:logout` if disk credentials exist |
| Old CLI / wrong verify host | Compare `openquok --version` with the current release on the [CLI package page](https://www.npmjs.com/package/@openquok/auto-cli); reinstall or upgrade the binary there — skill install does not update it |
$openquok_core_skill$,
    NULL,
    'extension',
    'both',
    'npx skills add https://github.com/Ratimon/openquok-monorepo --skill openquok-core -y',
    NULL,
    TRUE,
    'https://github.com/Ratimon/openquok-monorepo',
    'https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md',
    'openquok-core',
    'MIT',
    '1.0.0',
    '[{"name": "groupList", "description": "List channel groups (customers) for the authenticated workspace. Use a group id with integrationList to filter channels."}, {"name": "integrationList", "description": "List connected social media channels for the authenticated workspace. Optionally filter by channel group id from groupList."}, {"name": "integrationSchema", "description": "Return posting rules, character limits, compose settings schema, and allow-listed tools for a platform (provider identifier, e.g. threads, facebook)."}, {"name": "triggerTool", "description": "Invoke an allow-listed provider method on a connected channel (same as POST /public/integration-trigger/:id)."}, {"name": "schedulePostTool", "description": "Create or schedule social posts across connected channels. Supports draft, schedule, and publish-now modes."}]'::jsonb,
    'http',
    '{"url": "https://api.openquok.com/mcp", "auth": "Bearer opo_your_programmatic_token", "name": "openquok", "version": "1.0.0", "transport": "http"}'::jsonb,
    TRUE,
    TRUE,
    'SoftwareApplication',
    'd5f7b000-0000-4000-a000-000000000006',
    '[]'::jsonb,
    ARRAY[]::text[]
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    description_skills = EXCLUDED.description_skills,
    description_mcp = EXCLUDED.description_mcp,
    excerpt = EXCLUDED.excerpt,
    click_url = EXCLUDED.click_url,
    click_url_skills = EXCLUDED.click_url_skills,
    click_url_mcp = EXCLUDED.click_url_mcp,
    content = EXCLUDED.content,
    content_skills = EXCLUDED.content_skills,
    content_mcp = EXCLUDED.content_mcp,
    listing_kind = EXCLUDED.listing_kind,
    extension_type = EXCLUDED.extension_type,
    install_command_skills = EXCLUDED.install_command_skills,
    install_command_mcp = EXCLUDED.install_command_mcp,
    is_official = EXCLUDED.is_official,
    source_repo_url = EXCLUDED.source_repo_url,
    skill_source_url = EXCLUDED.skill_source_url,
    skill_name = EXCLUDED.skill_name,
    license = EXCLUDED.license,
    version = EXCLUDED.version,
    mcp_tools = EXCLUDED.mcp_tools,
    mcp_transport = EXCLUDED.mcp_transport,
    mcp_server_config = EXCLUDED.mcp_server_config,
    is_user_published = EXCLUDED.is_user_published,
    is_admin_published = EXCLUDED.is_admin_published,
    schema_type = EXCLUDED.schema_type,
    listing_category_id = EXCLUDED.listing_category_id,
    faq = EXCLUDED.faq,
    listing_tag_slugs = EXCLUDED.listing_tag_slugs,
    updated_at = NOW(),
    published_at = COALESCE(public.listings.published_at, EXCLUDED.published_at);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;
