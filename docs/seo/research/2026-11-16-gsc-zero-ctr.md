# GSC zero-CTR remediation — research record

**Observation date:** 2026-11-16  
**Evidence label:** **Measured** (Google Search Console export: `Queries.csv` and page-level performance, unless noted otherwise)  
**Goal:** Document threshold queries, cluster ownership, shipped meta patterns from the remediation plan, Track B scale-up inclusion, and a 28-day re-check checklist.

**Program tracks:**

| Track | GSC signal | Goal | Primary levers |
| --- | --- | --- | --- |
| **A — Fix snippet** | High impressions, ~0% CTR | Earn clicks at current visibility | Meta, FAQ titles, compare descriptions (sections below through Track A) |
| **B — Scale winners** | Low–mid impressions, **high CTR**, often position 3–15 | **More impressions** without breaking what works | Internal links, compare pairs, light content, blog backlog (§ Track B) |

**Do not** rewrite `metaTitle` / `metaDescription` on Track B URLs that already exceed ~3% CTR unless GSC shows position improved but CTR collapsed after a prior change.

---

## Track A — Inclusion rules (zero / near-zero CTR)

| Signal | Threshold |
| --- | --- |
| Query | ≥200 impressions and (0 clicks **or** CTR &lt; 1%) in `Queries.csv` |
| Page | ≥500 impressions and CTR &lt; 0.5% where the fix is snippet/intent (not deep-rank-only) |

**Fix routing (position vs action):**

| Avg position | Primary action |
| --- | --- |
| ~1–15, CTR near 0 | Snippet: `metaTitle`, `metaDescription`, FAQ title/body |
| &gt; ~20 | Rank / consolidate URLs; avoid snippet-only work as the sole lever |

---

## Track B — Scale-up inclusion rules (high CTR, low impressions)

**Evidence:** **Measured** from the same Nov 2026 GSC export (`Queries.csv`, `Pages.csv`). Re-apply these filters on each monthly export; rows below are the baseline snapshot tied to observation date 2026-11-16.

**Interpretation:** High CTR on few impressions means the **snippet and intent already match**; growth is mostly **ranking** (positions 3–8 → 1–3) and **distribution** (internal links from pages with thousands of impressions).

| Level | Query rule | Page rule |
| --- | --- | --- |
| **Tier 1 (scale now)** | ≥10 impressions, CTR ≥5%, avg position ≤15 | ≥50 impressions, CTR ≥2.5%, avg position ≤15 |
| **Tier 2 (watchlist)** | ≥5 impressions, CTR ≥8%, avg position ≤25 | ≥30 impressions, CTR ≥3%, avg position ≤20 |
| **Exclude** | Brand `openquok` (navigational — separate brand strategy) | URLs already assigned to Track A snippet rewrites in the same remediation cycle |

**GSC filter recipe (repeat monthly):**

1. **Queries** — export all rows; keep Tier 1 query rows with spreadsheet filters (imp, CTR, position); repeat for Tier 2 with stricter CTR.
2. **Pages** — same for landing URLs; map each winning query to its primary URL via **Query × Page** when the query table alone is ambiguous.
3. **Diff** — drop any page whose `metaTitle` / `metaDescription` is slated for Track A in the active PR; log excluded URLs in the decision log.

### Measured winner clusters (baseline export)

