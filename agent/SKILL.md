---
name: openquok-core
description: Openquok is a tool to helps individuals or teams to run many social accounts at scale (especially as AI multiplies output) with an automation pipeline—draft, schedule, and publish—plus review and approval workflows so humans give final sign-off before anything goes live.
homepage: https://www.npmjs.com/package/@openquok/auto-cli
metadata: {"openclaw":{"emoji":"📮","requires":{"bins":[],"env":[]}}}
---

## Install @openquok/auto-cli package if it doesn't exist


```bash
npm install -g @openquok/auto-cli
# or
pnpm install -g @openquok/auto-cli
```

npm release: https://www.npmjs.com/package/@openquok/auto-cli
openquok github: https://github.com/Ratimon/openquok-monorepo/
openquok cli github: https://github.com/Ratimon/openquok-monorepo/tree/main/agent
official website: https://www.openquok.com/
---

| Property | Value |
|----------|-------|
| **name** | openquok |
| **description** | AI-ready social scheduling: human approval in the dashboard, CLI-first `@openquok/auto-cli` for agents (posts, integrations, media), and a draft-to-publish pipeline that complements autonomous agent stacks eg. OpenClaw. |
| **allowed-tools** | Bash(openquok:*) |

---

## ⚠️ Two Hard Rules (Read First)

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

**You MUST authenticate before running any `openquok` command that hits the API.** Those calls fail without valid credentials.

Before doing anything else, check auth status:
```bash
openquok auth:status
```

If not authenticated, either:
1. **OAuth2 (device flow):** `openquok auth:login`
2. **API Key:** `export OPENQUOK_API_KEY=your_api_key` (or `openquok auth:login --apiKey "…"` to store in `~/.openquok/credentials.json`)

**Do NOT proceed with any other commands until authentication is confirmed.**

---