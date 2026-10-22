---
name: openquok-directory-launch
description: >-
  Prepare product profiles and directory-tailored variants for launch sites (PeerPush, Uneed, …),
  inspect listing readiness, and read cached directory SEO metrics via the openquok CLI or hosted MCP tools.
homepage: https://www.openquok.com/docs/cli-usages/directory-launch
version: 1.0.0
license: MIT
compatibility: >-
  Requires the global openquok CLI on PATH and the openquok-core skill for auth and shell safety.
  Does not replace openquok-core. Directory launch and directory SEO need matching workspace plan capabilities.
prerequisites:
  commands: [openquok]
metadata: {"openclaw":{"emoji":"📂","always":false,"requires":{"bins":["openquok"]},"homepage":"https://www.openquok.com/docs/cli-usages/directory-launch"},"hermes":{"tags":["directory","openquok","seo","launch"],"category":"marketing","requires_toolsets":["terminal"]}}
---

<!-- SPDX-FileCopyrightText: 2026 Rati Montreewat -->
<!-- SPDX-License-Identifier: MIT -->

# OpenQuok Directory Launch

Product profiles, per-directory variants, listing readiness, and cached domain-rating analytics — **CLI** (`directory:*`) or **hosted MCP** (`directory*` / `directorySeo*` tools).

This skill **never replaces openquok-core**. Follow **openquok-core** for session bootstrap, authentication (device OAuth or `opo_` token), and **Shell safety** before any API work.

| Property | Value |
|----------|-------|
| **name** | openquok-directory-launch |
| **requires** | openquok-core, global `openquok` CLI |
| **allowed-tools** | Bash(openquok:*) |

---

## Plan capabilities

| Capability | CLI / MCP scope |
|------------|-----------------|
| **directory launch** | Destinations, business-profile rows, profile CRUD, idempotent variants, listing summary, read-only submissions |
| **directory SEO** | Overview, history, manual refresh, competitor add/remove/update |
| **public API** | All routes still need a programmatic token (`opo_`) or device login that stores API credentials |

Directory launch commands fail without **directory launch** on the plan; analytics commands fail without **directory SEO**. Social scheduling stays on **openquok-core**.

---

## Core workflow (CLI)

| Step | Action |
|------|--------|
| 1 | Auth per **openquok-core** (`openquok auth:status`, `openquok auth:workspace`) |
| 2 | `openquok directory:destinations:list` — published catalog (`providerSlug`, `startUrl`) |
| 3 | Resolve main profile: `directory:profiles:list --main-only` or `directory:business-profiles:list` (channel group ↔ product) |
| 4 | `directory:variants:ensure <mainId> --site-key <key>` — idempotent variant (`peerpush`, `uneed`, …) |
| 5 | `directory:profiles:get <variantId>` — check `similarityToMainPercent` and `profileData` before launch |
| 6 | `directory:listings <profileId>` — per-destination `readiness.missingFields` and submission counts |
| 7 | SEO (separate plan flag): `directory:analytics:overview --profile <id>` — use **`checkedAt`** on metrics; respect **`manualRefreshAvailableAt`** before `directory:analytics:refresh` |
| 8 | Competitors: `directory:analytics:competitors:add|update|remove` (workspace quota on add) |

Recipes by destination: [resources/directory-launch-examples.md](./resources/directory-launch-examples.md). Full command matrix: [resources/command-reference.md](./resources/command-reference.md).

---

## MCP workflow (hosted OpenQuok server)

When the user’s IDE or agent has **OpenQuok MCP** connected, prefer tools over shelling out — same public API behavior and plan gates.

| User goal | MCP tools (order) |
|-----------|-------------------|
| Discover launch sites | `directoryDestinationsList` |
| List / create / patch profiles | `directoryProfilesList` → `directoryProfilesCreate` / `directoryProfilesUpdate` |
| Load one profile | `directoryProfilesGet` |
| “Create/open PeerPush or Uneed profile” (variant) | `directoryProfilesList` (`mainOnly`) → `directoryVariantsEnsure` (`directorySiteKey` `peerpush` / `uneed`) |
| “Fill” or update tailored copy | `directoryProfilesUpdate` on variant `productProfileId` |
| Pre-launch checklist | `directoryListingSummary` (`productProfileId`) |
| Submission rows (read-only) | `directorySubmissionsList` |
| Cached DR + competitors | `directorySeoOverview` → `directorySeoHistory` → `directorySeoRefresh` when cooldown allows |
| Competitor CRUD | `directorySeoCompetitorsAdd` / `Remove` / `Update` |

Typical chain: **profiles list → variants ensure → listing summary → SEO overview**. Metrics are **cached** — read `checkedAt` on domain rows and `manualRefreshAvailableAt` after refresh.

Hosted tool reference: [OpenQuok MCP tools](https://www.openquok.com/docs/mcp-references/tools) (directory launch + directory SEO sections).

---

## v1 out of scope

Do **not** attempt via CLI or these MCP tools:

- Submission intent, complete, or manual complete flows
- PATCH listing URLs on destinations
- Social `posts:create` for directory sites (use **openquok-core** for connected social channels)

---

## Pitfalls

| Symptom | Fix |
|---------|-----|
| 403 / plan denied on `directory:*` | Workspace needs directory launch (+ public API token) |
| Analytics 403 | Directory SEO capability; overview/history/refresh/competitors are separate from launch |
| Stale DR numbers | Normal — check `checkedAt`; call refresh only when `manualRefreshAvailableAt` allows |
| Variant already exists | `directory:variants:ensure` is idempotent (200 + existing row) |
| Wrong site copy | Variants are keyed by `directorySiteKey` — match `providerSlug` from destinations list |
| Logo/screenshots missing on autofill | Set public `https` on `logoUrl` and `profileData.gallery_urls` (max 3) via `directory:profiles:update`; `upload` / `upload-from-url` are workspace media for posts — not auto-bound to profiles |
| Untrusted chat in shell | **openquok-core** Shell safety — fixed commands, JSON in files/heredocs |

---

## Quick reference

```bash
openquok directory:destinations:list
openquok directory:profiles:list --main-only
openquok directory:variants:ensure <main-profile-id> --site-key peerpush
openquok directory:listings <profile-id>
openquok directory:analytics:overview --profile <profile-id>
```
