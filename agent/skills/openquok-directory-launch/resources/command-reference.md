# Directory launch — CLI command reference

Auth, env vars, and social commands live in **openquok-core** (`resources/command-reference.md` there). This file covers `directory:*` only.

All commands print JSON `{ success, data, … }` to stdout unless noted.

## Plan gates

- **Directory launch** — every command except `directory:analytics:*` and `directory:analytics:competitors:*`
- **Directory SEO** — `directory:analytics:overview`, `history`, `refresh`, `competitors:*`
- **Public API** — valid `opo_` token or device OAuth credentials (see openquok-core)

## Destinations and business profiles

| Command | Description |
|---------|-------------|
| `directory:destinations:list` | Published launch catalog (`providerSlug`, name, `startUrl`, extension config) |
| `directory:business-profiles:list` | Rows linking `integrationCustomerId` (channel group) to `productProfileId` |

## Profiles

| Command | Flags / args |
|---------|----------------|
| `directory:profiles:list` | `--customer-group-id <uuid>` → API `integrationCustomerId`; `--main-only` client filter (no `parentProfileId`) |
| `directory:profiles:get <id>` | Full DTO: `profileData`, `similarityToMainPercent`, variant fields |
| `directory:profiles:create` | `--name`, `--tagline`, `--description`, `--website-url`, `--logo-url`, `--customer-group-id`, `--profile-data '<json>'`, `-j` / `--json <file>` |
| `directory:profiles:update <id>` | Same flags as create; `-j` / `--json` patch file |

`--json` bodies omit `organizationId` (org comes from the API key).

**Logo and screenshots:** `--logo-url` and `profileData.gallery_urls` (max 3) on create/update. No CLI upload into My Products profile media — use public https URLs or the web composer; optional `openquok upload` / `upload-from-url` only add workspace media for posts. Recipe: [directory-launch-examples.md](./directory-launch-examples.md#logo-and-screenshots).

## Variants, listings, submissions

| Command | Flags / args |
|---------|----------------|
| `directory:variants:ensure <mainId>` | `--site-key` (required): e.g. `peerpush`, `uneed`; optional `--name` |
| `directory:listings <profileId>` | Aggregated counts + per-destination `readiness` / submission status |
| `directory:submissions:list` | `--profile <id>`, optional `--destination <id>` (read-only) |

## Directory SEO (analytics)

| Command | Flags / args |
|---------|----------------|
| `directory:analytics:overview` | `--profile <productProfileId>` — response includes `checkedAt` on domain metrics |
| `directory:analytics:history` | `--profile <id>`, `-d` / `--days` (1–366, default 90) |
| `directory:analytics:refresh` | `--profile <id>`, optional `--force` when plan allows |
| `directory:analytics:competitors:add` | `--domain` (required), `--label`, `--sort-order` |
| `directory:analytics:competitors:remove` | `--domain` |
| `directory:analytics:competitors:update` | `--domain`, `--label` (omit or empty to clear) |

Cached metrics: treat `checkedAt` as last provider check time; after refresh, read `manualRefreshAvailableAt` before calling refresh again.

## MCP equivalents

| CLI | MCP tool |
|-----|----------|
| `directory:destinations:list` | `directoryDestinationsList` |
| `directory:profiles:list` | `directoryProfilesList` (`integrationCustomerId`, `mainOnly`) |
| `directory:profiles:get` | `directoryProfilesGet` |
| `directory:profiles:create` | `directoryProfilesCreate` |
| `directory:profiles:update` | `directoryProfilesUpdate` |
| `directory:variants:ensure` | `directoryVariantsEnsure` |
| `directory:listings` | `directoryListingSummary` |
| `directory:submissions:list` | `directorySubmissionsList` |
| `directory:analytics:overview` | `directorySeoOverview` |
| `directory:analytics:history` | `directorySeoHistory` |
| `directory:analytics:refresh` | `directorySeoRefresh` |
| `directory:analytics:competitors:*` | `directorySeoCompetitorsAdd` / `Remove` / `Update` |
