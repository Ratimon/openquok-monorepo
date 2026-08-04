---
name: openquok-tiktok-slideshow
description: >-
  Generate TikTok photo-carousel slideshows with a locked character (AI images + text overlays)
  and post via the openquok CLI. Use for any niche/channel persona — research, lock character,
  generate frames, overlay text, draft or schedule through openquok-core.
homepage: https://www.openquok.com/docs/other-skills/openquok-tiktok-slideshow
version: 1.0.0
license: MIT
compatibility: >-
  Requires Node 18+, openquok on PATH (openquok-core), and node-canvas for overlays.
  Install this skill with Copy (not Symlink) so scripts/ are real files. Does not replace openquok-core.
prerequisites:
  commands: [openquok, node]
metadata: {"openclaw":{"emoji":"🎞️","always":false,"requires":{"bins":["openquok","node"]},"homepage":"https://www.openquok.com/docs/other-skills/openquok-tiktok-slideshow"},"hermes":{"tags":["tiktok","slideshow","openquok","marketing"],"category":"social-media","requires_toolsets":["terminal"]}}
---

<!-- SPDX-FileCopyrightText: 2026 Rati Montreewat -->
<!-- SPDX-License-Identifier: MIT -->

# OpenQuok TikTok Slideshow

Lightweight creator tooling: **research channel → lock character → generate → overlay → post via openquok**.

This skill **never replaces openquok-core**. It assumes `openquok` is on PATH, uses core media Rule 2 (`upload` → `{id,path}`), and TikTok photo-carousel / private-draft recipes from openquok-core.

| Property | Value |
|----------|-------|
| **name** | openquok-tiktok-slideshow |
| **requires** | openquok-core (CLI), Node 18+, canvas (overlays), image provider key |
| **allowed-tools** | Bash(openquok:*), Bash(node:*) |

---

## Install (Copy required)

Scripts must land as **real files** (not agent-dir symlinks only):

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-tiktok-slideshow --copy -y
```

Interactive installs: Project scope + **Copy**. Hermes: copy the **full** skill folder (URL install of `SKILL.md` alone omits `scripts/`).

Native overlay dependency (`canvas`) and image-provider setup: see [homepage](https://www.openquok.com/docs/other-skills/openquok-tiktok-slideshow).

---

## Prerequisites

| Need | Notes |
|------|-------|
| **openquok-core** + global CLI | Auth, `upload`, `posts:create` |
| **Node.js 18+** | All scripts under `scripts/` |
| **canvas** | Text overlays (`add-text-overlay.js`) — install per OS docs on homepage |
| **Image provider** | Prefer OpenAI `gpt-image-1.5` (not `gpt-image-1`); or Stability / Replicate / local images |
| **TikTok (or other) integration** | Connected in the OpenQuok workspace; UUID from `openquok integrations:list` |

Verify CLI before API work:

```bash
openquok --version
openquok auth:status
```

---

## First run — conversational onboarding

Ask one or two things at a time. End with `scripts/onboarding.js --validate`.

### Phase 0: Account warmup (optional)

If the TikTok account is new or barely used, warm it up **7–14 days** before posting AI slideshows. Established accounts can skip to Phase 1.

### Phase 1: Channel intent

Define niche, audience pain, handle ideas, and platforms (TikTok and/or others). This is a **creator/channel** workspace — not an App Store product profile.

### Phase 2: Research any channel

Ask before browsing. Find 3–5 accounts in the niche: hooks, formats, sounds, gaps. Save with `scripts/competitor-research.js` → `channel-research.json`. Guide: [references/competitor-research.md](./references/competitor-research.md).

### Phase 3: Lock character

Conversationally define identity; write `character-profile.json` from [references/character-profile.template.json](./references/character-profile.template.json) (`LOCKED` immutable traits + `VARIATIONS` per post). Generate and save **face_lock** / **body_lock** under `refs/`. Never change locks after approval. Details: [references/character-lock.md](./references/character-lock.md). Slide formula: [references/slide-structure.md](./references/slide-structure.md).

### Phase 4: OpenQuok channel

1. Confirm auth (`openquok auth:status`)
2. `openquok integrations:list` → store UUID(s) on `openquok.integrationId`
3. Prefer **private draft**: `privacyLevel: "SELF_ONLY"`, `contentPostingMethod: "DIRECT_POST"` so a human adds trending audio before going public

### Phase 5: Scaffold + pipeline

```bash
node scripts/onboarding.js --init --dir tiktok-marketing/
node scripts/onboarding.js --validate --config tiktok-marketing/config.json
```

Then: generate → overlay → post (below). Iterate a test set of six frames until the look is locked — do not post until the user is happy.

### Config shape (`tiktok-marketing/config.json`)

```json
{
  "channel": {
    "name": "",
    "handle": "",
    "niche": "",
    "audience": "",
    "painPoint": "",
    "platforms": ["tiktok"]
  },
  "character": {
    "profilePath": "tiktok-marketing/character-profile.json",
    "referenceImages": {
      "faceLock": "tiktok-marketing/refs/face-lock.png",
      "bodyLock": "tiktok-marketing/refs/body-lock.png"
    }
  },
  "imageGen": {
    "provider": "openai",
    "apiKey": "",
    "model": "gpt-image-1.5"
  },
  "openquok": {
    "integrationId": "",
    "status": "scheduled",
    "privacyLevel": "SELF_ONLY",
    "contentPostingMethod": "DIRECT_POST",
    "scheduledAt": null,
    "title": ""
  },
  "posting": { "schedule": ["07:30", "16:30", "21:00"] },
  "research": "tiktok-marketing/channel-research.json",
  "strategy": "tiktok-marketing/strategy.json"
}
```

Workspace data lives **outside** the skill folder (`tiktok-marketing/`).

---

## Core workflow

### 1. Generate slideshow images

```bash
node scripts/generate-slides.js \
  --config tiktok-marketing/config.json \
  --output tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --prompts prompts.json