| Cluster | Example queries (imp, CTR, pos) | Winning URLs (page CTR) | Scale lever |
| --- | --- | --- | --- |
| **Open-source scheduler compare** | `mixpost vs postiz` (188, 3.2%, 2.8); `postiz free alternative` (48, 6.3%, 6.9); `postiz open source alternative` (21, 14%, 3.1) | `/alternatives/postiz` (3.36%), `/alternatives/mixpost` (2.59%), `/compare/mixpost/openquok` | Replicate Postiz-style meta on Track A alternatives; **link to** winners from Later/Socialync alternatives and compare hub |
| **Grok Bot × channel** | `grok bot facebook` (131, 3.8%, 3.3); `grok bot tiktok` (56, 3.6%, 3.9) | `/agents/grok-bot` (low page CTR; high CTR on channel-tagged queries) | Channel grids + FAQ links to `/agents/grok-bot/{channel}`; avoid host meta churn if sub-query CTR holds |
| **Free tools (photo editor)** | `tiktok photo editor` (12, 25%, 4.6); `youtube photo editor` (11, 9%, 7.9); `threads photo edit` (33, 6%, 8.1) | `/tools/photo-editor/tiktok` (3.65%), `/photo-editor/instagram` (6.67%), `/photo-editor/threads` | Internal links from `/tools`, channel landings, footer; Tier-3 `seoIntro` only — **do not** change working metaTitle `Free {Platform} Photo Editor — No Sign Up` |
| **Humanizer** | `linkedin post humanizer` (17, 17.7%, 5.3); `video humanizer` (20, 10%, 4.8) | `/tools/humanizer/linkedin` (4.67%), `/tools/humanizer` hub (2.69%) | Cross-link from blog, `/channels/linkedin`, agent landings |
| **Build backlinks** | `instagram backlink` (24, 12.5%, 3.25) | `/build-backlinks/instagram` (4.2%) | Footer Resources, Instagram channel, directory landings |
| **Directory** | `automated directory submission` (12, 8.3%, 19.4) | `/build-backlinks`, `/directory-submission-tool` | Link from alternatives hub directory section and marketing landing |
| **Exact agent skill** | `chatgpt instagram agent skill` (1, 100%, 8) | `/agents/chatgpt/instagram` (or skill-builder) | Programmatic title contains **skill** + channel; hub link from `/agents/chatgpt` |

### Tier 1 winner queries (**Measured**, meets query rule)

| Query | Impressions | CTR | Avg position | Primary URL | Tier gate |
| --- | ---: | ---: | ---: | --- | --- |
| postiz open source alternative | 21 | 14% | 3.1 | `/alternatives/postiz` | Tier 1 query |
| tiktok photo editor | 12 | 25% | 4.6 | `/tools/photo-editor/tiktok` | Tier 1 query |
| linkedin post humanizer | 17 | 17.7% | 5.3 | `/tools/humanizer/linkedin` | Tier 1 query |
| instagram backlink | 24 | 12.5% | 3.25 | `/build-backlinks/instagram` | Tier 1 query |
| video humanizer | 20 | 10% | 4.8 | `/tools/humanizer` (confirm Query×Page) | Tier 1 query |
| youtube photo editor | 11 | 9% | 7.9 | `/photo-editor/youtube` or `/tools/photo-editor/youtube` (Query×Page) | Tier 1 query |
| postiz free alternative | 48 | 6.3% | 6.9 | `/alternatives/postiz` | Tier 1 query |
| threads photo edit | 33 | 6% | 8.1 | `/photo-editor/threads` | Tier 1 query |
| blotato vs buffer | 17 | 5.9% | 4.4 | `/compare/blotato/buffer` | Tier 1 query |
| postiz vs postbridge | 15 | 6.7% | 3.4 | `/compare/postiz/post-bridge` (verify slug) | Tier 1 query |

**Near winners (cluster priority; query CTR below Tier 1 floor or position edge):** `mixpost vs postiz` (188 imp, 3.2% CTR, pos 2.8) — scale via impressions/rank and page-level Tier 1 signals, not meta rewrite. `grok bot facebook` / `grok bot tiktok` — page CTR low; channel landings are the scale target.

### Tier 2 watchlist queries (**Measured**, meets Tier 2 query rule)

| Query | Impressions | CTR | Avg position | Primary URL | Notes |
| --- | ---: | ---: | ---: | --- | --- |
| recurpost vs buffer | 5 | 20% | 4.2 | `/compare/recurpost/buffer` | Promote compare card; link from Recurpost alternatives |
| automated directory submission | 12 | 8.3% | 19.4 | `/directory-submission-tool` | Position 19.4 — Tier 2 query only (pos &gt; 15) |

### Tier 1 winning pages (**Measured**, meets page rule)

| Page | Impressions | CTR | Avg position | Notes |
| --- | ---: | ---: | ---: | --- |
| `/alternatives/postiz` | **Measured** (export) | 3.36% | ≤15 | Do not snippet-rewrite in Track A PR |
| `/alternatives/mixpost` | **Measured** | 2.59% | ≤15 | Same |
| `/tools/photo-editor/tiktok` | **Measured** | 3.65% | ≤15 | Preserve metaTitle |
| `/photo-editor/instagram` | **Measured** | 6.67% | ≤15 | High CTR — link in only |
| `/tools/humanizer/linkedin` | **Measured** | 4.67% | ≤15 | Cross-link priority |
| `/tools/humanizer` (hub) | **Measured** | 2.69% | ≤15 | Hub FAQ / links |
| `/build-backlinks/instagram` | **Measured** | 4.2% | ≤15 | Footer + channel |

