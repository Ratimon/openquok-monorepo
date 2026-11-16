# GSC zero-CTR remediation — research record

**Observation date:** 2026-11-16  
**Evidence label:** **Measured** (Google Search Console export: `Queries.csv` and page-level performance, unless noted otherwise)  
**Goal:** Document threshold queries, cluster ownership, shipped meta patterns from the remediation plan, and a 28-day re-check checklist.

---

## Inclusion rules

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

## Measured query table

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

- [ ] Secret-admin pass on high-impression blog URLs noted in GSC (zero-CTR posts) — align title/description with SERP intent; no in-repo SQL.

### 5. Decision log (fill after 28 days)

| Cluster | Baseline CTR / clicks | Day-28 CTR / clicks | Action if flat |
| --- | --- | --- | --- |
| `* alternatives` | **Measured** (export row) | | Consider `alternativesSeo` overrides or hub internal links |
| Bluesky trial query | pos **Measured** 85 | | Query×Page consolidation; resist agent/tool meta spray |
| Compare pairs | pos 3–9, ~0% CTR | | Second pass on description differentiators |
| API hub query | pos ~13 | | Docs cross-link from `/docs/apis-posts` if needed |

---

## Risk notes

- **Cannibalization:** Improving `/channels/bluesky` meta alone may not move avg position on `bluesky free trial` until Google picks a single URL — track Query×Page before expanding Bluesky meta on long-tail routes.
- **Snippet-only on deep rank:** Pages with avg position &gt; ~20 need rank/consolidation work, not description-only changes.

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