# Directory launch — recipes (PeerPush, Uneed, …)

Resolve auth first (**openquok-core**). Placeholders: `<main-profile-id>`, `<variant-profile-id>`, `<customer-group-id>`.

## Agent tasks

| User wants to… | Do this |
|----------------|---------|
| See which launch sites exist | [List destinations](#list-destinations) → filter by `providerSlug` |
| Tie a product to a channel group | [Business profiles](#business-profiles) or create with `--customer-group-id` |
| Start from one canonical product row | [Main profile only](#main-profiles) |
| PeerPush-specific headline/copy | [Ensure PeerPush variant](#peerpush-variant) → patch → check similarity |
| Uneed-specific copy | [Ensure Uneed variant](#uneed-variant) |
| Know what is missing before submit | [Listing summary](#listing-summary) |
| Set logo or screenshots | [Logo and screenshots](#logo-and-screenshots) |
| Compare DR vs rivals | [SEO overview + competitors](#directory-seo) |

---

## List destinations

```bash
openquok directory:destinations:list | jq '.data[] | {providerSlug, name, startUrl}'
```

Use `providerSlug` when choosing `--site-key` for `directory:variants:ensure` (site keys align with catalog slugs such as `peerpush` and `uneed`).

---

## Business profiles

Map social channel groups to product profiles:

```bash
openquok directory:business-profiles:list | jq '.data[] | {integrationCustomerId, productProfileId, name}'
```

---

## Main profiles

```bash
openquok directory:profiles:list --main-only | jq '.data[] | {id, name, profileKind}'
```

Create a main profile (minimal):

```bash
openquok directory:profiles:create --name "Acme" --website-url "https://acme.example"
```

Link to a channel group:

```bash
openquok directory:profiles:create \
  --name "Acme" \
  --website-url "https://acme.example" \
  --customer-group-id <customer-group-id>
```

Patch copy from a file:

```bash
openquok directory:profiles:update <main-profile-id> --json ./profile-patch.json
```

---

## Logo and screenshots

Patch **main** or **variant** profile ids. Screenshots live in `profileData.gallery_urls` (max **3**). `directory:variants:ensure` does not set images — update the variant id after ensure.

**Public https URLs:**

```bash
openquok directory:profiles:update <profile-id> \
  --logo-url "https://cdn.example.com/logo.png" \
  --profile-data '{"gallery_urls":["https://cdn.example.com/s1.png","https://cdn.example.com/s2.png"]}'
```

**Optional** — import into the workspace media library (for posts; not the My Products profile-media bucket), then still point the profile at public https URLs:

```bash
openquok upload-from-url "https://cdn.example.com/logo.png"
# or: openquok upload ./logo.png

openquok directory:profiles:update <profile-id> \
  --logo-url "https://cdn.example.com/logo.png" \
  --profile-data '{"gallery_urls":["https://cdn.example.com/s1.png"]}'
```

MCP: `uploadFromUrl` then `directoryProfilesUpdate` with `logoUrl` and `profileData.gallery_urls`. See [MCP examples — PeerPush](https://www.openquok.com/docs/mcp-examples/peerpush#logo-and-screenshots).

---

## PeerPush variant

Ensure variant row (idempotent):

```bash
openquok directory:variants:ensure <main-profile-id> --site-key peerpush
```

Load variant and compare to main:

```bash
openquok directory:profiles:get <variant-profile-id> | jq '{similarityToMainPercent, name, tagline}'
```

Tailor fields (example flags — prefer `--json` for large `profileData`):

```bash
openquok directory:profiles:update <variant-profile-id> \
  --tagline "Ship faster on PeerPush" \
  --description "One-line pitch tuned for the PeerPush audience."
```

---

## Uneed variant

```bash
openquok directory:variants:ensure <main-profile-id> --site-key uneed
openquok directory:profiles:update <variant-profile-id> --json ./uneed-variant-patch.json
```

---

## Listing summary

Run on main or variant id before the user submits in the browser extension:

```bash
openquok directory:listings <main-profile-id> | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings <main-profile-id> | jq '.data.destinations[] | {providerSlug, submissionStatus, readiness}'
```

Fix `readiness.missingFields` with `directory:profiles:update` on the profile id the listing row references (main or variant).

Read-only submission audit:

```bash
openquok directory:submissions:list --profile <main-profile-id>
```

---

## Directory SEO

Requires **directory SEO** on the plan (separate from launch).

```bash
openquok directory:analytics:overview --profile <main-profile-id> | jq '.data.productDomain.checkedAt'
openquok directory:analytics:history --profile <main-profile-id> -d 30
openquok directory:analytics:refresh --profile <main-profile-id>
openquok directory:analytics:competitors:add --domain rival.example --label "Rival Co"
```

After refresh, inspect `manualRefreshAvailableAt` in the response before calling refresh again.

---

## MCP (same flows)

With OpenQuok MCP connected, use the same order as the CLI sections above.

### Main profile and site copy

- **Main profile** — Your default product record on **My Products** (name, tagline, website, logo). You create or pick this first.
- **Directory variant** — An optional **copy** of the main profile for one launch site (PeerPush, Uneed, …). You can change the variant without changing the main profile for every other site.
- **`mainOnly: true`** on `directoryProfilesList` — Return **only** main profiles. Use this before `directoryVariantsEnsure` so you pass a **main** id, not a variant id. If you omit `mainOnly` or set it to `false`, the list also includes site copies.

OpenQuok does **not** submit the listing for you. These tools prepare data for the browser extension. You submit on peerpush.com or uneed.best yourself.

### Tool order

1. `directoryDestinationsList` — See which launch sites exist in the catalog.
2. `directoryProfilesList` with `mainOnly: true` — Get your main profile id (skip `mainOnly` only when you already need every main and variant row).
3. `directoryVariantsEnsure` with `directorySiteKey: "peerpush"` or `"uneed"` — Create or open the site copy (idempotent).
4. `directoryProfilesUpdate` — Fill or change tagline, description, `logoUrl`, `profileData.gallery_urls`, and other fields on the main or variant row.
5. `directoryListingSummary` with `productProfileId` — See missing fields and readiness before you open the directory site.
6. `directorySeoOverview` / `directorySeoCompetitorsAdd` — Cached domain rating and competitors (separate plan flag).

User-facing docs: [Glossary — Directory launch](https://www.openquok.com/docs/getting-started/glossary#directory-launch). MCP recipes: [MCP examples — PeerPush](https://www.openquok.com/docs/mcp-examples/peerpush), [Uneed](https://www.openquok.com/docs/mcp-examples/uneed).

See [command-reference.md](./command-reference.md#mcp-equivalents) for the full CLI ↔ tool map.