### Tier 2 watchlist pages (**Measured**, meets Tier 2 page rule)

Re-run page export with Tier 2 filters; add rows below after Query×Page confirms canonical URL. Baseline: any programmatic tool/channel URL with CTR ≥3%, imp ≥30, pos ≤20 not listed in Track A tables.

### Internal linking matrix (Track B — Workstream 9.1)

| Source (high imp, Track A) | Anchor / context | Target (Track B winner) |
| --- | --- | --- |
| `/alternatives/later`, `/alternatives/socialync`, `/alternatives/buffer` | FAQ or “Open-source options” | `/alternatives/postiz`, `/compare/openquok/postiz` |
| `/channels/bluesky` (after Track A meta) | Feature or FAQ | `/tools/photo-editor/bluesky` only if media intent matches — not for “free trial” queries |
| `/agents/grok-bot` | Channel section intros | `/agents/grok-bot/facebook`, `/agents/grok-bot/tiktok` |
| `/channels/instagram`, `/channels/threads` | Docs banner or FAQ | `/build-backlinks/instagram`, `/tools/photo-editor/instagram` |
| `/alternatives` hub — social section intro | Named winners in copy | Postiz, Mixpost alternatives (cards exist — elevate in intro) |

Use `faqLink` / `InternalLink` patterns per **web-hosted-marketing-links**. Extend footer link builders only when a **new link class** is needed — not one row per query.

### Compare / alternatives coverage (Workstream 9.2)

| Query pattern | Action |
| --- | --- |
| `blotato vs buffer` | Verify `/compare/blotato/buffer` indexable; meta names both; link from `/alternatives/blotato` |
| `postiz vs postbridge` | Same for postiz/post-bridge slug pair |
| `recurpost vs buffer` | Hub compare card; link from Recurpost alternatives page |

No new competitor files unless a slug is missing from `PUBLIC_COMPARE_PRODUCTS`.

### Track B blog backlog (operator — Workstream 9.4)

CMS / **secret-admin** only (no SQL seeds in this repo). Full SERP briefs and blog-manager copy-paste blocks:

**[`docs/blog/gsc-track-b-blog-backlog-blog-manager-copy-paste.md`](../../blog/gsc-track-b-blog-backlog-blog-manager-copy-paste.md)**

| Query | GSC signal | Slug (draft) | Topic | Primary internal links |
| --- | --- | --- | --- | --- |
| `instagram backlink` | **Measured** Tier 1 — 24 imp, 12.5% CTR, pos 3.25 | `instagram-backlinks-seo-workflow-openquok` | Educational Guides (`…0201`) | `/build-backlinks/instagram`, `/channels/instagram` |
| `agentic social media scheduler` | Plan backlog (category SERP **Proxy** 2026-11-16) | `agentic-social-media-scheduler-mcp-openquok` | Feature Walkthroughs (`…0203`) | `/agents`, `/pricing`, `/docs/getting-started-for-mcp`, `/tools/skill-builder` |
| `automated directory submission` | **Measured** Tier 2 — 12 imp, 8.3% CTR, pos 19.4 | `automated-directory-submission-diy-openquok` | Educational Guides (`…0201`) | `/directory-submission-tool`, `/build-backlinks`, `/browser-extension` |

**SERP handoff notes (per serp-analysis skill):**

| Post | Dominant intent | Snippet / PAA target | Do not duplicate in `content` |
| --- | --- | --- | --- |
| Instagram backlinks | Informational | Definition + table of link surfaces; PAA on nofollow and bio destination | Four FAQ rows in admin only |
| Agentic scheduler | Commercial + how-to | Definition of “agentic”; MCP/API/CLI table; HowTo JSON-LD in steps 1–3 | Four FAQ rows + HowTo steps in admin only |
| Automated directory submission | Commercial | Automation spectrum list; honest DIY positioning vs agency/agent volume tools | Four FAQ rows in admin only |

**Publish order (operator):** (1) `instagram backlink` — supports existing high-CTR programmatic URL; (2) `automated directory submission` — lifts `/directory-submission-tool` from position ~19; (3) `agentic social media scheduler` — competes in crowded SERP, links to Track A `/agents` surfaces.

**Regression:** Do not change `metaTitle` on `/build-backlinks/instagram`, `/directory-submission-tool`, or winner agent pages when publishing these posts — add blog internal links from future posts only, not programmatic meta rewrites in the same release.

