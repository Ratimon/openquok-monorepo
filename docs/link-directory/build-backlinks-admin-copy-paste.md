# Build Backlinks — secret-admin copy & paste handbook

Use **secret-admin → link directory manager** to edit sites and opportunities. Public URLs: `/build-backlinks/{site-slug}`.

**Writing pattern** (match [Bluesky](https://www.openquok.com/build-backlinks/bluesky) and [Facebook](https://www.openquok.com/build-backlinks/facebook)):

- **Site:** **Site URL**, metrics, **Short description** (plain text), **Long description** (HTML), category, tags, OpenQuok fields — then opportunities below.
- **Each opportunity:** one intro paragraph (HTML); **two steps** (plain title + HTML body each); title line with **effort · approval · dofollow · cost · sort** ([settings table](#opportunity-settings-reference)); **CTA (modal)** line — [CTA table](#opportunity-cta-reference); mention **nofollow** where accurate; call out **OpenQuok** only on `connect_channel` / `schedule_post` CTAs.
- **OpenQuok social channels** (Instagram, Facebook, YouTube, TikTok, Dev.to): mirror **`profile-personal` (10) · `profile-brand` (15) · post/thread/video (20)**. Dev.to uses **`profile-personal` (10)** only. **LinkedIn** adds **`publish-article` (25)** (desktop article; not OpenQuok-scheduled). **X**, **Bluesky**, and **Threads** add **`helpful-reply` (30)** · Comment link · **`use_plug`** (`x-auto-plug`, `bluesky-auto-plug`, `threads-autoPlugPost`). **LinkedIn** uses **`comment-with-link` (30)** with **`linkedin-page-auto-plug`**.
- **Sort order:** social playbooks use `10` / `15` / `20` (personal · brand · post); other sites may use `10`, `20`, `30` (…); site `sort_order` `0` (hub sorts by DR by default).
- **Published:** turn on **Admin published** for site and each opportunity.

---

## Admin field reference

### Site (EditorLinkDirectorySite)

| Field | Notes |
| --- | --- |
| **Title** | Display name (e.g. `Bluesky`) |
| **Slug** | URL segment; read-only after first save (e.g. `bluesky`) |
| **Site URL** | Canonical homepage (`https://…`) |
| **Logo** | Square image → `link_directory_logos` bucket (56×56 on hub) |
| **Short description** | Plain text only (hub card) |
| **Long description** | HTML — Visual or HTML source in admin (same pipeline as blog FAQ). External `<a href>` render with `nofollow` on the public guide except `*.openquok.com`. |
| **Domain rating (DR)** | 0–100 |
| **Domain authority (DA)** | Optional 0–100 |
| **Monthly visits** | Integer estimate — editor accepts `1.21 billion`, `520M`, or `1,210,000,000`; blur normalizes to words + exact count hint |
| **Metrics source** | e.g. `semrush_traffic_2026-08` |
| **Category** | Usually **Social platforms** or **Launch platforms** / **Maker and dev directories** |
| **Tags** | e.g. **High domain rating**, **Community moderated**, **GitHub** |
| **OpenQuok auth supported** | On when users can connect this network in a workspace |
| **OpenQuok channel slug** | Must match `/channels/{slug}` — see table below |
| **Admin published** | On for live catalog |
| **Sort order** | Default `0` |

**OpenQuok channel slugs** (from [`listAvailablePublicChannels`](web/src/lib/content/constants/channels/index.ts)):  
`facebook`, `threads`, `instagram`, `youtube`, `tiktok`, `linkedin`, `x`, `bluesky`, `devto`

### Opportunity (modal)

| Field | Values / notes |
| --- | --- |
| **Slug** | Stable id segment (e.g. `page-post`) |
| **Title** | H2 on public guide |
| **Opportunity type** | **Profile link**, **Post link**, **Thread link**, **Q&A link**, **Comment link**, **Product submission**, **Guest post**, **GitHub contribution** |
| **Effort** | `easy` / `medium` / `hard` |
| **Approval** | `instant` or `manual_review` (+ optional hint) |
| **Dofollow** | `nofollow` / `dofollow` / `unknown` |
| **Cost** | `free` / `freemium` / `paid` (+ optional **Cost note** when paid or pricing varies) |
| **Description** | Intro paragraph — **HTML** (not markdown) |
| **Steps** | **Title** plain text; **Body** **HTML** |
| **Playbook sort order** | `10`, `20`, `30`, `40`, … (label in UI: playbook order on site guide) |

**Opportunity title line (handbook shorthand)** — mirror the modal dropdowns on one line:

`{Opportunity type} · {effort} · {approval} · {dofollow} · {cost} · sort \`N\``

Example: `Post link · medium · instant · dofollow · free · sort \`30\`` (GitHub Pages). When **Approval** is `manual_review`, add **Approval hint** below. When **Cost** is `paid`, add **Cost note** if the catalog should mention pricing.

| **OpenQuok CTA kind** | `none` \| `connect_channel` \| `schedule_post` \| `external_doc` \| `use_plug` (rare) |
| **OpenQuok channel** | Required when kind is `connect_channel` or `schedule_post` |
| **OpenQuok plug name** | Required when kind is `use_plug` — catalog identifier (e.g. `threads-autoPlugPost`) |
| **External link URL** | Shown when kind is `none` (optional) or `external_doc` (required — labeled **Setup guide URL** in UI) |
| **Button label** | Optional in UI; set a short label for the guide-row button (defaults exist if blank) |
| **Sort order** | `10`, `20`, `30`, `40`, … |
| **Admin published** | On |

**CTA modal rules**

| Kind | Fill **OpenQuok channel**? | Fill **External link URL**? |
| --- | --- | --- |
| `none` | Leave empty | Optional — helper link (docs, submit page, repo) |
| `connect_channel` | Yes (`bluesky`, `facebook`, …) | Leave empty |
| `schedule_post` | Yes | Leave empty |
| `external_doc` | Leave empty | Required — official setup or pricing URL |
| `use_plug` | Leave empty | Leave empty — set **OpenQuok plug name** to the catalog identifier (e.g. `threads-autoPlugPost`) |

Copy **Kind · channel · URL · label** from the [Opportunity CTA reference](#opportunity-cta-reference) table or from each opportunity block below.

### HTML fields (copy-paste)

| Admin field | Paste format |
| --- | --- |
| **Short description** | Plain text only |
| **Long description** | HTML (`<p>`, `<strong>`, `<a href="…">`, `<code>`) — use Visual or HTML source in admin |
| **Opportunity → Description** | HTML |
| **Step → Instructions** | HTML (step **Title** stays plain text) |

Do not paste markdown link syntax (`[label](url)`) into rich fields — use `<a href="url">label</a>`. Prefer **official** platform docs, submit/settings URLs, and product homepages (mirror the [Opportunity CTA reference](#opportunity-cta-reference)); use `https://www.openquok.com/channels/{slug}` when mentioning OpenQuok scheduling. On the public guide, outbound links are normalized to **nofollow** (except absolute `*.openquok.com` URLs), matching the web outbound-link policy.

**Logos:** Upload square assets in the site editor (`link_directory_logos` bucket, 56×56 on hub).

| Where | Path |
| --- | --- |
| **Ready-to-upload SVGs (match site slug)** | [`web/static/icons/link-directory/`](../../web/static/icons/link-directory/) — see [`README.md`](../../web/static/icons/link-directory/README.md) |
| Docs / social source copies | `web/static/docs/_assets/platforms/socials/` |
| In-app UI components | [`web/src/data/icons/branded-icons.ts`](../../web/src/data/icons/branded-icons.ts) |

Local dev: open `http://localhost:5173/icons/link-directory/facebook.svg` (etc.), save or upload in admin. Replace placeholder tiles (`uneed`, `open-launch`, `awesome-selfhosted`) with official brand art when available.

---

## Metrics reference (DR · DA · traffic)

Use these in **Domain rating**, **Domain authority**, and **Monthly visits** when creating or refreshing a site.

| Metric | Source | Notes |
| --- | --- | --- |
| **DR** | [Ahrefs Domain Rating](https://ahrefs.com/website-authority-checker) | Re-check in Ahrefs before you rebaseline. **Uneed** (`uneed.best`) is **75** in Ahrefs and on [Uneed pricing](https://uneed.best/pricing)—do not use outdated low placeholders. |
| **DA** | [Moz Domain Authority](https://moz.com/learn/seo/domain-authority) | Optional; Moz DA and Ahrefs DR are different scales. |
| **Monthly visits** | [Semrush Traffic Analytics](https://www.semrush.com/trending-websites/global/all) | **August 2026** global totals where Semrush publishes them; round to 2–3 significant digits. |

Re-check quarterly — Reddit, YouTube, and Facebook move fast. **Exemplar seed** and production admin should match the table below (seed was previously out of date on several rows).

| Site slug | DR | DA | Monthly visits (Semrush Aug 2026) |
| --- | ---: | ---: | ---: |
| `youtube` | 100 | 100 | 54,930,000,000 |
| `facebook` | 96 | 96 | 10,660,000,000 |
| `instagram` | 98 | 94 | 6,550,000,000 |
| `x` | 99 | 97 | 4,060,000,000 |
| `reddit` | 91 | 92 | 5,250,000,000 |
| `tiktok` | 99 | 96 | 2,600,000,000 |
| `linkedin` | 98 | 99 | 1,680,000,000 |
| `github` | 97 | 96 | 1,210,000,000 |
| `threads` | 97 | 92 | 318,000,000 |
| `bluesky` | 97 | 78 | 132,000,000 |
| `devto` | 91 | 85 | 9,200,000 |
| `uneed` | 75 | 38 | 188,000 |
| `awesome-selfhosted` | 72 | 70 | 24,000 |
| `open-launch` | 35 | 32 | 10,000 |

**Domain notes:** Bluesky traffic is **bsky.app** (not bluesky.com). Meta Threads traffic in Semrush is reported on **threads.com** (~318M/mo); catalog site URL may still use `threads.net`. **Uneed DR 75** — verify in Ahrefs for `uneed.best`; Moz **DA** may stay lower than DR (re-check Moz). **awesome-selfhosted.net** traffic is small in Semrush (~24k/mo)—use the overview, not legacy seed guesses. **Open Launch** canonical site is **[open-launch.com](https://open-launch.com)** (not `openlaunch.io`); the homepage reports **56,189 visitors since May 2025**—use that plus Semrush for monthly estimates (~10k/mo placeholder until you re-baseline).

**Metrics source field:** `semrush_traffic_2026-08` (plus `moz_da_2026` or `ahrefs_dr_` date in internal notes if you split sources).

---

## Opportunity settings reference

Modal dropdowns **Effort**, **Approval**, **Dofollow**, and **Cost** (plus optional hints). Defaults for new `/channels` social opps match Facebook/Bluesky exemplar: profile = easy · instant · nofollow · free; post = medium · instant · nofollow · free.

| Site | Opp slug | Sort | Effort | Approval | Approval hint | Dofollow | Cost | Cost note |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| **bluesky** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **bluesky** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **bluesky** | `scheduled-thread` | 20 | medium | instant | — | nofollow | free | — |
| **bluesky** | `helpful-reply` | 30 | hard | manual_review | Post author and community norms vary | nofollow | free | — |
| **facebook** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **facebook** | `page-about-link` | 15 | easy | instant | — | nofollow | free | — |
| **facebook** | `page-post` | 20 | medium | instant | — | nofollow | free | — |
| **reddit** | `subreddit-post` | 10 | medium | manual_review | Varies by subreddit moderators | nofollow | free | — |
| **reddit** | `profile-bio` | 20 | easy | instant | — | nofollow | free | — |
| **reddit** | `helpful-answer` | 30 | hard | manual_review | Community voting and mod removal | nofollow | free | — |
| **github** | `profile-readme` | 10 | easy | instant | — | nofollow | free | — |
| **github** | `profile-website-social` | 20 | easy | instant | — | nofollow | free | — |
| **github** | `github-pages-site` | 30 | medium | instant | — | dofollow | free | — |
| **github** | `ghcr-container-package` | 40 | medium | instant | — | nofollow | free | — |
| **uneed** | `free-launch` | 10 | hard | manual_review | Launch date assigned (up to ~5 months) | unknown | free | Dofollow at upvote score 20; stay live at score 10 — see Pricing |
| **uneed** | `paid-launch` | 15 | medium | manual_review | Fast-track ~14 days or chosen date (paid tiers) | dofollow | paid | Skip the line $29.99 · Fast-track $14.99 · Relaunch $15 — re-check Pricing |
| **uneed** | `free-profile` | 20 | easy | instant | — | nofollow | free | — |
| **open-launch** | `free-launch` | 10 | hard | manual_review | Free queue fully booked into 2027 | unknown | free | Dofollow only if top 3 daily or badge on your site — see Pricing |
| **open-launch** | `premium-launch` | 20 | medium | manual_review | Premium slots daily; launches 8:00 AM UTC | dofollow | paid | $12/launch per Pricing (re-check) |
| **awesome-selfhosted** | `list-pr` | 10 | hard | manual_review | Maintainer review | nofollow | free | — |
| **threads** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **threads** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **threads** | `thread-post-link` | 20 | medium | instant | — | nofollow | free | — |
| **threads** | `helpful-reply` | 30 | hard | manual_review | Thread author and community norms vary | nofollow | free | — |
| **instagram** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **instagram** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **instagram** | `feed-reel-caption-link` | 20 | medium | instant | — | nofollow | free | — |
| **youtube** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **youtube** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **youtube** | `video-description-link` | 20 | medium | instant | — | nofollow | free | — |
| **tiktok** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **tiktok** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **tiktok** | `video-caption-link` | 20 | medium | instant | — | nofollow | free | — |
| **linkedin** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **linkedin** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **linkedin** | `page-link-post` | 20 | medium | instant | — | nofollow | free | — |
| **linkedin** | `publish-article` | 25 | medium | instant | — | nofollow | free | — |
| **linkedin** | `comment-with-link` | 30 | hard | manual_review | Post author and feed norms vary | nofollow | free | — |
| **x** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **x** | `profile-brand` | 15 | easy | instant | — | nofollow | free | — |
| **x** | `post-with-link` | 20 | medium | instant | — | nofollow | free | — |
| **x** | `helpful-reply` | 30 | hard | manual_review | Post author and community norms vary | nofollow | free | — |
| **devto** | `profile-personal` | 10 | easy | instant | — | nofollow | free | — |
| **devto** | `article-project-link` | 20 | medium | instant | — | nofollow | free | — |

---

## Opportunity CTA reference

Paste into the opportunity modal **OpenQuok CTA** fieldset. Use em dash **—** where a column is intentionally empty.

| Site | Opp slug | Sort | CTA kind | OpenQuok channel | External link URL | Button label |
| --- | --- | ---: | --- | --- | --- | --- |
| **bluesky** | `profile-personal` | 10 | `connect_channel` | `bluesky` | — | `Connect Bluesky` |
| **bluesky** | `profile-brand` | 15 | `connect_channel` | `bluesky` | — | `Connect Bluesky` |
| **bluesky** | `scheduled-thread` | 20 | `schedule_post` | `bluesky` | — | `Schedule with OpenQuok` |
| **bluesky** | `helpful-reply` | 30 | `use_plug` | — | — | `Plugs and automation` (plug name **`bluesky-auto-plug`**) |
| **facebook** | `profile-personal` | 10 | `connect_channel` | `facebook` | — | `Connect Facebook` |
| **facebook** | `page-about-link` | 15 | `connect_channel` | `facebook` | — | `Connect Facebook` |
| **facebook** | `page-post` | 20 | `schedule_post` | `facebook` | — | `Schedule post` |
| **reddit** | `subreddit-post` | 10 | `none` | — | `https://www.reddit.com/submit` | `Open Reddit submit` |
| **reddit** | `profile-bio` | 20 | `none` | — | `https://www.reddit.com/settings/profile` | `Edit profile` |
| **reddit** | `helpful-answer` | 30 | `external_doc` | — | `https://www.redditinc.com/policies/content-policy` | `Reddit content policy` |
| **github** | `profile-readme` | 10 | `none` | — | `https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme` | `Profile README docs` |
| **github** | `profile-website-social` | 20 | `external_doc` | — | `https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/adding-social-links-to-your-profile` | `Add social links to your profile` |
| **github** | `github-pages-site` | 30 | `none` | — | `https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site` | `GitHub Pages guide` |
| **github** | `ghcr-container-package` | 40 | `none` | — | `https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry` | `Container registry docs` |
| **uneed** | `free-launch` | 10 | `external_doc` | — | `https://uneed.best/pricing` | `Uneed pricing` |
| **uneed** | `paid-launch` | 15 | `external_doc` | — | `https://uneed.best/pricing` | `Uneed pricing` |
| **uneed** | `free-profile` | 20 | `none` | — | `https://uneed.best` | `Create profile` |
| **open-launch** | `free-launch` | 10 | `external_doc` | — | `https://open-launch.com/pricing` | `Open Launch pricing` |
| **open-launch** | `premium-launch` | 20 | `external_doc` | — | `https://open-launch.com/pricing` | `Open Launch pricing` |
| **awesome-selfhosted** | `list-pr` | 10 | `none` | — | `https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md` | `Contributing guide` |
| **threads** | `profile-personal` | 10 | `connect_channel` | `threads` | — | `Connect Threads` |
| **threads** | `profile-brand` | 15 | `connect_channel` | `threads` | — | `Connect Threads` |
| **threads** | `thread-post-link` | 20 | `schedule_post` | `threads` | — | `Schedule post` |
| **threads** | `helpful-reply` | 30 | `use_plug` | — | — | `Plugs and automation` (plug name **`threads-autoPlugPost`**) |
| **instagram** | `profile-personal` | 10 | `connect_channel` | `instagram` | — | `Connect Instagram` |
| **instagram** | `profile-brand` | 15 | `connect_channel` | `instagram` | — | `Connect Instagram` |
| **instagram** | `feed-reel-caption-link` | 20 | `schedule_post` | `instagram` | — | `Schedule post` |
| **youtube** | `profile-personal` | 10 | `connect_channel` | `youtube` | — | `Connect YouTube` |
| **youtube** | `profile-brand` | 15 | `connect_channel` | `youtube` | — | `Connect YouTube` |
| **youtube** | `video-description-link` | 20 | `schedule_post` | `youtube` | — | `Schedule post` |
| **tiktok** | `profile-personal` | 10 | `connect_channel` | `tiktok` | — | `Connect TikTok` |
| **tiktok** | `profile-brand` | 15 | `connect_channel` | `tiktok` | — | `Connect TikTok` |
| **tiktok** | `video-caption-link` | 20 | `schedule_post` | `tiktok` | — | `Schedule post` |
| **linkedin** | `profile-personal` | 10 | `connect_channel` | `linkedin` | — | `Connect LinkedIn` |
| **linkedin** | `profile-brand` | 15 | `connect_channel` | `linkedin` | — | `Connect LinkedIn` |
| **linkedin** | `page-link-post` | 20 | `schedule_post` | `linkedin` | — | `Schedule post` |
| **linkedin** | `publish-article` | 25 | `external_doc` | — | `https://www.linkedin.com/help/linkedin/answer/a522427` | `Publish articles on LinkedIn` |
| **linkedin** | `comment-with-link` | 30 | `use_plug` | — | — | `Plugs and automation` (plug name **`linkedin-page-auto-plug`**) |
| **x** | `profile-personal` | 10 | `connect_channel` | `x` | — | `Connect X` |
| **x** | `profile-brand` | 15 | `connect_channel` | `x` | — | `Connect X` |
| **x** | `post-with-link` | 20 | `schedule_post` | `x` | — | `Schedule post` |
| **x** | `helpful-reply` | 30 | `use_plug` | — | — | `Plugs and automation` (plug name **`x-auto-plug`**) |
| **devto** | `profile-personal` | 10 | `connect_channel` | `devto` | — | `Connect Dev.to` |
| **devto** | `article-project-link` | 20 | `schedule_post` | `devto` | — | `Schedule post` |

**Note:** Reddit opp 3 uses a policy doc CTA in the table above (better than linking generic OpenQuok docs). Seed exemplar may still say `Read plug docs` until you re-save in admin.

---

## Existing sites — refresh copy

### Bluesky (`bluesky`) — already live; use as reference

- **Site URL:** `https://bsky.app`
- **OpenQuok auth:** Yes · **Channel:** `bluesky`
- **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 97 · 78 · 132,000,000/mo
- **Short:** Decentralized social network with posts, profiles, and threads.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://bsky.app/">Bluesky</a> supports website links on profiles, posts, and replies. Multi-post threads can carry a primary link—see the <a href="https://docs.bsky.app/docs/advanced-guides/posts">posts guide</a>, schedule in <a href="https://www.openquok.com/channels/bluesky">OpenQuok</a>, or use plugs to automate a follow-up reply on posts you publish.</p>
```

**Opportunity 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `bluesky` · URL — · label `Connect Bluesky`

**Description (HTML — paste into Description):**

```html
<p>Use your main personal <a href="https://bsky.app/">Bluesky</a> account—the one you post from as yourself—and add your site in your profile bio or Website field. Good for founders who want one handle for you and your project. Links are typically nofollow; value is clicks and discovery.</p>
```

**Step 1 title:** Open your personal profile

**Step 1 instructions (HTML):**

```html
<p>Sign in at <a href="https://bsky.app/">bsky.app</a> with the account you use day to day, open your profile, and tap <strong>Edit profile</strong>.</p>
```

**Step 2 title:** Add your link

**Step 2 instructions (HTML):**

```html
<p>Add your URL in the <strong>Website</strong> field and/or once in <strong>Description</strong> with a short line about what you do, then save and confirm on your public profile.</p>
```


**Opportunity 2 — Brand account for business** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `bluesky` · URL — · label `Connect Bluesky`

**Description (HTML — paste into Description):**

```html
<p>Create a separate <a href="https://bsky.app/">Bluesky</a> account for your brand or company—not your personal login—so customers see a dedicated handle. Set your business website on that account before you post product updates. Outbound links are typically nofollow.</p>
```

**Step 1 title:** Create a brand account

**Step 1 instructions (HTML):**

```html
<p>Register a new account at <a href="https://bsky.app/">bsky.app</a> with a handle that matches your brand. Keep this login separate from your personal account.</p>
```

**Step 2 title:** Add your business URL

**Step 2 instructions (HTML):**

```html
<p>On the brand profile at <a href="https://bsky.app/">bsky.app</a>, tap <strong>Edit profile</strong>, enter your company site in <strong>Website</strong>, save, and confirm the link on the public profile.</p>
```


**Opportunity 3 — Scheduled thread with link** (`scheduled-thread`) · Thread link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `bluesky` · URL — · label `Schedule with OpenQuok`

**Description (HTML — paste into Description):**

```html
<p>After your brand profile lists your website, publish a multi-post thread with your link in the first post. You can publish on <a href="https://bsky.app/">Bluesky</a> or schedule the thread in <a href="https://www.openquok.com/channels/bluesky">OpenQuok</a> once that account is connected.</p>
```

**Step 1 title:** Compose a thread with your link

**Step 1 instructions (HTML):**

```html
<p>Switch to the account you use for the update, start a new thread on <a href="https://bsky.app/">Bluesky</a>, and put your URL in the first post with a short line of context—see <a href="https://docs.bsky.app/docs/advanced-guides/posts">threading on Bluesky</a>.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Post now or schedule in <a href="https://www.openquok.com/channels/bluesky">OpenQuok</a> if you want one calendar for Bluesky and your other channels.</p>
```


**Opportunity 4 — Reply with link** (`helpful-reply`) · Comment link · hard · manual_review · nofollow · free · sort `30`

**Approval hint:** Post author and community norms vary

**CTA (modal):** kind `use_plug` · channel — · plug `bluesky-auto-plug` · URL — · label `Plugs and automation`

**OpenQuok plug name (modal):** `bluesky-auto-plug` (optional reach boost: `bluesky-auto-repost`)

**Description (HTML — paste into Description):**

```html
<p>Reply on <a href="https://bsky.app/">Bluesky</a> with a helpful comment and your URL when it fits—links are typically nofollow. On posts you publish, OpenQuok <strong>Auto plug post</strong> (<code>bluesky-auto-plug</code>) sends an automated reply with your link after your like threshold so you do not have to bump the post yourself. <a href="https://www.openquok.com/docs/getting-started-for-public-api">Set up plugs</a> after you connect Bluesky.</p>
```

**Step 1 title:** Reply with a helpful link

**Step 1 instructions (HTML):**

```html
<p>On <a href="https://bsky.app/">Bluesky</a>, join a relevant conversation, add a useful reply, and include your URL once when it fits the thread—links are typically nofollow.</p>
```

**Step 2 title:** Automate a follow-up on your posts

**Step 2 instructions (HTML):**

```html
<p>On posts you publish, connect Bluesky in <a href="https://www.openquok.com/channels/bluesky">OpenQuok</a> and attach plug <code>bluesky-auto-plug</code> (like threshold + reply with your link). OpenQuok publishes the reply when your rules match. Optional: <code>bluesky-auto-repost</code> reposts after likes for extra reach—no link in the repost itself.</p>
```


---

### Facebook (`facebook`)

- **Site URL:** `https://www.facebook.com`
- **OpenQuok auth:** Yes · **Channel:** `facebook`
- **DR · DA · traffic:** 96 · 96 · 10,660,000,000/mo
- **Short:** Pages, profiles, posts, and comments for brand visibility.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.facebook.com/">Facebook</a> Pages and profiles can surface your site URL. Posts and follow-up comments extend reach when policy allows external links.</p>
```

**Opportunity 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `facebook` · URL — · label `Connect Facebook`

**Description (HTML — paste into Description):**

```html
<p>Use your main personal <a href="https://www.facebook.com/">Facebook</a> profile—the account you post from as yourself—and add your site in <strong>Intro</strong> or the website field on your profile when Meta shows it. Good for founders who want one handle for you and your project. Links are typically nofollow; value is clicks and discovery.</p>
```

**Step 1 title:** Open your personal profile

**Step 1 instructions (HTML):**

```html
<p>Log in at <a href="https://www.facebook.com/">facebook.com</a>, open your personal profile (not a Page), and choose <strong>Edit profile</strong> or <strong>Edit details</strong>.</p>
```

**Step 2 title:** Add your link

**Step 2 instructions (HTML):**

```html
<p>Add your URL in <strong>Website</strong> or your intro text once, save, and confirm on your public profile view.</p>
```


**Opportunity 2 — Create a business Page** (`page-about-link`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `facebook` · URL — · label `Connect Facebook`

**Description (HTML — paste into Description):**

```html
<p>Create a <a href="https://www.facebook.com/pages/create">Facebook Page</a> for your brand (not only a personal profile). Add your primary website in Page About before you post link updates—see <a href="https://www.facebook.com/business/help/104002583036875">add a website to your Page</a>. Facebook typically nofollows outbound links, including Page website fields.</p>
```

**Step 1 title:** Create a business Page

**Step 1 instructions (HTML):**

```html
<p>Create a <a href="https://www.facebook.com/pages/create">Facebook Page</a> for your brand (not only a personal profile).</p>
```

**Step 2 title:** Add your URL in Page settings

**Step 2 instructions (HTML):**

```html
<p>In Page settings, open <strong>About</strong> (wording may vary), fill in <strong>Website</strong>, then save—see <a href="https://www.facebook.com/business/help/104002583036875">Meta business help</a>.</p>
```


**Opportunity 3 — Facebook Page post** (`page-post`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `facebook` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>After your Page is set up, share a link in a Page post. You can publish on <a href="https://www.facebook.com/">Facebook</a> or schedule the same update in <a href="https://www.openquok.com/channels/facebook">OpenQuok</a> once your Page is connected.</p>
```

**Step 1 title:** Open Facebook as your Page

**Step 1 instructions (HTML):**

```html
<p>Log in at <a href="https://www.facebook.com/">facebook.com</a> and switch to your brand Page (not your personal profile).</p>
```

**Step 2 title:** Add your link and publish

**Step 2 instructions (HTML):**

```html
<p>Paste your URL, add a short line of context, then post now or schedule in <a href="https://www.openquok.com/channels/facebook">OpenQuok</a> if you prefer one calendar for Facebook and your other channels.</p>
```


---

### Reddit (`reddit`)

- **Site URL:** `https://www.reddit.com`
- **OpenQuok auth:** No · **Channel:** (empty) · **Tags:** Community moderated
- **DR · DA · traffic:** 91 · 92 · 5,250,000,000/mo
- **Short:** Community posts, profiles, and Q&A threads — follow each subreddit's self-promotion rules.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.reddit.com/">Reddit</a> offers several link surfaces: feed posts, profile bios, and helpful answers in comment threads. Moderation varies by community—read each subreddit’s rules before you post.</p>
```

**Opportunity 1 — Subreddit post** (`subreddit-post`) · Post link · medium · manual_review · nofollow · free · sort `10`

**Approval hint:** Varies by subreddit moderators

**CTA (modal):** kind `none` · channel — · URL `https://www.reddit.com/submit` · label `Open Reddit submit`

**Description (HTML — paste into Description):**

```html
<p>Share a post where subreddit rules allow promotional or showcase content. Use <a href="https://www.reddit.com/submit">Reddit submit</a> when you are ready; outbound links in posts use <code>rel=nofollow ugc</code>.</p>
```

**Step 1 title:** Pick a subreddit

**Step 1 instructions (HTML):**

```html
<p>Read the subreddit rules and recent posts to match tone and self-promotion limits (see <a href="https://support.reddithelp.com/hc/en-us/articles/205926439">Reddiquette</a> for community norms).</p>
```

**Step 2 title:** Draft value-first copy

**Step 2 instructions (HTML):**

```html
<p>Lead with insight; place your link once where the rules allow, then publish via <a href="https://www.reddit.com/submit">Reddit submit</a>.</p>
```


**Opportunity 2 — Profile bio link** (`profile-bio`) · Profile link · easy · instant · nofollow · free · sort `20`

**CTA (modal):** kind `none` · channel — · URL `https://www.reddit.com/settings/profile` · label `Edit profile`

**Description (HTML — paste into Description):**

```html
<p>Add your site to your Reddit profile description in <a href="https://www.reddit.com/settings/profile">profile settings</a>. Reddit marks outbound profile links nofollow (ugc), same as posts and comments.</p>
```

**Step 1 title:** Open profile settings

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://www.reddit.com/settings/profile">Settings → Profile</a>.</p>
```

**Step 2 title:** Add your link in About

**Step 2 instructions (HTML):**

```html
<p>Paste your URL in the About description in <a href="https://www.reddit.com/settings/profile">profile settings</a>, save, and confirm it appears on your public profile.</p>
```


**Opportunity 3 — Helpful answer link** (`helpful-answer`) · Q&A link · hard · manual_review · nofollow · free · sort `30`

**Approval hint:** Community voting and mod removal

**CTA (modal):** kind `external_doc` · channel — · URL `https://www.redditinc.com/policies/content-policy` · label `Reddit content policy`

**Description (HTML — paste into Description):**

```html
<p>Answer a question with genuine help and a single relevant link when permitted. Follow the <a href="https://www.redditinc.com/policies/content-policy">Reddit content policy</a>; comment links are nofollow ugc.</p>
```

**Step 1 title:** Find a relevant thread

**Step 1 instructions (HTML):**

```html
<p>Choose a question where your product or article truly helps.</p>
```

**Step 2 title:** Reply with one link

**Step 2 instructions (HTML):**

```html
<p>Write a useful answer first. Only add your URL if you see other people’s comments and the moderator doesn’t remove it. You still can mention only your website name. Readers who are really interested will search via Google anyway. This also improves your SEO.</p>
```


---

### GitHub (`github`)

- **Site URL:** `https://github.com`
- **OpenQuok auth:** No · **Tags:** High domain rating, GitHub
- **DR · DA · traffic:** 97 · 96 · 1,210,000,000/mo
- **Short:** Profiles, project sites, and package pages on github.com — each surface has different link rules.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://github.com/">GitHub</a> hosts distinct backlink paths: profile settings (website and social URLs), a profile README repo, <a href="https://pages.github.com/">GitHub Pages</a> sites, and container package listings. Pick the workflow that matches your product.</p>
```

**Opportunity 1 — Profile README** (`profile-readme`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `none` · channel — · URL `https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme` · label `Profile README docs`

**Description (HTML — paste into Description):**

```html
<p>Create a public repository named like your username with a README.md—GitHub renders it on your profile. See <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme">profile README docs</a>; links on github.com are nofollow.</p>
```

**Step 1 title:** Create the profile repo

**Step 1 instructions (HTML):**

```html
<p>New public repository on <a href="https://github.com/new">github.com/new</a> named exactly your GitHub username, with a README.</p>
```

**Step 2 title:** Write the README

**Step 2 instructions (HTML):**

```html
<p>Introduce yourself or your product and include one clear link to your marketing site or docs—follow <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme">GitHub’s profile README guide</a>.</p>
```


**Opportunity 2 — Profile website and social links** (`profile-website-social`) · Profile link · easy · instant · nofollow · free · sort `20`

**CTA (modal):** kind `external_doc` · channel — · URL `https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/adding-social-links-to-your-profile` · label `Add social links to your profile`

**Description (HTML — paste into Description):**

```html
<p>Edit your public GitHub profile and add your primary site in <strong>Website</strong>, plus up to four <strong>Social accounts</strong> (LinkedIn, X, or other URLs). See <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/adding-social-links-to-your-profile">adding social links to your profile</a>; links on github.com are typically nofollow but strong for discovery.</p>
```

**Step 1 title:** Open profile settings

**Step 1 instructions (HTML):**

```html
<p>From your profile, choose <strong>Edit profile</strong>, or open <a href="https://github.com/settings/profile">Public profile settings</a>.</p>
```

**Step 2 title:** Add Website and social URLs

**Step 2 instructions (HTML):**

```html
<p>Paste your marketing site in <strong>Website</strong>; fill <strong>Social accounts</strong> with relevant links (company, docs, LinkedIn, X) — then <strong>Save</strong>.</p>
```


**Opportunity 3 — GitHub Pages site** (`github-pages-site`) · Post link · medium · instant · dofollow · free · sort `30`

**CTA (modal):** kind `none` · channel — · URL `https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site` · label `GitHub Pages guide`

**Description (HTML — paste into Description):**

```html
<p>Publish a static site or docs with <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site">GitHub Pages</a> on github.io (or a custom domain). Unlike READMEs on github.com, Pages serves your HTML without adding rel=nofollow to outbound links you author.</p>
```

**Step 1 title:** Enable GitHub Pages

**Step 1 instructions (HTML):**

```html
<p>Repository <strong>Settings → Pages</strong>—deploy from a branch or Actions workflow per the <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site">Pages guide</a>.</p>
```

**Step 2 title:** Publish with your link

**Step 2 instructions (HTML):**

```html
<p>Add content that links to your canonical product URL in header, footer, or about page.</p>
```


**Opportunity 4 — Container package (GHCR)** (`ghcr-container-package`) · GitHub contribution · medium · instant · nofollow · free · sort `40`

**CTA (modal):** kind `none` · channel — · URL `https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry` · label `Container registry docs`

**Description (HTML — paste into Description):**

```html
<p>Publish an OCI image to <a href="https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry">GitHub Container Registry</a>. The package page lives on github.com—README and repo links use GitHub's nofollow sanitizer, similar to profile READMEs.</p>
```

**Step 1 title:** Publish the image

**Step 1 instructions (HTML):**

```html
<p>Push a tagged image to <code>ghcr.io</code> and link the package to your source repository—follow the <a href="https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry">container registry docs</a>.</p>
```

**Step 2 title:** Link your site in the README

**Step 2 instructions (HTML):**

```html
<p>In the repo README, link install docs and your primary site—expect nofollow on <a href="https://github.com/">github.com</a> anchors.</p>
```


---

### Uneed (`uneed`)

- **Site URL:** `https://uneed.best`
- **Category:** Launch platforms · **OpenQuok auth:** No · **Tags:** (none required)
- **DR · DA · traffic:** 75 · 38 · 188,000/mo · **Metrics source:** `ahrefs_dr_2026-10; semrush_traffic_2026-08`
- **Short:** Launch directory — free launch queue, paid fast-track slots, and a free maker profile (nofollow).
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://uneed.best/">Uneed</a> is a product launchpad: <strong>Join the line</strong> ($0) for a new product, paid <strong>Skip the line</strong> / <strong>Fast-track</strong> / <strong>Relaunch</strong> options on <a href="https://uneed.best/pricing">Pricing</a>, plus a free maker profile. Uneed cites a <strong>75 DR</strong> domain; launch backlinks are <strong>dofollow</strong> when you meet their upvote rules—maker profile website links are <strong>nofollow</strong>. Advertising and paid reviews are separate products on Pricing.</p>
```

**Opportunity 1 — Free launch (join the line)** (`free-launch`) · Product submission · hard · manual_review · unknown · free · sort `10`

**Approval hint:** Uneed assigns your launch date (up to about five months out)

**Cost note:** $0 — upvote score 10 to stay published; score 20 for dofollow per Pricing

**CTA (modal):** kind `external_doc` · channel — · URL `https://uneed.best/pricing` · label `Uneed pricing`

**Description (HTML — paste into Description):**

```html
<p>Launch a <strong>new product</strong> on the free <strong>Join the line</strong> tier at <a href="https://uneed.best/pricing">Uneed pricing</a> ($0). Uneed picks your launch date (at most about five months out). You need an upvote score of <strong>10</strong> for the listing to stay live and <strong>20</strong> for a <strong>dofollow</strong> backlink from their <strong>75 DR</strong> domain—confirm <code>rel</code> on your live product page after launch day.</p>
```

**Step 1 title:** Read free launch rules

**Step 1 instructions (HTML):**

```html
<p>On <a href="https://uneed.best/pricing">Pricing</a>, open <strong>Launch → New product → Join the line</strong> and note upvote thresholds (10 to stay published, 20 for dofollow) and how the queue assigns dates.</p>
```

**Step 2 title:** Submit and earn upvotes

**Step 2 instructions (HTML):**

```html
<p>Submit your product on <a href="https://uneed.best/">Uneed</a> with accurate URL and assets. Promote launch day to reach score 20 if you want the dofollow backlink—inspect the listing link after you go live.</p>
```


**Opportunity 2 — Paid launch** (`paid-launch`) · Product submission · medium · manual_review · dofollow · paid · sort `15`

**Approval hint:** Timing depends on tier (chosen date, ~14 days fast-track, or relaunch slot)

**Cost note:** Skip the line $29.99 (pick date; dofollow guaranteed per Pricing) · Fast-track $14.99 (~14 days; dofollow from score 10) · Relaunch $15 for an existing Uneed product

**CTA (modal):** kind `external_doc` · channel — · URL `https://uneed.best/pricing` · label `Uneed pricing`

**Description (HTML — paste into Description):**

```html
<p>Paid launch tiers on <a href="https://uneed.best/pricing">Uneed</a> trade money for speed and clearer backlink rules: <strong>Skip the line</strong> ($29.99) lets you choose the launch date with a guaranteed dofollow backlink; <strong>Fast-track</strong> ($14.99) assigns a slot in about 14 days with dofollow from upvote score 10; <strong>Relaunch</strong> ($15) is for a product you already launched on Uneed. All cite homepage visibility and a 75 DR dofollow path when terms are met—verify <code>rel</code> on your card.</p>
```

**Step 1 title:** Pick a paid launch tier

**Step 1 instructions (HTML):**

```html
<p>Compare <strong>Skip the line</strong>, <strong>Fast-track</strong>, and <strong>Relaunch</strong> on <a href="https://uneed.best/pricing">Pricing</a> against your timeline and SEO goal (guaranteed dofollow vs score-based).</p>
```

**Step 2 title:** Pay and launch

**Step 2 instructions (HTML):**

```html
<p>Checkout the tier you need, complete the product listing, and confirm the live Uneed page links to your site with <code>rel="dofollow"</code> (or follow Pricing’s score rules for fast-track).</p>
```


**Opportunity 3 — Free maker profile** (`free-profile`) · Profile link · easy · instant · nofollow · free · sort `20`

**CTA (modal):** kind `none` · channel — · URL `https://uneed.best` · label `Create profile`

**Description (HTML — paste into Description):**

```html
<p>Create a free maker profile on <a href="https://uneed.best/">Uneed</a> with your project URL. The profile <strong>website</strong> field links out with <code>rel="nofollow"</code> on live profiles—still strong for discovery and clicks, not for passing PageRank from Uneed.</p>
```

**Step 1 title:** Create your maker profile

**Step 1 instructions (HTML):**

```html
<p>Sign up at <a href="https://uneed.best/">uneed.best</a>, open your maker profile, and add your product name plus homepage URL in the website field.</p>
```

**Step 2 title:** Confirm link treatment

**Step 2 instructions (HTML):**

```html
<p>Open your public profile (for example <a href="https://www.uneed.best/profile/openquok">uneed.best/profile/your-handle</a>), right-click the website link → Inspect, and confirm <code>rel</code> includes <code>nofollow</code>. Re-check after Uneed updates—launch listings use different rules than profiles.</p>
```


---

### Open Launch (`open-launch`)

- **Site URL:** `https://open-launch.com`
- **Category:** Launch platforms · **OpenQuok auth:** No · **Tags:** (none required)
- **DR · DA · traffic:** 35 · 32 · 10,000/mo · **Metrics source:** `open_launch_stats_2026; semrush_traffic_2026-08`
- **Short:** Product launch platform — submit your project for homepage visibility, badges, and backlink opportunities.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://open-launch.com/">Open Launch</a> lists tech products on a daily launch homepage (launches at <strong>8:00 AM UTC</strong>). Choose a <strong>free</strong> slot (long waitlist; conditional dofollow) or <strong>Premium</strong> ($12/launch, guaranteed dofollow per <a href="https://open-launch.com/pricing">Pricing</a>). A separate SEO Growth Package exists for article + launch bundles—see Pricing if you need content, not just a listing.</p>
```

**Opportunity 1 — Free launch** (`free-launch`) · Product submission · hard · manual_review · unknown · free · sort `10`

**Approval hint:** Free queue fully booked into 2027

**Cost note:** $0 — dofollow only if you rank top 3 that day or display Open Launch’s badge on your site (per Pricing)

**CTA (modal):** kind `external_doc` · channel — · URL `https://open-launch.com/pricing` · label `Open Launch pricing`

**Description (HTML — paste into Description):**

```html
<p>Join the <strong>Free Launch</strong> queue on <a href="https://open-launch.com/">Open Launch</a> ($0). You can be featured on the homepage, but <a href="https://open-launch.com/pricing">Pricing</a> states a <strong>dofollow</strong> backlink only if you finish <strong>top 3</strong> in the daily ranking or display their badge on your site—otherwise treat the listing as typically nofollow until you verify <code>rel</code> on your live page. Free slots were fully booked into 2027 when we last checked Pricing; use their waitlist flow if free is all you need.</p>
```

**Step 1 title:** Read free launch rules

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://open-launch.com/pricing">Open Launch pricing</a> and confirm free availability, dofollow conditions (top 3 or badge), and daily launch time (8:00 AM UTC).</p>
```

**Step 2 title:** Join the waitlist or submit free

**Step 2 instructions (HTML):**

```html
<p>Start a launch from <a href="https://open-launch.com/">open-launch.com</a> when free is open, or follow Pricing to get emailed when free reopens. After you go live, inspect your listing URL’s <code>rel</code> attribute and add the badge if you are chasing the dofollow path.</p>
```


**Opportunity 2 — Premium launch** (`premium-launch`) · Product submission · medium · manual_review · dofollow · paid · sort `20`

**Approval hint:** Limited premium slots per day; launches at 8:00 AM UTC

**Cost note:** $12/launch (Premium) per Pricing — re-check before you pay

**CTA (modal):** kind `external_doc` · channel — · URL `https://open-launch.com/pricing` · label `Open Launch pricing`

**Description (HTML — paste into Description):**

```html
<p><strong>Premium Launch</strong> on <a href="https://open-launch.com/pricing">Open Launch</a> is the paid path when you need a slot soon: Pricing advertises launch the next day (subject to availability), homepage feature, and a <strong>guaranteed dofollow</strong> backlink from their domain (they cite DR 71 on Pricing—re-check in your SEO tool). Limited premium slots per day; launches run at 8:00 AM UTC.</p>
```

**Step 1 title:** Reserve a premium slot

**Step 1 instructions (HTML):**

```html
<p>On <a href="https://open-launch.com/pricing">Pricing</a>, review Premium Launch ($12/launch), remaining slots for your target day, and what is included versus the free tier.</p>
```

**Step 2 title:** Submit and verify your link

**Step 2 instructions (HTML):**

```html
<p>Complete checkout and submit your product URL and assets. After the launch goes live, confirm the homepage listing uses a <strong>dofollow</strong> link to your site and save the badge or listing URL for your records.</p>
```


---

### Awesome Selfhosted (`awesome-selfhosted`)

- **Site URL:** `https://awesome-selfhosted.net`
- **Category:** Maker and dev directories · **OpenQuok auth:** No · **Tags:** Community moderated, High domain rating (optional **GitHub** if you want the hub filter)
- **DR · DA · traffic:** 72 · 70 · 24,000/mo
- **Short:** Community-maintained catalog of self-hosted software — submit via pull request.
- **Long (HTML — paste into Long description):**

```html
<p>The <a href="https://awesome-selfhosted.net/">Awesome Selfhosted</a> catalog is built from YAML in <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data">awesome-selfhosted-data</a>. Additions are pull requests there—not the legacy markdown repo. Merged entries show your homepage on the site and in the generated list.</p>
```

**Official sources:** [CONTRIBUTING.md](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md) · [awesome-selfhosted.net](https://awesome-selfhosted.net/) · Main [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) repo README states PRs must go to **awesome-selfhosted-data**.

**Opportunity 1 — Awesome list pull request** (`list-pr`) · GitHub contribution · hard · manual_review · nofollow · free · sort `10`

**Approval hint:** Maintainer review (maintainers note merges often happen ~1 week after approval)

**CTA (modal):** kind `none` · channel — · URL `https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md` · label `Contributing guide`

**Description (HTML — paste into Description):**

```html
<p>Submit a pull request to <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data">awesome-selfhosted-data</a> adding a new <code>software/your-project.yml</code> entry (one project per PR). Your listing includes your <strong>website</strong> and <strong>source code</strong> URLs; after merge it appears on <a href="https://awesome-selfhosted.net/">awesome-selfhosted.net</a> and in the generated GitHub markdown. Links on github.com render with nofollow like other README links.</p>
```

**Step 1 title:** Confirm eligibility

**Step 1 instructions (HTML):**

```html
<p>Free/open-source, self-hostable network service or web app; actively maintained; <strong>tagged first release older than 4 months</strong>; working installation instructions; not desktop-only, PaaS, or cloud-only—see the <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md">CONTRIBUTING guide</a> and the PR checklist.</p>
```

**Step 2 title:** Open the data PR

**Step 2 instructions (HTML):**

```html
<p>Fork <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data">awesome-selfhosted-data</a>, add <code>software/your-project.yml</code> from the <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/.github/ISSUE_TEMPLATE/addition.md">addition template</a> (kebab-case filename), pick the best <strong>tag</strong> for category, and open a pull request. Do <strong>not</strong> PR the <a href="https://github.com/awesome-selfhosted/awesome-selfhosted">awesome-selfhosted</a> markdown repo—it redirects you to <strong>awesome-selfhosted-data</strong>.</p>
```

---

## New sites — OpenQuok `/channels` (add in admin)

Create each site with **Admin published** on. Map **OpenQuok channel slug** to the channel landing page.

| Site slug | Title | Site URL | Channel slug | DR | DA | Monthly visits |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `threads` | Threads | `https://www.threads.net` | `threads` | 97 | 92 | 318,000,000 |
| `instagram` | Instagram | `https://www.instagram.com` | `instagram` | 98 | 94 | 6,550,000,000 |
| `youtube` | YouTube | `https://www.youtube.com` | `youtube` | 100 | 100 | 54,930,000,000 |
| `tiktok` | TikTok | `https://www.tiktok.com` | `tiktok` | 99 | 96 | 2,600,000,000 |
| `linkedin` | LinkedIn | `https://www.linkedin.com` | `linkedin` | 98 | 99 | 1,680,000,000 |
| `x` | X | `https://x.com` | `x` | 99 | 97 | 4,060,000,000 |
| `devto` | Dev.to | `https://dev.to` | `devto` | 91 | 85 | 9,200,000 |

**Category:** Social platforms · **Tags:** High domain rating · **OpenQuok auth supported:** Yes for all rows above.

---

### Threads (`threads`)

- **Site URL:** `https://www.threads.net`
- **OpenQuok auth:** Yes · **Channel:** `threads` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 97 · 92 · 318,000,000/mo
- **Short:** Text-first social posts from Meta — profiles and threads for brand discovery.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.threads.net/">Threads</a> supports links in posts, profile fields, and replies. Treat outbound links as typically nofollow; focus on traffic and visibility. On threads you publish, OpenQuok plugs can add a follow-up reply with your URL after engagement.</p>
```

**Opp 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `threads` · URL — · label `Connect Threads`

**Description (HTML — paste into Description):**

```html
<p>Use your main personal <a href="https://www.threads.net/">Threads</a> profile—the one tied to your day-to-day Instagram login—and add your site in bio or profile fields before you post. Good for founders who want one handle for you and your project. Links are typically nofollow.</p>
```

**Step 1 title:** Open your personal profile

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://www.threads.net/">Threads</a> with the personal Instagram-linked account you use as yourself, then open profile settings.</p>
```

**Step 2 title:** Add your link

**Step 2 instructions (HTML):**

```html
<p>Paste your URL in the profile link or bio field Meta provides, save, and confirm on your public profile.</p>
```


**Opp 2 — Brand profile link** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `threads` · URL — · label `Connect Threads`

**Description (HTML — paste into Description):**

```html
<p>Create a <a href="https://www.threads.net/">Threads</a> profile for your brand (linked to an Instagram account as Meta requires). Add your site in bio or profile fields before you post links—see <a href="https://www.facebook.com/business/help/threads">Meta Threads help</a>.</p>
```

**Step 1 title:** Set up your profile

**Step 1 instructions (HTML):**

```html
<p>Create or switch to a brand Threads profile connected to your <a href="https://www.instagram.com/">Instagram</a> presence—see <a href="https://www.facebook.com/business/help/threads">Threads for business</a>.</p>
```

**Step 2 title:** Add your URL

**Step 2 instructions (HTML):**

```html
<p>Paste your marketing site in the profile link or bio field Meta provides, then save.</p>
```


**Opp 3 — Thread post with link** (`thread-post-link`) · **Thread link** · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `threads` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>After your profile lists your site, publish a Threads post with your URL. Post on <a href="https://www.threads.net/">Threads</a> or schedule in <a href="https://www.openquok.com/channels/threads">OpenQuok</a> once your channel is connected.</p>
```

**Step 1 title:** Compose your post

**Step 1 instructions (HTML):**

```html
<p>Write a short update and include your URL once with context.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Post now or schedule in <a href="https://www.openquok.com/channels/threads">OpenQuok</a> for Threads alongside your other channels.</p>
```


**Opp 4 — Reply with link** (`helpful-reply`) · Comment link · hard · manual_review · nofollow · free · sort `30`

**Approval hint:** Thread author and community norms vary

**CTA (modal):** kind `use_plug` · channel — · plug `threads-autoPlugPost` · URL — · label `Plugs and automation`

**OpenQuok plug name (modal):** `threads-autoPlugPost` (or `threads-internal-follow-up` for a timed same-account reply without a like threshold)

**Description (HTML — paste into Description):**

```html
<p>Reply on <a href="https://www.threads.net/">Threads</a> with a helpful comment and your URL when it fits—links are typically nofollow. On threads you publish, OpenQuok <strong>Auto plug post</strong> and <strong>Delayed follow-up reply</strong> automate a follow-up with your link after likes or on your schedule so you do not have to bump the thread yourself. <a href="https://www.openquok.com/docs/getting-started-for-public-api">Set up plugs</a> after you connect Threads.</p>
```

**Step 1 title:** Reply with a helpful link

**Step 1 instructions (HTML):**

```html
<p>On <a href="https://www.threads.net/">Threads</a>, join a relevant conversation, add a useful reply, and include your URL once when it fits the thread—links are typically nofollow.</p>
```

**Step 2 title:** Automate a follow-up on your threads

**Step 2 instructions (HTML):**

```html
<p>On threads you publish, connect Threads in <a href="https://www.openquok.com/channels/threads">OpenQuok</a> and attach plug <code>threads-autoPlugPost</code> (like threshold + reply with your link) or <code>threads-internal-follow-up</code> (delay + reply copy). OpenQuok publishes the follow-up when your rules match so you do not have to bump the thread yourself.</p>
```


---

### Instagram (`instagram`)

- **Site URL:** `https://www.instagram.com`
- **OpenQuok auth:** Yes · **Channel:** `instagram` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 98 · 94 · 6,550,000,000/mo
- **Short:** Visual discovery — bio link and feed posts for brands and creators.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.instagram.com/">Instagram</a> Business profiles use a single bio link; posts and Reels can mention your URL in captions. Links are typically nofollow.</p>
```

**Opp 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `instagram` · URL — · label `Connect Instagram`

**Description (HTML — paste into Description):**

```html
<p>Use your personal <a href="https://www.instagram.com/">Instagram</a> (Creator or personal) account and put your site in the bio link when available—see <a href="https://help.instagram.com/566810106753081">add a link to your profile</a>. Good for founders building in public on one handle. Links are typically nofollow.</p>
```

**Step 1 title:** Open your personal profile

**Step 1 instructions (HTML):**

```html
<p>Go to <strong>Edit profile</strong> on the Instagram account you use as yourself in the app or on web.</p>
```

**Step 2 title:** Set the bio link

**Step 2 instructions (HTML):**

```html
<p>Add your website in the link field per <a href="https://help.instagram.com/566810106753081">Instagram Help</a>, save, and test from a logged-out view.</p>
```


**Opp 2 — Brand profile bio link** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `instagram` · URL — · label `Connect Instagram`

**Description (HTML — paste into Description):**

```html
<p>Switch to a Business or Creator account and put your primary URL in the bio link field—see <a href="https://help.instagram.com/566810106753081">add a link to your Instagram profile</a>. Essential for brand presence even when links are nofollow.</p>
```

**Step 1 title:** Open profile settings

**Step 1 instructions (HTML):**

```html
<p>Go to <strong>Edit profile</strong> on your Business or Creator account in the <a href="https://www.instagram.com/">Instagram</a> app or web.</p>
```

**Step 2 title:** Set the bio link

**Step 2 instructions (HTML):**

```html
<p>Add your website in the designated link field per <a href="https://help.instagram.com/566810106753081">Instagram Help</a>, save, and test from a logged-out view.</p>
```


**Opp 3 — Feed or Reel caption link** (`feed-reel-caption-link`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `instagram` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>Share your URL in a caption when it fits the post. Publish on <a href="https://www.instagram.com/">Instagram</a> or schedule in <a href="https://www.openquok.com/channels/instagram">OpenQuok</a> after your account is connected.</p>
```

**Step 1 title:** Create the post

**Step 1 instructions (HTML):**

```html
<p>Prepare image or Reel with caption text that includes your URL once.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Post in Instagram or schedule in <a href="https://www.openquok.com/channels/instagram">OpenQuok</a> if you use a shared content calendar.</p>
```


---

### YouTube (`youtube`)

- **Site URL:** `https://www.youtube.com`
- **OpenQuok auth:** Yes · **Channel:** `youtube` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 100 · 100 · 54,930,000,000/mo
- **Short:** Video channel — About links and descriptions for massive reach.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.youtube.com/">YouTube</a> channels can surface your site in About and in video descriptions. Links on youtube.com are typically nofollow; traffic value is high.</p>
```

**Opp 1 — Personal channel About links** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `youtube` · URL — · label `Connect YouTube`

**Description (HTML — paste into Description):**

```html
<p>On your personal <a href="https://www.youtube.com/">YouTube</a> channel (founder or creator account), add your site in channel <strong>About</strong> and custom links—see <a href="https://support.google.com/youtube/answer/9979691">channel links help</a>. Good when you build in public under your own name. Links are typically nofollow.</p>
```

**Step 1 title:** Open YouTube Studio

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://studio.youtube.com/">YouTube Studio</a> for your personal channel → <strong>Customization</strong> → <strong>Basic info</strong> / <strong>Links</strong>.</p>
```

**Step 2 title:** Add your site

**Step 2 instructions (HTML):**

```html
<p>Enter your homepage and allowed custom links, then save—confirm on the public channel About tab.</p>
```


**Opp 2 — Brand channel About links** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `youtube` · URL — · label `Connect YouTube`

**Description (HTML — paste into Description):**

```html
<p>On your <strong>brand</strong> YouTube channel (separate from your personal creator login), add your primary website in channel About and custom links—see <a href="https://support.google.com/youtube/answer/9979691">add links to your channel banner and profile</a>.</p>
```

**Step 1 title:** Open YouTube Studio

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://studio.youtube.com/">YouTube Studio</a> → <strong>Customization</strong> → <strong>Basic info</strong> / <strong>Links</strong>.</p>
```

**Step 2 title:** Add your site

**Step 2 instructions (HTML):**

```html
<p>Enter your homepage and any allowed custom links in <a href="https://studio.youtube.com/">YouTube Studio</a>, then save—see <a href="https://support.google.com/youtube/answer/9979691">Google’s channel links help</a>.</p>
```


**Opp 3 — Video description link** (`video-description-link`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `youtube` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>Place your URL in the description of a video (top lines help visibility). Upload on <a href="https://www.youtube.com/">YouTube</a> or schedule through <a href="https://www.openquok.com/channels/youtube">OpenQuok</a> when your channel is connected.</p>
```

**Step 1 title:** Draft the video

**Step 1 instructions (HTML):**

```html
<p>Write title, description with your URL near the top, and metadata in <a href="https://studio.youtube.com/">YouTube Studio</a>.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Upload in <a href="https://studio.youtube.com/">YouTube Studio</a> or schedule via <a href="https://www.openquok.com/channels/youtube">OpenQuok</a> for coordinated releases.</p>
```


---

### TikTok (`tiktok`)

- **Site URL:** `https://www.tiktok.com`
- **OpenQuok auth:** Yes · **Channel:** `tiktok` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 99 · 96 · 2,600,000,000/mo
- **Short:** Short-form video — bio link for mobile-first audiences.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.tiktok.com/">TikTok</a> profiles can add a website link once the account has <strong>at least 1,000 followers</strong> (see <a href="https://support.tiktok.com/en/using-tiktok/exploring-videos/adding-a-link-to-your-profile">adding a link to your profile</a>). Links are typically nofollow; under 1k, use captions in videos instead.</p>
```

**Opp 1 — Personal profile website link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `tiktok` · URL — · label `Connect TikTok`

**Description (HTML — paste into Description):**

```html
<p>Add your site to the website field on your personal <a href="https://www.tiktok.com/">TikTok</a> profile once you have <strong>at least 1,000 followers</strong>—see <a href="https://support.tiktok.com/en/using-tiktok/exploring-videos/adding-a-link-to-your-profile">adding a link to your profile</a>. Use the account you post from as yourself. Links are typically nofollow.</p>
```

**Step 1 title:** Confirm you are eligible

**Step 1 instructions (HTML):**

```html
<p>On your personal account, check that you have <strong>at least 1,000 followers</strong>—TikTok unlocks the profile website field at that threshold per <a href="https://support.tiktok.com/en/using-tiktok/exploring-videos/adding-a-link-to-your-profile">TikTok Help</a>. If you are under 1k, grow the account or use the video-caption playbook on this guide instead.</p>
```

**Step 2 title:** Add your website

**Step 2 instructions (HTML):**

```html
<p><a href="https://www.tiktok.com/">TikTok</a> app → <strong>Profile</strong> → <strong>Edit profile</strong> → paste your URL in <strong>Website</strong>, save, and confirm on your public profile.</p>
```


**Opp 2 — Brand profile website link** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `tiktok` · URL — · label `Connect TikTok`

**Description (HTML — paste into Description):**

```html
<p>Add your site to the website field on your <strong>brand</strong> TikTok profile (separate login from your personal account) once that account has <strong>at least 1,000 followers</strong>—see <a href="https://support.tiktok.com/en/using-tiktok/exploring-videos/adding-a-link-to-your-profile">adding a link to your profile</a>. Links are typically nofollow.</p>
```

**Step 1 title:** Confirm the brand account is eligible

**Step 1 instructions (HTML):**

```html
<p>Sign in to your brand TikTok (not your personal login) and confirm <strong>at least 1,000 followers</strong> so the website field is available—see <a href="https://support.tiktok.com/en/using-tiktok/exploring-videos/adding-a-link-to-your-profile">TikTok Help</a>.</p>
```

**Step 2 title:** Add your website

**Step 2 instructions (HTML):**

```html
<p><a href="https://www.tiktok.com/">TikTok</a> app → <strong>Profile</strong> → <strong>Edit profile</strong> → paste your marketing URL in <strong>Website</strong>, save, and confirm on the public brand profile.</p>
```


---

### LinkedIn (`linkedin`)

- **Site URL:** `https://www.linkedin.com`
- **OpenQuok auth:** Yes · **Channel:** `linkedin` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 98 · 99 · 1,680,000,000/mo
- **Short:** B2B profiles and Company Pages — website fields and link posts.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://www.linkedin.com/">LinkedIn</a> Company Pages and personal profiles can list your site. Feed posts, <a href="https://www.linkedin.com/help/linkedin/answer/a522427">native articles</a>, and comments can carry your URL—links are typically nofollow. Short posts can be scheduled in OpenQuok; articles are published on LinkedIn desktop. Plugs can add a follow-up comment on Page posts you publish.</p>
```

**Opp 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `linkedin` · URL — · label `Connect LinkedIn`

**Description (HTML — paste into Description):**

```html
<p>On your personal <a href="https://www.linkedin.com/">LinkedIn</a> member profile, add your site in the <strong>Contact info</strong> / website field—see <a href="https://www.linkedin.com/help/linkedin/answer/a542685">add website to your profile</a>. Good for founders who want buyers to find you and your project on one profile. Links are typically nofollow.</p>
```

**Step 1 title:** Open your profile

**Step 1 instructions (HTML):**

```html
<p>Go to your LinkedIn profile → <strong>Edit public profile</strong> → <strong>Contact info</strong>.</p>
```

**Step 2 title:** Add your website

**Step 2 instructions (HTML):**

```html
<p>Enter your homepage URL, save, and confirm on your public member profile.</p>
```


**Opp 2 — Company Page website** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `linkedin` · URL — · label `Connect LinkedIn`

**Description (HTML — paste into Description):**

```html
<p>Create a <a href="https://www.linkedin.com/help/linkedin/answer/a543852">LinkedIn Company Page</a> for your brand (not only a personal profile). You must confirm you are authorized to act for the company; LinkedIn may require <a href="https://www.linkedin.com/help/linkedin/answer/a1423367">workplace verification</a> with a <strong>work email on your company domain</strong> (not Gmail or Yahoo) before the Page can be created—see <a href="https://www.linkedin.com/help/linkedin/answer/a726850">troubleshoot creating a Page</a>. Add your primary website in Page details before link posts—see <a href="https://www.linkedin.com/help/linkedin/answer/a521928">add a website to your Page</a>.</p>
```

**Step 1 title:** Create or claim a Company Page

**Step 1 instructions (HTML):**

```html
<p>Sign in with a personal LinkedIn account that has <strong>more than one connection</strong> (new accounts may need to wait one day). Follow <a href="https://www.linkedin.com/help/linkedin/answer/a543852">Create a LinkedIn Page</a>—check the box that you are authorized to act for the organization. If LinkedIn blocks you, complete workplace verification with a work email at your company domain (e.g. <code>you@yourcompany.com</code>) per <a href="https://www.linkedin.com/help/linkedin/answer/a726850">LinkedIn Help</a>. If a Page already exists, request admin access instead of creating a duplicate.</p>
```

**Step 2 title:** Add your website

**Step 2 instructions (HTML):**

```html
<p>Page admin → <strong>Edit Page</strong> → enter Website URL and save—see <a href="https://www.linkedin.com/help/linkedin/answer/a521928">LinkedIn Help</a>.</p>
```


**Opp 3 — Page or profile link post** (`page-link-post`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `linkedin` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>Share an update with your URL after your Page lists your website. Publish on <a href="https://www.linkedin.com/">LinkedIn</a> or schedule in <a href="https://www.openquok.com/channels/linkedin">OpenQuok</a> once your LinkedIn channel is connected.</p>
```

**Step 1 title:** Compose the update

**Step 1 instructions (HTML):**

```html
<p>Write a short post with context and one link preview.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Post now or schedule in <a href="https://www.openquok.com/channels/linkedin">OpenQuok</a> for LinkedIn and your other channels.</p>
```


**Opp 4 — Publish article** (`publish-article`) · Post link · medium · instant · nofollow · free · sort `25`

**CTA (modal):** kind `external_doc` · channel — · URL `https://www.linkedin.com/help/linkedin/answer/a522427` · label `Publish articles on LinkedIn`

**Description (HTML — paste into Description):**

```html
<p>Publish a long-form <a href="https://www.linkedin.com/help/linkedin/answer/a522427">LinkedIn article</a> from your member profile or as a <strong>Page</strong> content admin—desktop only (not the mobile app). Use the editor’s <strong>Link</strong> tool to add your product or docs URL in the body; optional SEO title and description help discovery. Articles appear on your profile Activity and in followers’ feeds. Outbound links are typically nofollow—verify <code>rel</code> on your live article. This path is separate from short feed posts you can schedule in <a href="https://www.openquok.com/channels/linkedin">OpenQuok</a>.</p>
```

**Step 1 title:** Draft the article on desktop

**Step 1 instructions (HTML):**

```html
<p>On LinkedIn desktop, click <strong>Write article</strong> on the homepage. Outline a useful piece for your audience, add headings, and insert your site with the <strong>Link</strong> tool—see <a href="https://www.linkedin.com/help/linkedin/answer/a522427">publish articles on LinkedIn</a> and <a href="https://www.linkedin.com/help/linkedin/answer/a569569">publish as your Page</a> if you post as a Company Page.</p>
```

**Step 2 title:** Publish and share

**Step 2 instructions (HTML):**

```html
<p>Choose <strong>Publish as</strong> (yourself or your Page), set SEO settings if helpful, then click <strong>Publish</strong>. Share the article URL on other channels; confirm your homepage link uses the treatment you expect for SEO.</p>
```


**Opp 5 — Comment with link** (`comment-with-link`) · Comment link · hard · manual_review · nofollow · free · sort `30`

**Approval hint:** Post author and feed norms vary

**CTA (modal):** kind `use_plug` · channel — · plug `linkedin-page-auto-plug` · URL — · label `Plugs and automation`

**OpenQuok plug name (modal):** `linkedin-page-auto-plug` (Company Page posts; optional cross-account comment: `linkedin-add-comment`)

**Description (HTML — paste into Description):**

```html
<p>Comment on a relevant <a href="https://www.linkedin.com/">LinkedIn</a> post with helpful context and your URL when it fits—links are typically nofollow. On updates your <strong>Company Page</strong> publishes, OpenQuok <strong>Auto plug post</strong> (<code>linkedin-page-auto-plug</code>) adds a promotional comment with your link after your like threshold. <a href="https://www.openquok.com/docs/getting-started-for-public-api">Set up plugs</a> after you connect LinkedIn.</p>
```

**Step 1 title:** Comment with a helpful link

**Step 1 instructions (HTML):**

```html
<p>Find a post where you can add real value, write a short comment, and include your URL once when it belongs in the conversation—see <a href="https://www.linkedin.com/help/linkedin/answer/a524054">comment on LinkedIn posts</a>.</p>
```

**Step 2 title:** Automate a comment on your Page posts

**Step 2 instructions (HTML):**

```html
<p>After you schedule or publish a Page update in <a href="https://www.openquok.com/channels/linkedin">OpenQuok</a>, attach plug <code>linkedin-page-auto-plug</code> (likes threshold + comment with your link). Optional: <code>linkedin-add-comment</code> posts a comment from another connected LinkedIn channel on your update.</p>
```


---

### X (`x`)

- **Site URL:** `https://x.com`
- **OpenQuok auth:** Yes · **Channel:** `x` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 99 · 97 · 4,060,000,000/mo
- **Short:** Short posts and profile — bio link and post URLs for real-time reach.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://x.com/">X</a> profiles support a website field and posts with links; outbound links are typically nofollow. Schedule posts in <a href="https://www.openquok.com/channels/x">OpenQuok</a>, or use plugs to automate a reply with your URL on posts you publish.</p>
```

**Opp 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `x` · URL — · label `Connect X`

**Description (HTML — paste into Description):**

```html
<p>Use your main personal <a href="https://x.com/">X</a> account—the one you post from as yourself—and add your site in the <strong>Website</strong> field and/or bio. Good for founders who want one handle for you and your project. See <a href="https://help.x.com/en/managing-your-account/how-to-customize-your-profile">customize your profile</a>. Links are typically nofollow.</p>
```

**Step 1 title:** Edit your personal profile

**Step 1 instructions (HTML):**

```html
<p><strong>Profile</strong> → <strong>Edit profile</strong> on <a href="https://x.com/">x.com</a> while signed into your personal account.</p>
```

**Step 2 title:** Add your URL

**Step 2 instructions (HTML):**

```html
<p>Enter <strong>Website</strong> and optionally repeat in bio with context, then save per <a href="https://help.x.com/en/managing-your-account/how-to-customize-your-profile">X Help</a>.</p>
```


**Opp 2 — Brand profile link** (`profile-brand`) · Profile link · easy · instant · nofollow · free · sort `15`

**CTA (modal):** kind `connect_channel` · channel `x` · URL — · label `Connect X`

**Description (HTML — paste into Description):**

```html
<p>Create or use a separate <a href="https://x.com/">X</a> account for your company or product—not your personal login—and set your marketing site in <strong>Website</strong> and bio before you post product updates. Outbound links are typically nofollow.</p>
```

**Step 1 title:** Create or switch to brand account

**Step 1 instructions (HTML):**

```html
<p>Register or sign in to the X handle that matches your brand. Keep this login separate from your personal account.</p>
```

**Step 2 title:** Add your business URL

**Step 2 instructions (HTML):**

```html
<p>On the brand profile, open <strong>Edit profile</strong>, enter your company site in <strong>Website</strong>, save, and confirm on the public profile.</p>
```


**Opp 3 — Post with link** (`post-with-link`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `x` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>Share a post with your URL after your profile is set up. Post on <a href="https://x.com/">X</a> or schedule in <a href="https://www.openquok.com/channels/x">OpenQuok</a> when your X channel is connected.</p>
```

**Step 1 title:** Compose the post

**Step 1 instructions (HTML):**

```html
<p>Write a concise post with your URL once.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Post immediately or schedule in <a href="https://www.openquok.com/channels/x">OpenQuok</a> alongside other channels.</p>
```


**Opp 4 — Reply with link** (`helpful-reply`) · Comment link · hard · manual_review · nofollow · free · sort `30`

**Approval hint:** Post author and community norms vary

**CTA (modal):** kind `use_plug` · channel — · plug `x-auto-plug` · URL — · label `Plugs and automation`

**OpenQuok plug name (modal):** `x-auto-plug` (optional reach boost: `x-auto-repost`)

**Description (HTML — paste into Description):**

```html
<p>Reply on <a href="https://x.com/">X</a> with a helpful comment and your URL when it fits—links are typically nofollow. On posts you publish, OpenQuok <strong>Auto plug post</strong> (<code>x-auto-plug</code>) sends an automated reply with your link after your like threshold so you do not have to bump the post yourself. <a href="https://www.openquok.com/docs/getting-started-for-public-api">Set up plugs</a> after you connect X.</p>
```

**Step 1 title:** Reply with a helpful link

**Step 1 instructions (HTML):**

```html
<p>On <a href="https://x.com/">X</a>, reply to a relevant post with useful context and include your URL once when it fits the conversation—links are typically nofollow.</p>
```

**Step 2 title:** Automate a follow-up on your posts

**Step 2 instructions (HTML):**

```html
<p>On posts you publish, connect X in <a href="https://www.openquok.com/channels/x">OpenQuok</a> and attach plug <code>x-auto-plug</code> (like threshold + reply with your link). OpenQuok publishes the reply when your rules match. Optional: <code>x-auto-repost</code> reposts after likes for extra reach—the repost itself does not add a new URL.</p>
```


---

### Dev.to (`devto`)

- **Site URL:** `https://dev.to`
- **OpenQuok auth:** Yes · **Channel:** `devto` · **Category:** Social platforms · **Tags:** High domain rating
- **DR · DA · traffic:** 91 · 85 · 5,800,000/mo
- **Short:** Developer blogging — profile and articles with contextual links.
- **Long (HTML — paste into Long description):**

```html
<p><a href="https://dev.to/">Dev.to</a> profiles and posts support links to your project or docs. Follow <a href="https://dev.to/code-of-conduct">community guidelines</a>; links are typically nofollow on the platform.</p>
```

**Opp 1 — Personal profile link** (`profile-personal`) · Profile link · easy · instant · nofollow · free · sort `10`

**CTA (modal):** kind `connect_channel` · channel `devto` · URL — · label `Connect Dev.to`

**Description (HTML — paste into Description):**

```html
<p>Use your personal <a href="https://dev.to/">Dev.to</a> account and set your website in <a href="https://dev.to/settings">profile settings</a> before you publish articles that link back to your product—Dev.to is individual profiles only (no separate brand login). Links are typically nofollow.</p>
```

**Step 1 title:** Open profile settings

**Step 1 instructions (HTML):**

```html
<p>Open <a href="https://dev.to/settings">dev.to/settings</a> → <strong>Profile</strong>.</p>
```

**Step 2 title:** Add website

**Step 2 instructions (HTML):**

```html
<p>Paste your homepage or docs URL in <a href="https://dev.to/settings">profile settings</a> and save.</p>
```


**Opp 2 — Article with project link** (`article-project-link`) · Post link · medium · instant · nofollow · free · sort `20`

**CTA (modal):** kind `schedule_post` · channel `devto` · URL — · label `Schedule post`

**Description (HTML — paste into Description):**

```html
<p>Publish a technical article that naturally links to your site or repo—see <a href="https://dev.to/new">write a post</a>. Schedule in <a href="https://www.openquok.com/channels/devto">OpenQuok</a> if you coordinate Dev.to with other channels.</p>
```

**Step 1 title:** Draft the article

**Step 1 instructions (HTML):**

```html
<p>Write helpful content with one primary CTA link to your project—publish from <a href="https://dev.to/new">dev.to/new</a>.</p>
```

**Step 2 title:** Publish or schedule

**Step 2 instructions (HTML):**

```html
<p>Publish on <a href="https://dev.to/">Dev.to</a> or schedule through <a href="https://www.openquok.com/channels/devto">OpenQuok</a> when supported for your workflow.</p>
```


---

## After you paste content

1. Upload a **square logo** per site in the editor (export from [`branded-icons.ts`](web/src/data/icons/branded-icons.ts) or official brand assets).
2. Hard-refresh hub and site guides while logged out; confirm opportunity counts in FAQ blocks.
3. **Existing admin rows:** if you already published opportunities under old slugs (`profile-website-bio`, `business-profile-link`, `bio-link-business`, `company-page-website`, `channel-about-links`, `profile-website-link`, `profile-website` on Dev.to, `submit-project` on Open Launch), either **rename slug + re-sort** to match this handbook or **add** the new rows and unpublish duplicates—Open Launch should be **`free-launch` @ `10`** and **`premium-launch` @ `20`** instead of a single `submit-project`.
4. Optional: sync exemplar seed [`502_20251001_seed_link_directory_exemplar.sql`](backend/supabase/db/link-directory/502_20251001_seed_link_directory_exemplar.sql) in a follow-up PR so fresh environments match production.

Metrics are **estimates** — **monthly visits** from [Semrush Traffic Analytics](https://www.semrush.com/trending-websites/global/all) (August 2026 snapshot in the handbook); re-check Semrush overviews quarterly. Re-check **DA** on Moz and **DR** on Ahrefs when you rebaseline. Hub copy aggregates published opportunity counts automatically.
