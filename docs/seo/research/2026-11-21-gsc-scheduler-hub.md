# GSC scheduler hub — Nov 21 export + SERP briefs

**Observation date:** 2026-11-21  
**Parent record:** [`2026-11-16-gsc-zero-ctr.md`](2026-11-16-gsc-zero-ctr.md) (Track A/B thresholds, WS1–WS9)  
**Evidence:** **Measured** = GSC export `openquok.com-Performance-on-Search-2026-11-21`; **Proxy** = WebSearch / live SERP snapshot with date below  
**Scope:** SERP briefs that unblock **WS10** (scheduler hub), **WS2** (Buffer/Later alternatives), **WS9.2** (Postiz-class distribution); verification checklist **WS11**

**Do not** rewrite Track B winner meta (`/alternatives/postiz`, `/compare/mixpost/postiz`) in the same release as these briefs — distribution and snippet alignment only.

---

## Measured baseline (Nov 21 vs Nov 16)

**Measured** from the Nov 21 GSC export unless noted.

| Surface / query | Impressions | Clicks | CTR (approx.) | Avg position | Track | Next workstream |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `/social-media-management` | 431 | 9 | ~2.1% | ~8–11 | A | **WS10** — snippet + hub links |
| `/alternatives/buffer` | 2,361 | 9 | ~0.4% | ~19 | A | **WS2** — query-shaped title/description |
| `/compare/openquok/postiz` | 36 | 0 | 0% | (export) | B | **WS9.2** + **WS4** — impressions, not meta churn on Postiz winners |
| `bluesky free trial` (query) | ~13k | 0 | 0% | ~85 | A | **WS3** — consolidate on `/channels/bluesky` |
| Postiz cluster (`mixpost vs postiz`, `postiz free alternative`, etc.) | varies | high CTR | Tier 1 | ≤15 | B | **WS9.2** — link from hub/alternatives |
| Site avg (heavy days) | — | — | ~0.3–0.7% | ~8–11 | — | Mobile CTR still beats desktop |