### Track B — 28-day KPIs (re-check with same export filters)

| Metric | Expectation |
| --- | --- |
| **Impressions** on Tier 1 winner pages | ↑ (distribution + rank) |
| **CTR** on those pages | Hold within ~30% **relative** drop vs baseline (flag if snippet or SERP feature changed) |
| **Clicks** on winner pages and mapped queries | ↑ |
| **Regression** | No accidental Track A `metaTitle` edit on winner URLs in the same release as scale-up links |

**Locale / noise:** Queries such as `grok bot 官网` or other non-English one-offs — log in decision log; no dedicated landings unless volume justifies.

---

## Measured query table (Track A)

### `* alternatives` cluster (~17k impressions; 13 queries meet threshold)

| Query (representative) | Impressions (cluster / query) | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| later alternatives | **Measured** (Later ~6k page/query mix) | **Measured** ~1 on Socialync; Later deep in SERP varies | 0 / ~0% | `/alternatives/{slug}` — Workstream 2 | Generic “Best X Alternatives” meta underperforms at good positions |
| socialync alternatives | **Measured** ~1.3k | **Measured** ~1 | 0 | `/alternatives/socialync` | Highest-priority snippet fix |
| recurpost alternatives | **Measured** (in 13-query set) | **Measured** varies | 0 / &lt;1% | `/alternatives/recurpost` | Ranked listicle + named peers in description |
| buffer alternatives | **Measured** (in set) | **Measured** varies | 0 / &lt;1% | `/alternatives/buffer` | Spot-check after ship |
| hootsuite alternatives | **Measured** (in set) | **Measured** varies | 0 / &lt;1% | `/alternatives/hootsuite` | Same builder pattern as other schedulers |
| sprout social alternatives | **Measured** (in set) | **Measured** varies | 0 / &lt;1% | `/alternatives/sprout-social` | Spot-check after ship |
| Other `* alternatives` (8 additional) | **Measured** (13 total ≥200 imp) | **Measured** | 0 / &lt;1% | `/alternatives/{slug}` | Later, Socialync, Recurpost, Buffer, Hootsuite, etc. — no per-slug prose in plan; builders cover all |

**Cluster owner (code):** `PublicAlternativesPage.presenter.svelte.ts`, `buildAlternativesDetailFaqItems.ts`, shared builders in `buildProgrammaticSeoTitles.ts`.

---

### Bluesky commercial (~13.5k impressions on Bluesky-tagged queries)

| Query | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| bluesky free trial | **Measured** 12.5k | **Measured** 85 | 0 | `/channels/bluesky` — Workstream 3 | Channel-only meta; do not spray trial copy across `/agents/*/bluesky` and `/tools/*/bluesky` |
| schedule bluesky posts | **Measured** ~210 | **Measured** ~7–8 | 0 | `/channels/bluesky` | Lead meta with schedule + trial |
| bluesky schedule post | **Measured** ~210 | **Measured** ~7–8 | 0 | `/channels/bluesky` | Same as above |
| best time to post on bluesky | **Measured** 208 | **Measured** 18 | low | `tools/best-time-to-post/bluesky` (secondary) | Tier-3 override only if `seoIntro` exists; channel page is primary |

**Page signal:** `/channels/bluesky` — **Measured** 8,585 impressions, 0 clicks, position ~10.

**Cluster owner (code):** `channels/catalog/platforms/bluesky.ts`, optional adjunct `channels/api/scheduling/platforms/bluesky.ts`.

---

### Compare pairs (snippet at good positions)

| Pattern | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| e.g. typefully vs recurpost | **Measured** ~1k | **Measured** 3–9 | 0–1 | `/compare/{a}/{b}` — Workstream 4 | Description-first; pricing/trial/channels in first ~155 chars |
| e.g. recurpost vs buffer | **Measured** ~1k | **Measured** 3–9 | ~0.08% CTR | `/compare/{a}/{b}` | Same |

**Cluster owner (code):** `buildComparePair.ts` (`buildComparePairMetaDescription` enhancement).

---

### Agent hosts (brand / high-impression)

| Query / page | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| thinkrail | **Measured** 3.2k (query); page **Measured** 3.7k | **Measured** varies | low | `/agents/thinkrail` — Workstream 5 | Brand-first `metaTitle`; description: pi + worktree + schedule |
| grok bot (page) | **Measured** 7.9k page | **Measured** varies | low CTR | `/agents/grok-bot` — Workstream 5 | Align description with scheduling + X/YouTube intent |
| agents hub | **Measured** 2.9k page | **Measured** varies | low | `/agents` hub — Workstream 5 | Only if hub meta is generic: name top hosts + trial |