```

`prompts.json` options:

- Legacy strings: `{ "base": "…", "slides": [ /* 6 strings */ ] }`
- Locked variations: `{ "slides": [ { "outfit", "pose", "expression", "setting", "visual_style", "framing" }, …×6 ] }`

When `character.profilePath` is set, the script prepends the **LOCKED** block and merges **VARIATIONS**. OpenAI attaches face/body lock images when those files exist.

- Portrait `1024x1536`; resume skips existing `slideN_raw.png`
- Set exec timeout ≥ **600s** for six `gpt-image-1.5` images
- Providers: `openai` | `stability` | `replicate` | `local`

### 2. Add text overlays

```bash
node scripts/add-text-overlay.js \
  --input tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --texts texts.json
```

Requires `canvas`. Overlay rules:

- White fill + thick black outline; ~6.5% of width; centered ~30% from top; max width 75%
- Prefer manual `\n` breaks; 4–6 words/line; reactions not labels; **no emoji**
- Six-slide formula: Hook → Problem → Discovery → Transform ×2 → CTA — [references/slide-structure.md](./references/slide-structure.md)

### 3. Post via openquok

```bash
node scripts/post-via-openquok.js \
  --config tiktok-marketing/config.json \
  --dir tiktok-marketing/posts/YYYY-MM-DD-HHmm/ \
  --caption "…" \
  --title "Short title"
```

Under the hood:

1. `openquok upload` each `slideN.png` → `{id, path}`
2. `openquok posts:create --json` TikTok photo carousel
3. Writes `meta.json` with `postId` + media ids

**Default:** `SELF_ONLY` + `DIRECT_POST` (private on profile). Human adds trending audio, then publishes. Aligns with openquok-core TikTok private-draft recipes.

Caption structure: Hook → Problem → Discovery → payoff → ≤5 hashtags. Conversational, not salesy.

Platform analytics (optional, via core — not this skill):

```bash
openquok analytics:platform <integration-uuid> --days 7
```

---

## Shell safety

- Run **fixed** `openquok` / `node scripts/…` invocations; do not concatenate untrusted chat into the shell.
- Put captions and JSON in quoted flags, heredocs, or files.
- Treat integration UUIDs and post IDs as opaque strings.

---

## Posting schedule

Default suggestion (audience timezone): **07:30**, **16:30**, **21:00**. Consistency beats sporadic spikes.

Additional channels: schedule separate OpenQuok posts with other integration UUIDs (openquok-core) — this skill’s poster targets the configured integration id.

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Landscape 1536×1024 | Portrait **1024×1536** |
| Symlink skill install | Reinstall with **`--copy`** so `scripts/` are real files |
| Raw local paths in `posts:create` | Always `openquok upload` first (core Rule 2) |
| Public direct post with no sound | Prefer `SELF_ONLY` draft → add trending audio in-app |
| `gpt-image-1` | Switch to **`gpt-image-1.5`** |
| Skipping warmup on a new account | Warm 7–14 days first |
| Changing face/body after lock | Keep LOCKED + ref images fixed; only edit VARIATIONS |

---

## Quick reference

| Script | Purpose |
|--------|---------|
| `scripts/onboarding.js` | `--init` / `--validate` workspace |
| `scripts/competitor-research.js` | Channel research JSON helpers |
| `scripts/generate-slides.js` | 6× portrait frames from locked profile |
| `scripts/add-text-overlay.js` | Canvas text overlays |
| `scripts/post-via-openquok.js` | Upload + TikTok carousel create |
