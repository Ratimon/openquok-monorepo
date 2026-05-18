---
name: openquok-core
description: >-
  16/5/26:2 - Openquok CLI (0.0.6) helps individuals or teams run many social accounts at scale with automation,
  drafts, scheduling, and human approval. Use when driving the `openquok` CLI (`@openquok/auto-cli`). Requires a globally installed CLI on the host (≥ 0.0.6 for hosted device login).
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

## ⚠️ Three Hard Rules (Read First)

**Rule 0 — Global CLI (once per new chat session).** This skill never installs the binary; `npx skills add` only copies these instructions under `.agents/skills/` and does **not** bump the global `openquok` on the host (nor does restarting the gateway). **Only at the start of a new chat session** — not before every `openquok` call — run `openquok --version` once, tell the user the version reported. Ask whether they want to upgrade to the **latest** `@openquok/auto-cli`; if yes, run `npm install -g @openquok/auto-cli@latest` in the environment the agent uses for shell commands, then `openquok --version` again.

**Links:** [npm `@openquok/auto-cli`](https://www.npmjs.com/package/@openquok/auto-cli) · [monorepo](https://github.com/Ratimon/openquok-monorepo/) · [CLI package](https://github.com/Ratimon/openquok-monorepo/tree/main/agent) · [openquok.com](https://www.openquok.com/)

**Rule 1 — Authenticate before anything.** All `@openquok/auto-cli` (`openquok`) commands that call the API fail without valid credentials.

**Rule 2 — Every value passed to `-m` / `--media` (or to media/`image` fields in `--json` payloads) MUST come from workspace upload via `openquok upload` or `openquok upload-from-url`.** Bare local paths (`image.jpg`) and arbitrary external URLs pasted into `-m` are not a substitute: providers expect media that was stored through Openquok’s upload API (with stable `id` + storage `path`). Always:

```bash
RESULT=$(openquok upload <file>)
MEDIA=$(echo "$RESULT" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create ... -m "$MEDIA" ...
```

If you see `-m "something.jpg"` anywhere below, treat it as shorthand for "the `id` + `path` (or `filePath`) from `openquok upload something.jpg`", passed as the JSON array form above — never a raw local filename or ad-hoc URL alone.

---

## ⚠️ Authentication Required

**You MUST authenticate before running any `openquok` command that hits the API.** All commands fail without valid credentials.(see Rule 0: check version **once** at session start, not before every command).

Before doing anything else, check auth status:
```bash
openquok auth:status
```

If not authenticated, choose one path:

### API Key:


```bash
export OPENQUOK_API_KEY=opo_your_key_here
# or persist:
openquok auth:login --apiKey "opo_…"
```

Create the key in the [Openquok dashboard](https://www.openquok.com/) (signed-in workspace → developer / API settings).

### OAuth2 device flow (remote browser; use `--json` from agents)

Use when the user can complete a browser step on **phone or desktop** while the CLI (or agent) keeps polling.

**Agents: never invent a verification URL or user code.** Run the real command and use only values from its output:

```bash
openquok auth:login --json
```

The first JSON object includes `verification_uri_complete` (link with `?code=` prefilled). Give the user **that exact link** — not a bare `/device/verify` URL and not a made-up code.

**What the user does in the browser (two steps):**



**Do NOT proceed with any other commands until authentication is confirmed** (`openquok auth:status` succeeds).

---

## Core Workflow

The fundamental pattern for using the Openquok CLI (`openquok` from `@openquok/auto-cli`):

1. **Authenticate** — Verify or set up authentication (see above).
2. **Discover** — List integrations and read each channel’s rules, limits, and allow-listed tools.
3. **Fetch** — Call `integrations:trigger` when a provider exposes dynamic data (playlists, pages, etc.).
4. **Prepare** — Upload media (`upload` / `upload-from-url`) when the post needs images or video. In chat agents (Telegram, OpenClaw, etc.), if the user wants an image but has not given you a file on the host or a direct `https://` image URL for `upload-from-url`, **ask them for the file or a direct image URL** before creating the post with `-m`.
5. **Post** — Create posts and flip status (`posts:create`, `posts:status`). For human-in-the-loop approval, use `-t draft` and `--note` (kanban review todo); update later with `posts:review-todo`.
6. **Analyze** — Use `analytics:platform` and `analytics:post` with a `7` / `30` / `90` day window.
7. **Resolve** — If per-post analytics indicates a missing provider release id, run `posts:missing`, then `posts:connect --release-id`.

```bash
# 1. Authenticate
openquok auth:status
# If not authenticated (agents): openquok auth:login --json  # or API key above

# 2. Discover
openquok integrations:list
openquok integrations:settings <integration-uuid>

# 3. Fetch (if needed)
openquok integrations:trigger <integration-uuid> <method> -d '{"key":"value"}'

# 4. Prepare
openquok upload ./image.jpg

# 5. Post (media: see Rule 2 — build JSON from upload response)
RESULT=$(openquok upload ./image.jpg)
MEDIA=$(echo "$RESULT" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create -c "Content" -s "2026-01-01T12:00:00Z" -i "<integration-uuid>" -m "$MEDIA"

# 6. Analyze
openquok analytics:platform <integration-uuid> -d 30
openquok analytics:post <post-id> -d 7

# 7. Resolve (when the product surfaces a missing release / analytics gap)
openquok posts:missing <post-id>
openquok posts:connect <post-id> --release-id "<provider-release-id>"
```

---

## Essential Commands

### Authentication

**Option 1: API key (recommended for agents / OpenClaw / CI)**

```bash
export OPENQUOK_API_KEY=opo_your_api_key_here
openquok auth:login --apiKey "opo_…"   # optional: write ~/.openquok/credentials.json
openquok auth:status
```

**Option 2: OAuth2 device flow**

**Agents (OpenClaw, Hermes, CI, SSH, any non-interactive host):** use `--json` only — it prints the device payload and polling result on stdout, does not open a browser on the agent machine, and matches what you must forward to the user (see [Authentication Required](#-authentication-required))
```bash
openquok auth:login --json
openquok auth:status
openquok auth:logout
```

**Humans on a local machine with a TTY:** you may use `openquok auth:login` without `--json` (instructions on stderr; optional browser open after Enter). Do **not** suggest bare interactive login for remote agents — they should use `--json` or an API key.

Device-flow tokens are stored in `~/.openquok/credentials.json`. **Stored credentials take priority over `OPENQUOK_API_KEY`** when both are set; run `auth:logout` if you need the env var to win.

See [Authentication Required](#-authentication-required) for the full browser flow and troubleshooting *Invalid or expired code*.

**Optional overrides**

```bash
export OPENQUOK_API_URL=https://api.openquok.com
export OPENQUOK_AUTH_SERVER=https://cli-auth.openquok.com
```

Use a local `OPENQUOK_AUTH_SERVER` (for example `http://localhost:3111`) when developing `agent/server`.

### Integration discovery

```bash
openquok integrations:list
openquok integrations:settings <integration-uuid>
openquok integrations:trigger <integration-uuid> <method-name> [--data '<json>' | -d '<json>']
```

New channels are connected in the Openquok web app; the CLI consumes the integration UUIDs returned by `integrations:list`.

### Creating posts

```bash
# Simple post (schedule time is required unless --json)
openquok posts:create -c "Content" -s "2026-01-01T12:00:00Z" -i "<integration-uuid>"

# Draft
openquok posts:create -c "Content" -s "2026-01-01T12:00:00Z" -t draft -i "<integration-uuid>"

# Draft + human review todo (CLI sets isAgent automatically)
openquok posts:create -c "Content" -s "2026-01-01T12:00:00Z" -t draft -i "<integration-uuid>" --note "Verify CTA, add collaboration or add music before scheduling"

# Post with media (upload each file first — Rule 2)
MEDIA=$(jq -s 'add' \
  <(openquok upload ./img1.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./img2.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))
openquok posts:create -c "Content" -m "$MEDIA" -s "2026-01-01T12:00:00Z" -i "<integration-uuid>"

# Thread-style body (repeated -c); optional repeated -m pairs with leading segments (see [command-reference.md](./resources/command-reference.md))
MAIN=$(openquok upload ./main.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
C1=$(openquok upload ./comment1.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Main post" -m "$MAIN" \
  -c "First reply" -m "$C1" \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-uuid>"

# Multi-channel (comma-separated integration UUIDs)
openquok posts:create -c "Content" -s "2026-01-01T12:00:00Z" -i "<uuid-a>,<uuid-b>"

# Per-channel bodies
openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -i "<uuid-a>,<uuid-b>" \
  --bodiesByIntegrationId '{"<uuid-a>":"Short","<uuid-b>":"Longer caption"}'

# Platform-specific JSON (merge into each selected integration unless overridden)
openquok posts:create \
  -c "Content" \
  -s "2026-01-01T12:00:00Z" \
  --settings '{"post_type":"post"}' \
  -i "<integration-uuid>"

# Full payload from disk (must match POST /public/posts — see Technical Concepts)
openquok posts:create --json ./post.json
```

### Managing posts

```bash
# Defaults: 30 local calendar days before today through 30 after (override with --start/--end or --startDate/--endDate)
openquok posts:list
openquok posts:list --start "2026-01-01T00:00:00Z" --end "2026-02-01T00:00:00Z"

# Flip draft ↔ scheduled using a post row id from posts:list
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule

openquok posts:delete <post-id>
```

### Analytics

```bash
openquok analytics:platform <integration-uuid>        # default 7 days
openquok analytics:platform <integration-uuid> -d 30
openquok analytics:platform <integration-uuid> --days 90

openquok analytics:post <post-id>
openquok analytics:post <post-id> -d 30
```

`--days` / `-d` must be **7**, **30**, or **90** (enforced by the CLI).

Typical stdout is JSON you can slice with `jq` (followers, impressions, engagement, per-post likes, etc.).

**Missing release id**

When the product reports a missing provider release id for a published row, link analytics by listing candidates then connecting one:

```bash
openquok analytics:post <post-id>
openquok posts:missing <post-id>
openquok posts:connect <post-id> --release-id "<provider-release-id>"
openquok analytics:post <post-id>
```

### Media upload

Always prefer workspace uploads before referencing media in posts (Rule 2). Many networks reject media that was not ingested through your Openquok workspace.

```bash
openquok upload ./image.jpg
openquok upload-from-url "https://cdn.example.com/banner.png"
```

Supported formats follow the backend upload policy (images, video, audio, documents — see product docs). Responses include **`data.id`** and **`data.path` or `data.filePath`**; build `[{id, path}]` for `-m`.

After **`openquok upload`**, sanity-check stdout with `jq` (fail closed if `id` or path is missing). Remote images must use **`openquok upload-from-url`** so the API mirrors bytes into your workspace (Rule 2); do not paste bare CDN URLs into `-m`.

---

## Common patterns

### Pattern 1: Discover and use integration tools

Tool names and payloads are **provider-specific**. For Openquok today, focus on **Threads** and **Instagram** (standalone `instagram-standalone` vs business `instagram-business`). Inspect `output.tools` from `integrations:settings`, then call `integrations:trigger` only for those allow-listed methods.

**Threads — list UUID, inspect tools, trigger when present:**

```bash
TH_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="threads") | .id')
openquok integrations:settings "$TH_ID"
# Replace METHOD with a name from output.tools[].methodName; adjust -d to match dataSchema.
openquok integrations:trigger "$TH_ID" METHOD -d '{}'
```

**Instagram — standalone (Instagram Login) vs business (Facebook Page):**

```bash
IG_STANDALONE_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-standalone") | .id')
openquok integrations:settings "$IG_STANDALONE_ID"

IG_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="instagram-business") | .id')
openquok integrations:settings "$IG_BUSINESS_ID"
```

Replace `METHOD` and the `-d` JSON with values from `output.tools[].methodName` and `dataSchema` for that channel. Some channels may expose an empty `tools` array until the product adds more allow-listed calls.

### Pattern 2: Upload media before posting

```bash
VIDEO=$(openquok upload ./video.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
THUMB=$(openquok upload ./thumbnail.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
MEDIA=$(jq -s 'add' <(echo "$VIDEO") <(echo "$THUMB"))

openquok posts:create \
  -c "Check out my video!" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "<integration-uuid>"
```

### Pattern 3: Multi-segment thread (Threads)

`-d` is **milliseconds** between follow-up segments (converted to `delaySeconds` on the wire); default **5000** ms if omitted.

```bash
INTRO=$(openquok upload ./intro.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
P1=$(openquok upload ./point1.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Thread starter (1/3)" -m "$INTRO" \
  -c "Point one (2/3)" -m "$P1" \
  -c "Conclusion (3/3)" \
  -s "2026-01-01T12:00:00Z" \
  -d 60000 \
  -i "<integration-uuid>"
```

### Pattern 3b: X-style thread (one image per segment; as guardrails)

Same CLI shape as Pattern 3: **every** segment that needs a picture must use media from a **real** `openquok upload` (or `upload-from-url`) result — never a bare filename.

```bash
INTRO=$(openquok upload ./intro.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
P1=$(openquok upload ./point1.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
P2=$(openquok upload ./point2.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
OUTRO=$(openquok upload ./outro.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Thread starter (1/4)" -m "$INTRO" \
  -c "Point one (2/4)" -m "$P1" \
  -c "Point two (3/4)" -m "$P2" \
  -c "Conclusion (4/4)" -m "$OUTRO" \
  -s "2026-01-01T12:00:00Z" \
  -d 2000 \
  -i "<integration-uuid>"
```

Use the integration UUID for the channel you are posting to (`integrations:list`). If the user only described images in chat without providing files or URLs, stop and collect assets first (see **Prepare** in Core Workflow).

### Pattern 4: Campaign via JSON file

Use the **`POST /public/posts`** shape. Example skeleton:

```bash
cat > campaign.json << 'EOF'
{
  "scheduledAt": "2026-01-01T12:00:00.000Z",
  "status": "scheduled",
  "body": "Default caption",
  "integrationIds": ["<uuid-a>", "<uuid-b>"],
  "bodiesByIntegrationId": {
    "<uuid-a>": "Short version for channel A",
    "<uuid-b>": "Longer version for channel B"
  },
  "media": [
    { "id": "<from upload>", "path": "<from upload>" }
  ],
  "providerSettingsByIntegrationId": {
    "<uuid-a>": {},
    "<uuid-b>": {}
  }
}
EOF

openquok posts:create --json ./campaign.json
```

Fill `media` and per-integration settings using `upload` / `integrations:settings`.

### Pattern 5: Validate length before posting

```bash
#!/usr/bin/env bash
INTEGRATION_ID="<integration-uuid>"
CONTENT="Your post content here"

SETTINGS_JSON=$(openquok integrations:settings "$INTEGRATION_ID")
MAX_LENGTH=$(echo "$SETTINGS_JSON" | jq '.output.maxLength')

if [ "${#CONTENT}" -gt "$MAX_LENGTH" ]; then
  echo "Content exceeds $MAX_LENGTH chars, truncating..."
  CONTENT="${CONTENT:0:$((MAX_LENGTH - 3))}..."
fi

openquok posts:create \
  -c "$CONTENT" \
  -s "2026-01-01T12:00:00Z" \
  -i "$INTEGRATION_ID"
```

### Pattern 6: Batch scheduling

```bash
#!/usr/bin/env bash
DATES=("2026-02-14T09:00:00Z" "2026-02-15T09:00:00Z" "2026-02-16T09:00:00Z")
CONTENT=("Monday motivation" "Tuesday tips" "Wednesday wisdom")

for i in "${!DATES[@]}"; do
  MEDIA=$(openquok upload "post-${i}.jpg" | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
  openquok posts:create \
    -c "${CONTENT[$i]}" \
    -s "${DATES[$i]}" \
    -i "<integration-uuid>" \
    -m "$MEDIA"
done
```

### Pattern 7: Error handling and retry

```bash
#!/usr/bin/env bash
CONTENT="Your post content"
INTEGRATION_ID="<integration-uuid>"
DATE="2026-01-01T12:00:00Z"
MAX_RETRIES=3

for attempt in $(seq 1 "$MAX_RETRIES"); do
  if openquok posts:create -c "$CONTENT" -s "$DATE" -i "$INTEGRATION_ID"; then
    echo "Post created successfully"
    break
  fi
  echo "Attempt $attempt failed"
  if [ "$attempt" -lt "$MAX_RETRIES" ]; then
    sleep $((2 ** attempt))
  else
    exit 1
  fi
done
```

---

## Technical concepts

### Integration tools workflow

1. **List tools** — `integrations:settings` → `output.tools[]` (`methodName`, `description`, `dataSchema`).
2. **Call a tool** — `integrations:trigger <uuid> <methodName> [-d '<json object>']`.
3. **Use the result** — Response shape is `{ "output": ... }`; contents vary by provider method.

Allow-listed tools today are scoped to **Meta**: **Threads** (`threads`), **Instagram (Instagram Login / standalone)** (`instagram-standalone`), and **Instagram (Facebook Page / business)** (`instagram-business`). Method names and payloads differ per channel — always read `integrations:settings` for the live `output.tools` list before calling `integrations:trigger`.

### Provider settings

Openquok merges CLI `--settings` JSON into **`providerSettingsByIntegrationId`** for every `-i` UUID. For multi-segment posts, the CLI also synthesizes a per-integration **`replies`** array (message + `delaySeconds`) from repeated `-c` / `-d`.

Authoritative field names for a channel come from `integrations:settings` and the dashboard composer.

### Threading and media

Repeated `-c` builds the root `body` (first segment) plus threaded `replies` in provider settings. Media for those segments is supplied via repeated `-m` / JSON `media` as documented in [command-reference.md](./resources/command-reference.md).

### Dates

- Schedule / create: `-s` / `--scheduledAt` — ISO-8601 string (required for flag-based `posts:create`).
- todo note: `-n` / `--note` on `posts:create` (optional human checklist on agent drafts); `posts:review-todo <postId> --note` to update later. Humans mark reviewed in the web app (session API), not via CLI.
- List: `--start` / `--end` (aliases `--startDate` / `--endDate`).
- Defaults for `posts:list`: ±30 **local calendar** days from today, serialized to ISO timestamps.

### Upload response

Typical shape (envelope may include `success` / `message` depending on route):

```json
{
  "data": {
    "id": "media-id",
    "path": "storage/path/or/url",
    "filePath": "alternate-field-name"
  }
}
```

Always prefer `jq` that tolerates `path` vs `filePath`.

### JSON mode vs flags

**Flags** — fast path for one body, optional uploads, optional `--settings`.

**`--json` / `-j`** — supply a full `POST /public/posts` object (draft vs scheduled, `bodiesByIntegrationId`, `providerSettingsByIntegrationId`, `media`, tags, repeats, …).

---

## Platform-specific examples

Always run `openquok integrations:settings <uuid>` for the exact JSON your workspace expects. Detailed snippets live under `resources/` (markdown only — do not link to TypeScript or other source files from the skill):

- [resources/threads-examples.md](./resources/threads-examples.md) — Threads text, image, multi-segment threads, tool discovery.
- [resources/instagram-standalone-examples.md](./resources/instagram-standalone-examples.md) — Instagram Login feed and story.
- [resources/instagram-business-examples.md](./resources/instagram-business-examples.md) — Page-linked professional account.
- [resources/threads-publish.md](./resources/threads-publish.md) — How media URLs are resolved and published server-side (debugging Meta errors).

---

## Extra recommendations

If you generate images or video elsewhere (hosted URLs), **`openquok upload-from-url`** mirrors them into the workspace so Rule 2 stays satisfied without a manual download step. For local renders, **`openquok upload ./file`** remains the simplest path.

External media CLIs can still fit upstream of `upload-from-url` when their output is a stable `https://` URL you are allowed to fetch.

---

## Supporting resources

Markdown references for agents (paths relative to this skill directory):

- [resources/command-reference.md](./resources/command-reference.md) — Full command surface: env vars, `posts:status`, media flags, threading, analytics.
- [resources/threads-examples.md](./resources/threads-examples.md) — Threads CLI examples.
- [resources/instagram-standalone-examples.md](./resources/instagram-standalone-examples.md) — Instagram standalone examples.
- [resources/instagram-business-examples.md](./resources/instagram-business-examples.md) — Instagram business examples.
- [resources/threads-publish.md](./resources/threads-publish.md) — Threads server publish behavior (public URLs, SVG, reachability, Graph flow).

---

## Common gotchas

1. **Not authenticated** — Run `openquok auth:login --json` (or export `OPENQUOK_API_KEY`) before API commands. For OpenClaw/Telegram, prefer an API key; for OAuth, share only `verification_uri_complete` from stdout (never fabricate codes).
2. **OAuth "Invalid or expired code"** — The user code is missing from the auth server (expired ~15m, typo, or agent invented the link). Re-run `openquok auth:login --json` while the CLI polls; use the prefilled `verification_uri_complete` URL. Signing in at openquok.com alone does not validate the device code — that happens only after step 1 succeeds and the browser redirects to openquok.com.
3. **Wrong integration UUID** — Refresh with `integrations:list`; IDs are per workspace.
4. **Settings mismatch** — Check `integrations:settings`  for required fields.
5. **Media skipped upload** — Rule 2: every `-m` / JSON `media[]` entry needs `id` + `path` from `upload` / `upload-from-url`.
6. **Chat said “with an image” but no file arrived** — Do not schedule with `-m` until you have a file or direct image URL (see **Prepare** in Core Workflow). Empty or placeholder uploads break Threads (and other providers) at publish time.
7. **Upload succeeded but object is empty** — If publish fails with vague Threads / Graph errors, curl the logged public media URL: **`Content-Length: 0`** means storage has no bytes (bad upload source or agent wrote an empty file). Fix the asset and re-upload.
8. **Shell JSON quoting** — Prefer single quotes around JSON literals: `--settings '{"post_type":"post"}'`.
9. **Missing schedule** — Flag-based `posts:create` requires `-s` unless `--json` supplies `scheduledAt`.
10. **Unknown tool** — `integrations:trigger` only runs methods listed under `output.tools`.
11. **Character limits** — Read `output.maxLength` from `integrations:settings`.
12. **Provider gaps** — `output.tools` may be empty for a Meta channel until a method is allow-listed; do not assume a tool exists without checking `integrations:settings`.
13. **Thread delay units** — `-d` on `posts:create` is **milliseconds**, not minutes.
14. **Analytics window** — Only `7`, `30`, or `90` days.
15. **Env vs disk credentials** — Stored login wins over `OPENQUOK_API_KEY` until `auth:logout`.
16. **Stale global CLI** — If `auth:login` fails with *verification_uri … expected cli-auth.openquok.com*, upgrade: `npm install -g @openquok/auto-cli@latest` (need **≥ 0.0.6** for `www.openquok.com` verify URLs). `npx skills add` and gateway restarts do **not** change `openquok --version`; reinstall the npm package on the agent host.

---

## Quick reference

```bash
# Authenticate first (agents: --json or API key; humans locally may omit --json)
openquok auth:status
openquok auth:login --json
openquok auth:logout
export OPENQUOK_API_KEY=opo_...

# Discovery
openquok integrations:list
openquok integrations:settings <uuid>
openquok integrations:trigger <uuid> <method> -d '{}'

# Media (Rule 2)
openquok upload ./file
openquok upload-from-url "https://…"

# Posting
openquok posts:create -c "text" -s "2026-01-01T12:00:00Z" -i "<uuid>"
openquok posts:create -c "text" -s "2026-01-01T12:00:00Z" -t draft -i "<uuid>"
openquok posts:create -c "text" -s "2026-01-01T12:00:00Z" -i "<uuid>" -m "$(openquok upload ./img.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')"
openquok posts:create -c "main" -c "reply" -s "2026-01-01T12:00:00Z" -i "<uuid>"
openquok posts:create --json ./post.json
openquok posts:review-todo <post-id> --note "Updated checklist for human"
openquok posts:review-todo <post-id> --reviewed true   # CLI keeps isAgentEdited true; dashboard review checkbox clears it

# Management
openquok posts:list
openquok posts:status <post-id> --status draft
openquok posts:status <post-id> -s schedule
openquok posts:delete <post-id>

# Analytics & recovery
openquok analytics:platform <uuid> -d 30
openquok analytics:post <post-id> -d 7
openquok posts:missing <post-id>
openquok posts:connect <post-id> --release-id "<id>"

# Help
openquok --help
openquok posts:create --help
```