---

### API marketing hub

| Query | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| social media scheduling api | **Measured** 412 | **Measured** ~13 | 0 / &lt;1% | Scheduling API hub — Workstream 6 | `publicApiSchedulingHubPage`; exact query in title; `POST /public/posts` + trial in first line |

**Cluster owner (code):** `channels/api/scheduling/general.ts` (posting hub mirror optional).

---

### Other significant queries

| Query | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| postpeer | **Measured** 1.1k | **Measured** (export) | 0 / &lt;1% | Triage in follow-up if not in shipped workstreams | Documented in plan as significant; assign URL after Query×Page export |

---

### Alternatives hub (lower priority)

| Page / query bleed | Impressions | Avg position | Clicks / CTR | Canonical fix owner | Notes |
| --- | ---: | ---: | --- | --- | --- |
| `/alternatives` hub; `later alternatives` bleed | **Measured** 1.3k | **Measured** ~25 | 0 | `PUBLIC_ALTERNATIVES_HUB` — Workstream 7 | Front-load Later, Buffer, Socialync, Recurpost in `metaDescription` |

---

## Shipped meta patterns (by workstream)

| Workstream | Surface | Pattern |
| --- | --- | --- |
| 1 | `buildProgrammaticSeoTitles.ts` | `buildAlternativesDetailMetaTitle`, `buildAlternativesDetailMetaDescription` (peers in sentence 1; trial/self-host/MCP in sentence 2), `buildAlternativesSwitchFaqTitle`, compare description helpers, optional `buildSchedulingCommercialChannelMeta` |
| 2 | Alternatives detail | `metaTitle` / `metaDescription` from builders after `peerNames` from listings; directory targets use parallel template; optional `CompareProduct.alternativesSeo` overrides |
| 3 | Bluesky | Channel `metaTitle` (trial + scheduler early); `metaDescription` (trial/connect, then features); FAQ e.g. “Is there a Bluesky scheduler free trial?” |
| 4 | Compare | Enhanced `buildCompareMetaDescription`: `{A} vs {B}: prices, channels, free trial` when OpenQuok in pair; tagline differentiators |
| 5 | Agents | ThinkRail brand-first title; Grok Bot query-aligned description lead |
| 6 | Public API hub | Title matches “social media scheduling api”; description leads with API path + sign-up |
| 7 | Alternatives hub | Named competitors + “ranked compare links” in description |

**Unit tests:** `buildProgrammaticSeoTitles.test.ts`, `PublicAlternativesPage.presenter.test.ts`, compare assertions as added.

**Constraints:** ASD-STE100-friendly copy; pricing per `add-competitors` accuracy (no invented free tiers). No `backend/` or blog SQL in this effort.

---

## Out of scope (document only)

| Item | Reason |
| --- | --- |
| Blog posts with impressions (e.g. `blog/grok-bot-vs-*`) | CMS-owned — title/description passes via **secret-admin → blog-manager** |
| Meta for every `*/bluesky` agent/tool route (positions **Measured** 150–230) | Cannibalization risk; consolidate on `/channels/bluesky` first |
| `noindex` on agent×channel pages | Explicit non-goal |

---

## Post-merge verification checklist (28-day GSC re-check)

Use the same inclusion thresholds when comparing before/after exports.

### 1. Google Search Console — Performance

- [ ] Filter by **page** for `/alternatives/later`, `/alternatives/socialync`, `/alternatives/recurpost`, `/alternatives/buffer`, `/alternatives/sprout-social`.
- [ ] Filter by **page** for `/channels/bluesky` (impressions, CTR, avg position).
- [ ] Filter top **compare** pairs (e.g. `/compare/typefully/recurpost`, `/compare/recurpost/buffer`).
- [ ] Filter **query** `social media scheduling api` and API hub landing URL.
- [ ] Filter **query** `thinkrail` and page `/agents/thinkrail`.
- [ ] Export **Query × Page** for `bluesky free trial` — confirm Google consolidates on `/channels/bluesky` vs agent/tool Bluesky routes.
- [ ] Re-export `Queries.csv`; count how many threshold queries (≥200 imp, 0 clicks or CTR &lt; 1%) remain in each cluster.