**Nov 21 delta (narrative):** Commercial scheduler intent remains concentrated on alternatives/compare; Postiz/Mixpost compare lane still highest-ROI **Measured** winner cluster. `/social-media-management` has visibility but CTR is below what position ~8–11 usually earns — primary lever is title/H1/FAQ alignment (**Noel #1**) plus hub internal links (**Noel #5**).

---

## Implementation map (this plan)

| ID | Scope | Primary paths | Depends on brief |
| --- | --- | --- | --- |
| **WS10** | Social scheduler hub | `social-autopilot-landing.ts`, `social-media-management/+page.svelte`, `+page.server.ts` | § SERP: `agentic social media scheduler` |
| **WS2** | Alternatives snippet | `buildProgrammaticSeoTitles.ts`, `PublicAlternativesPage.presenter.svelte.ts` | § SERP: `buffer alternatives` |
| **WS9.2** | Postiz-class peers | `compareHubPairEmphasis.ts`, `buildAlternativesDetailFaqItems.ts`, `hubs/alternatives.ts` | § SERP: `postiz alternative open source` |
| **WS3** | Bluesky commercial | `channels/catalog/platforms/bluesky.ts` | Parent doc WS3 (no new brief here) |
| **WS4** | Compare descriptions | `buildComparePair.ts` | Handoff under Postiz brief |
| **WS6** | Scheduling API hub | `channels/api/scheduling/` | Cross-link from WS10 `relatedLinksSection` |
| **WS11** | Technical verification | GSC URL Inspection, vitest | § 28-day re-check |

---

## SERP brief: `agentic social media scheduler`

**Bind:** Keyword `agentic social media scheduler` | Locale **en-US** | Device **desktop** (mobile: same product landing pattern) | SERP date **Proxy 2026-11-21** | Target surface **landing** `/social-media-management` (+ blog backlog `agentic-social-media-scheduler-mcp-openquok`)

### SERP snapshot

| Feature | Present | Placement / notes | Opportunity |
| --- | --- | --- | --- |
| AI Overview | **Proxy** Likely | Top or mid | Definition + “human approval” + MCP; cite comparison table pattern |
| Ads | **Proxy** Unknown | — | Commercial pressure from hosted schedulers |
| Featured snippet | **Proxy** No / weak | — | Definition paragraph or short list if blog ships |
| People Also Ask | **Proxy** Yes | Mid-page | Approval, MCP, networks — mirror in FAQ **titles** |
| Video pack | **Proxy** Low | — | Optional later |
| Organic top types | **Proxy** | — | **Product landings** (OneUp, PostQueen, Aidelly, Clautia) + **how-to blog** (Postferry) |

### Top organic results (**Proxy** 2026-11-21)

| Pos | URL (domain) | Type | Why it ranks |
| --- | --- | --- | --- |
| 1 | oneupapp.io/agentic-social-media-scheduler | Product landing | Exact-match H1; MCP + approval + network list |
| 2 | postqueen.ai | Product home | “Agentic social media scheduler” in hero copy; 30+ networks |
| 3 | aidelly.ai/mcp | MCP product page | Approval-first positioning; tool catalog depth |
| 4 | clautia.com/features/social-media-scheduler | Feature page | “Agentic social media manager”; drafts default; Nov 2026 freshness |
| 5 | postferry.com/blog/agentic-social-media-scheduling | Guide | Definition + human-gated workflow; links to MCP/API |

**OpenQuok visibility:** **Proxy** — `openquok.com/social-media-management` appears in brand/site-restricted search; not confirmed in top 5 for the bare query without live rank tracker.

**Ranking pattern summary:** **Proxy** — H/M intent = **commercial** (product pages dominate). On-page = exact phrase in title/H1, MCP/API bullets, approval workflow. Freshness = modest (2026-dated blogs). Authority = **True difficulty: NOT_SCORED** (top-10 DR unknown).

### Intent

| Field | Value |
| --- | --- |
| **Primary intent** | **Commercial** (+ informational definition in AI/PAA) |
| **Evidence** | Product landings in top 5; blogs explain “agentic” for AI Overview |

### Feature strategy

- **Snippet / AI:** 40–60 word definition: agent drafts/schedules via MCP or API; human approves before publish; name Grok/Claude/Cursor as connect paths.
- **PAA → FAQ titles (WS10):** “Do agents post without my approval?”; “What is an agentic social media scheduler?”; “Can I schedule from Grok Bot or MCP?”; “How is OpenQuok different from Postiz?” → link `/alternatives/postiz`, `/compare/openquok/postiz`.
- **Format to win:** Comparison table (MCP, approval queue, self-host, directory/backlinks) — OpenQuok differentiators vs OneUp/PostQueen/Aidelly.

### OpenQuok handoff (WS10)

| Field | Recommendation |
| --- | --- |
| **metaTitle** | Lead **Agentic Social Media Scheduler** (drop trailing “Platform” unless listicle SERP wins on it — **Proxy** shows “scheduler” not “platform”) |
| **metaDescription** | Keep “agentic social media scheduler”; add one clause: **human approval** + **self-host / MCP** vs hosted-only peers |
| **H1 / hero** | First visible line should echo query; keep rotation on subtitle if hero component requires it |
| **H2s** | Kanban approval; MCP/CLI/skills; multi-workspace; vs autopilot-without-approval |
| **Hub links (WS10.2)** | `/compare/openquok/postiz`, `/alternatives/postiz`, `/social-media-scheduling-api`, `/agents`, `/self-hosting` |
| **Blog (WS9.4)** | `agentic-social-media-scheduler-mcp-openquok` — definition + table; links hub + MCP docs; FAQ in admin only |

**GSC tie-in:** **Measured** `/social-media-management` 431 imp, ~2.1% CTR — snippet upgrade should push CTR toward 5%+ at position ~8–11 without changing Track B Postiz URLs.

---

## SERP brief: `buffer alternatives`

**Bind:** Keyword `buffer alternatives` | Locale **en-US** | Device **desktop** | SERP date **Proxy 2026-11-21** | Target surface **`/alternatives/buffer`**

### SERP snapshot

| Feature | Present | Placement / notes | Opportunity |
| --- | --- | --- | --- |
| AI Overview | **Proxy** Likely | Top | List + pricing; table beats paragraph |
| Ads | **Proxy** Likely | Top | Buffer + competitors |
| Featured snippet | **Proxy** Sometimes | Table or list | “Best Buffer alternatives” numbered list |
| People Also Ask | **Proxy** Yes | Mid | Free plan, per-channel pricing, self-host |
| Organic top types | **Proxy** | — | **Listicles** (SocialPilot, Pozy, Bulkly, Automate Basics, alternative.tools) |

### Top organic results (**Proxy** 2026-11-21)

| Pos | URL (domain) | Type | Why it ranks |
| --- | --- | --- | --- |
| 1–2 | pozy.ai/blog/buffer-alternatives, socialpilot.co/buffer-alternatives | Listicle | Year in title; comparison tables; real pricing |
| 3 | bulk.ly/buffer-alternatives | Listicle | Volume/bulk angle vs Buffer limits |
| 4 | automatebasics.com/guides/buffer-alternatives | Listicle | Per-channel fee math; names Postiz flat pricing |
| 5 | alternative.tools/blog/best-social-media-schedulers-2026 | Roundup | Methodology + Postiz OSS row |

**OpenQuok visibility:** **Measured** `/alternatives/buffer` ~2,361 imp, ~0.4% CTR, pos ~19 — indexed and shown; snippet loses to listicle titles at similar positions.

**Ranking pattern summary:** **Proxy** — Format = long listicle + **comparison table** + **2026** freshness. Intent = **commercial investigation**. Difficulty = **NOT_SCORED**; incumbents are mid-market blogs and vendor SEO pages.

### Intent

| Field | Value |
| --- | --- |
| **Primary intent** | **Commercial** (compare tools, pricing, free tier) |
| **Secondary** | Informational (what Buffer charges per channel) |

### Feature strategy

- **Title shape:** Query echo + year + hook — e.g. `Buffer Alternatives (2026): Free & Self-Hosted` (≤60 chars before `| OpenQuok` via `createMetaData`).
- **Description sentence 1:** Echo `buffer alternatives` + trial/self-host/MCP hook.
- **Description sentence 2:** Named peers via `formatAlternativesPeerNameList` — **Postiz**, **Mixpost**, **TryPost** (WS9.2); avoid generic “Best Buffer Alternatives” alone.
- **On-page:** FAQ title PAA shape: “What are the best Buffer alternatives with a free trial?”; link Track B `/alternatives/postiz`, `/compare/openquok/postiz`.

### OpenQuok handoff (WS2)

| Field | Recommendation |
| --- | --- |
| **Builder** | `buildAlternativesDetailMetaTitle` / `buildAlternativesDetailMetaDescription` for slug `buffer` |
| **Verify** | `PublicAlternativesPage.presenter.svelte.ts` does not override builders |
| **SERP check after ship** | Live title matches table row in parent checklist |

**GSC goal (28d):** **Measured** baseline 9 clk / 2,361 impr → CTR **>1%**, position **≤15** (plan success table).

---

## SERP brief: `postiz alternative open source`

**Bind:** Keyword cluster `postiz alternative open source`, `postiz open source alternative`, `postiz free alternative` | Locale **en-US** | Device **desktop** | SERP date **Proxy 2026-11-21** | Target surfaces **`/alternatives/postiz`**, `/compare/openquok/postiz`, `/alternatives/trypost`, `/alternatives/adaptlypost`

### SERP snapshot

| Feature | Present | Placement / notes | Opportunity |
| --- | --- | --- | --- |
| AI Overview | **Proxy** Likely | Top | Names OSS schedulers; license + self-host |
| Featured snippet | **Proxy** Table/list | — | License + network count table |
| People Also Ask | **Proxy** Yes | — | Self-host difficulty, AGPL, MCP |
| Organic top types | **Proxy** | — | **Third-party listicles** + **GitHub** + **compare blogs** |

### Top organic results (**Proxy** 2026-11-21)

| Pos | URL (domain) | Type | Why it ranks |
| --- | --- | --- | --- |
| 1 | github.com/trypostit/trypost | OSS product | AGPL; full feature parity self-host; MCP |
| 2 | ryandoser.com/postiz-alternatives | Listicle | Mixpost / TryPost / Buffer matrix; license column |
| 3 | lilachbullock.com/open-source-social-media-schedulers | Roundup | **OpenQuok listed** in AGPL table |
| 4 | pendpost.com/blog/self-hosted-social-media-schedulers | Comparison | Stack depth (Temporal, approvals, MCP) |
| 5 | alternative.tools (scheduler roundup) | Listicle | Postiz row: “Open source, self hosting and AI agents” |

**OpenQuok visibility:** **Measured** (parent) `/alternatives/postiz` Tier 1 winner — **3.36% CTR**, do **not** Track A meta rewrite; **Proxy** listicles already cite OpenQuok on OSS roundups.

**Ranking pattern summary:** **Proxy** — Intent = **commercial** + **technical** (self-host). Winning copy = license (AGPL/MIT), stack weight, approval + MCP, network count. Postiz is the entity hub; alternatives pages compete on “open source” modifiers.

### Intent

| Field | Value |
| --- | --- |
| **Primary intent** | **Commercial** (pick self-hosted or cheaper OSS scheduler) |
| **Secondary** | Informational (AGPL obligations, Docker stack) |

### Feature strategy

- **Track B on `/alternatives/postiz`:** Hold meta; grow via **internal links** from WS10 hub, Buffer/Later alts, hub intro (**WS9.2**).
- **`/compare/openquok/postiz`:** **WS4** description only — pricing anchor, trial, **approval queue + agent hosts + directory** in first ~155 chars (**Measured** 0 clk / 36 imp — impression growth lever).
- **FAQ peers:** Extend `buildAlternativesDetailFaqItems` so Postiz alt FAQ links **TryPost**, **AdaptlyPost**, **Mixpost** head-to-head compares.
- **Positioning (copy only):** Postiz = 30+ networks + OSS; OpenQuok = approval kanban + Grok/CLI/MCP + directory launch; TryPost = AGPL parity; AdaptlyPost = hosted MCP — OpenQuok = broader agent surface.

### OpenQuok handoff (WS9.2 + WS4)

| Field | Recommendation |
| --- | --- |
| **Emphasis slugs** | `compareHubPairEmphasis.ts` — add `trypost`, `adaptlypost` after `postiz`, `mixpost` |
| **Hub intro** | `hubs/alternatives.ts` — name Postiz, TryPost, AdaptlyPost in social section |
| **Compare description** | `buildComparePairMetaDescription` for `openquok/postiz` only (not `mixpost/postiz` winner) |
| **Optional blog** | Postiz alternative listicle (**Proxy** SERP) → points to `/alternatives/postiz` |

**GSC goal (28d):** Hold Tier 1 CTR on `/alternatives/postiz`; raise impressions/clicks on `/compare/openquok/postiz` and long-tail `postiz * alternative` queries via links, not winner meta churn.

---

## WS11 — Verification checklist (after WS10–WS2 ship)

### GSC (28-day, same filters as parent)

- [ ] **Page** `/social-media-management` — CTR vs ~2.1%, impressions vs 431, avg position ~8–11.
- [ ] **Page** `/alternatives/buffer` — CTR vs ~0.4%, position vs ~19.
- [ ] **Page** `/compare/openquok/postiz` — clicks from 0; impressions vs 36.
- [ ] **Query** `agentic social media scheduler` — Query×Page primary URL = `/social-media-management`.
- [ ] **Query** `buffer alternatives` — Query×Page = `/alternatives/buffer`.
- [ ] **Query** `postiz open source alternative` / `postiz free alternative` — Query×Page still `/alternatives/postiz` (no cannibalization from hub).

### Live SERP spot-check (**Proxy**, note date)

- [ ] `agentic social media scheduler` — OpenQuok title contains **Scheduler**; description mentions approval + MCP.
- [ ] `buffer alternatives` — OpenQuok title contains **Buffer Alternatives** + **2026** or pricing hook.
- [ ] `postiz alternative open source` — OpenQuok `/alternatives/postiz` unchanged title (Track B); compare page description names both products.

### Engineering

- [x] Single H1 on `/social-media-management`, `/alternatives/buffer`, `/compare/openquok/postiz` — `gscSchedulerWs11Verify.test.ts` (presenter/config contracts).
- [x] FAQPage JSON-LD matches visible FAQ on scheduler hub after copy edits — same file (`createPublicFaqSEOSchema` count + question parity).
- [x] `vitest`: `buildAlternativesDetailFaqItems.test.ts`, `compareHubPairEmphasis.test.ts`, `hub-faq-links.test.ts`, `social-autopilot-landing.test.ts`, `gscSchedulerWs11Verify.test.ts` — **94 tests** in WS11 bundle (`pnpm exec vitest run` paths listed in test file header).
- [ ] GSC URL Inspection (live crawl) — **Proxy 2026-11-21**: production HTML still serves pre–WS10 scheduler title/hero until deploy; after deploy, re-check canonical + `FAQPage` @id `…/social-media-management#faq` in Search Console.

---

## 28-day decision log (fill after re-export)

| Cluster | Baseline (Nov 21 **Measured**) | Day-28 | Action if flat |
| --- | --- | --- | --- |
| Scheduler hub | `/social-media-management` 9 clk, 431 imp, ~2.1% CTR | | Tighten H1/FAQ; add hub links; consider blog publish |
| Buffer alts | `/alternatives/buffer` 9 clk, 2,361 imp, ~0.4% CTR, pos ~19 | | Second SERP pass; `alternativesSeo` override only if builders insufficient |
| OpenQuok vs Postiz | `/compare/openquok/postiz` 0 clk, 36 imp | | WS4 description pass; more inlinks from SMM hub |
| Postiz winner (Track B) | `/alternatives/postiz` CTR ~3.36% (parent) | | If CTR drops >30% rel., roll back adjacent meta on same deploy |
| Postiz OSS queries | Tier 1 in parent (`postiz open source alternative` etc.) | | Link-only scale; no meta rewrite on `/alternatives/postiz` |

---

## Related documents

- Parent thresholds and WS1–WS9: [`2026-11-16-gsc-zero-ctr.md`](2026-11-16-gsc-zero-ctr.md)
- Track B blog copy-paste: [`docs/blog/gsc-track-b-blog-backlog-blog-manager-copy-paste.md`](../../blog/gsc-track-b-blog-backlog-blog-manager-copy-paste.md)
- SERP methodology: [`.cursor/skills/serp-analysis/SKILL.md`](../../../.cursor/skills/serp-analysis/SKILL.md)