### 2. Live SERP spot-check (**Proxy** — note date on each check)

- [ ] `later alternatives` — title/description shape matches listicle + peers + trial hook.
- [ ] `socialync alternatives` — FAQ PAA title shape: “What are the best Socialync alternatives?”
- [ ] `bluesky scheduler free trial` or `bluesky free trial` — `/channels/bluesky` snippet competes without off-canonical duplicates.

### 3. Engineering

- [ ] `pnpm exec vitest run` on touched test files (`buildProgrammaticSeoTitles.test.ts`, `PublicAlternativesPage.presenter.test.ts`, compare tests if extended).
- [ ] Spot-check rendered `<title>` and meta description on staging/production for one URL per workstream.

### 4. Blog / CMS follow-up

- [ ] Paste Track B backlog posts from `docs/blog/gsc-track-b-blog-backlog-blog-manager-copy-paste.md` (three drafts: instagram backlink, agentic scheduler, automated directory submission).
- [ ] Secret-admin pass on high-impression blog URLs noted in GSC (zero-CTR posts) — align title/description with SERP intent; no in-repo SQL.

### 5. Track B scale-up (28-day)

- [ ] GSC **Pages**: `/alternatives/postiz`, `/alternatives/mixpost`, `/tools/photo-editor/tiktok`, `/photo-editor/instagram`, `/build-backlinks/instagram`, `/tools/humanizer/linkedin` — impressions trend, CTR vs baseline.
- [ ] GSC **Queries**: Tier 1 table queries in § Track B — impressions and clicks vs 2026-11-16 baseline.
- [ ] Confirm no winner URL received Track A meta rewrite in the monitoring window (compare HTML title/description archive or deploy log).
- [ ] Spot-check internal links from Track A sources in § Internal linking matrix (rendered FAQ / hub copy).

### 6. Decision log (fill after 28 days)

| Cluster | Baseline CTR / clicks | Day-28 CTR / clicks | Action if flat |
| --- | --- | --- | --- |
| `* alternatives` | **Measured** (export row) | | Consider `alternativesSeo` overrides or hub internal links |
| Bluesky trial query | pos **Measured** 85 | | Query×Page consolidation; resist agent/tool meta spray |
| Compare pairs | pos 3–9, ~0% CTR | | Second pass on description differentiators |
| API hub query | pos ~13 | | Docs cross-link from `/docs/apis-posts` if needed |
| Track B — Postiz / Mixpost cluster | **Measured** (§ Tier 1 pages) | | More hub/compare links; avoid meta churn |
| Track B — Photo editor / humanizer | **Measured** | | Tool hub blurbs only; no metaTitle change |
| Track B — Grok channel tails | **Measured** | | Channel landing links from `/agents/grok-bot` |

---

## Risk notes

- **Cannibalization (Track A):** Improving `/channels/bluesky` meta alone may not move avg position on `bluesky free trial` until Google picks a single URL — track Query×Page before expanding Bluesky meta on long-tail routes.
- **Snippet-only on deep rank:** Pages with avg position &gt; ~20 need rank/consolidation work, not description-only changes.
- **Over-optimization (Track B):** Stuffing winner keywords into loser pages can **cannibalize** Track B URLs — prefer one clear target per cluster.
- **Footer/hub inflation:** Do not add a new footer column per query; reuse existing Tools / Alternatives / Build-backlinks columns.

---

## Related plan workstreams (implementation tracking)

| ID | Scope | Primary paths |
| --- | --- | --- |
| WS1 | Shared SERP builders | `web/src/lib/content/utils/buildProgrammaticSeoTitles.ts` |
| WS2 | Alternatives detail | `PublicAlternativesPage.presenter.svelte.ts`, `buildAlternativesDetailFaqItems.ts` |
| WS3 | Bluesky commercial | `channels/catalog/platforms/bluesky.ts`, API bluesky adjunct |
| WS4 | Compare descriptions | `buildComparePair.ts` |
| WS5 | Agent hosts | `agents/hosts/thinkrail.ts`, `grok-bot.ts`, hub |
| WS6 | API hub | `channels/api/scheduling/general.ts` |
| WS7 | Alternatives hub | `hubs/alternatives.ts` |
| WS8 | This document | `docs/seo/research/2026-11-16-gsc-zero-ctr.md` |
| WS9 | Track B scale-up | Internal links, compare emphasis, tool Tier-3 blurbs; § Track B in this doc |