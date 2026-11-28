# Directory extension UI patterns

Reference for **extension-assisted directory launches**: step rail, compare panel, `profilePath` mapping, and manual smoke. Fixtures live in `common/src/auto-launch/destination-configs/`; the dashboard hands off `extension_config` to the browser extension.

---

## Shipped directory destinations

| Site slug | Provider slugs | Start URLs (typical) | Content script |
| --- | --- | --- | --- |
| `uneed` | `uneed-join-line`, `uneed-paid-launch`, `uneed-maker-profile` | per variant on uneed.best | `openquok-directory-uneed.js` |
| `peerpush` | `peerpush-free-queue`, `peerpush-standard-launch` | peerpush.com submit flows | `openquok-directory-peerpush.js` |
| `open-launch` | `open-launch-free-launch`, `open-launch-premium-launch` | Premium wizard; free queue via pricing | `openquok-directory-open-launch.js` |
| `tinylaunch` | `tinylaunch-standard-launch`, `tinylaunch-premium-launch` | Premium → create form; Standard → pricing | `openquok-directory-tinylaunch.js` |
| `fazier` | `fazier-page`, `fazier-free-product-listing`, `fazier-paid-product-listing` | Page wizard; product submit (free vs paid tier) | `openquok-directory-fazier.js` |
| `devhunt` | `devhunt-standard-launch`, `devhunt-paid-launch` | Paid → new-tool form; Standard → launch guide then form | `openquok-directory-devhunt.js` |
| `nick-launches` | `nick-launches-free-launch`, `nick-launches-paid-launch`, `nick-launches-maker-profile` | Listing → `submit/new`; maker → `profile` | `openquok-directory-nick-launches.js` |
| `indiehub` | `indiehub-basic-launch`, `indiehub-pro-launch` | Submit wizard step 1 → `submit` | `openquok-directory-indiehub.js` |
| `alternativeto` | `alternativeto-free-listing`, `alternativeto-priority-review`, `alternativeto-finish-listing`, `alternativeto-user-profile` | Listing → `manage-item`; profile → `user/edit` | `openquok-directory-alternativeto.js` |
| `trustpilot` | `trustpilot-company-profile` | `businessapp.b2b.trustpilot.com/company-settings/` | `openquok-directory-trustpilot.js` |
| `startupinspire` | `startupinspire-free-listing`, `startupinspire-paid-listing` | Free → `dashboard` (pricing in `readyUrlHint`); Paid → `dashboard/startup/create` | `openquok-directory-startupinspire.js` |

**Site count for smoke:** **11** directory sites (26 provider variants total).

Picker groups: TinyLaunch, Open Launch, StartupInspire, Fazier, DevHunt, Nick Launches, IndieHub, and AlternativeTo group variants under one Add Channel tile per site (`picker_group_key` = site slug).

---

## Extension handoff (all sites)

1. Member chooses a destination on **My Products** → **Launch to directory**.
2. API returns `extension_config` (steps, fields, proof selectors) and `start_url`.
3. Extension opens `start_url`, runs login gate when needed, renders **step rail** and **field compare**.
4. Member edits on the live site, submits on the directory, then marks complete in OpenQuok with the **listing URL**.

Compare rail flags (`compareRequired`, `compareLabel`) come from fixtures; only map `profilePath` values that exist on the business profile composer.

---

## TinyLaunch field mapping

Module: `common/src/auto-launch/destination-configs/tinylaunch.ts`

| Form label (TinyLaunch) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Startup Name | `name` | `text` | max 30 |
| Tagline | `tagline` | `text` | max 60 |
| Logo | `logo_url` | `file` | `fileInputIndex` 0 |
| Images (gallery) | `profile_data.gallery_urls` | `files` | max 3 on TinyLaunch (`TINYLAUNCH_FORM_GALLERY_MAX`); profile holds up to 10; second file input |
| Website URL | `website_url` | `text` | |
| Description | `description` | `rich_html` | |
| Category | `profile_data.category` | `select` | `selectCatalog: 'tinylaunch'` |
| Upvote pledge | — | — | **Manual** on tinylaunch.com |

`readyUrlHint`: Premium uses `dashboard/startups`; Standard derives from Premium with `readyUrlHint: 'pricing'` via `syncMetadata` (`tinylaunch-standard-launch` → base `tinylaunch-premium-launch`).

Login: `extension/src/directory/directory-launch/siteLogin/tinylaunch.ts` → `https://www.tinylaunch.com/login`.

---

## Fazier field mapping

Module: `common/src/auto-launch/destination-configs/sites/fazier/config.ts`

### Company page (`fazier-page`)

| Step / label | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Name | `name` | `text` | Basic info |
| Page URL (slug) | `profile_data.slug` | `text` | `company` input |
| Website | `website_url` | `text` | |
| Logo | `logo_url` | `file` | |
| Tagline | `tagline` | `text` | max 120 on page flow |
| Industry | `profile_data.categories` | `text` | Overview |
| Company size / type | `profile_data.target_audiences`, `profile_data.use_cases` | `select` | combobox hints |
| Country / city / founded | `profile_data.platforms`, `profile_data.tech_stack`, `profile_data.launch_date` | `select` / `text` | review labels on live site |
| About | `description` | `text` | |
| LinkedIn / Twitter | `profile_data.social_linkedin`, `profile_data.social_x` | `text` | extra platform rows **manual** |

`readyUrlHint`: `page/new`. Login: `extension/src/directory/directory-launch/siteLogin/fazier.ts` → `https://fazier.com/login`.

### Product listing (`fazier-free-product-listing`, `fazier-paid-product-listing`)

| Form label | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Product name | `name` | `text` | |
| Tagline | `tagline` | `text` | directory tagline max |
| Website | `website_url` | `text` | |
| Description | `description` | `text` | |
| Features / use cases | `profile_data.use_cases` | `text` | |
| Logo / images | `logo_url`, `profile_data.gallery_urls` | `file` / `files` | |
| Category / pricing | `profile_data.categories`, `profile_data.pricing_type` | `select` | |
| LinkedIn / Twitter | `profile_data.social_*` | `text` | |
| Comments, badge embed, Lite Plan | — | — | **Manual** after submit |

`readyUrlHint`: `submit` (`https://fazier.com/submit` product form; marketing tiers live at `/launch`). Sign in before handoff so the form loads.

---

## Open Launch field mapping (summary)

| Area | `profilePath` | Notes |
| --- | --- | --- |
| Name, website, descriptions | `name`, `website_url`, `description` | |
| Logo / gallery | `logo_url`, gallery paths | |
| Categories / tech | `profile_data.*` | up to 3 categories, 5 tech tags |

Standard free queue spreads Premium config with `readyUrlHint: 'pricing'`.

---

## PeerPush & Uneed (summary)

- **PeerPush:** name, tagline, description, website, logo, PeerPush-specific discovery fields; Standard vs free queue destinations.
- **Uneed:** join line, paid launch, maker profile variants; category and tag catalogs via `fieldCatalogRegistry`. Media tab gallery is the `Images` block (1–3 `product_medias` previews; logo uses `#single` separately). Autofill uses the first three profile screenshots in Media tab order; when 3/3, remove a slot before fill.

See operator guides under `web/src/content/docs/directory-integration/`.

---

## DevHunt field mapping

Module: `common/src/auto-launch/destination-configs/sites/devhunt/config.ts`

| Form label (DevHunt) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Tool name | `name` | `text` | required |
| Catchy slogan | `tagline` | `text` | required |
| Tool website URL | `website_url` | `text` | required |
| Quick Description | `description` | `rich_html` | required |
| Logo | `logo_url` | `file` | `fileInputIndex` 0; required |
| Tool screenshots | `profile_data.gallery_urls` | `files` | Single `#image-upload`; fill one file at a time and wait for CDN preview; min 3 on DevHunt; autofill uses first 3 in web UI order (`DEVHUNT_FORM_GALLERY_MAX`); profile holds up to 10; required |
| GitHub repo URL | `profile_data.social_github` | `text` | optional; falls back to `profile_data.repository_url` |
| Tool pricing type | `profile_data.pricing_type` | `select` | `selectCatalog: 'devhunt_pricing'` (Free, Subscription, One-time fee) |
| Tool categories | `profile_data.categories` | `tags` | optional free text |
| Demo video | `profile_data.launch_video_url` | `text` | optional |
| Maker comment | — | — | **Manual** (DevHunt may auto-draft from name + slogan) |
| Launch week + $49 | — | — | **Manual** on `#pricing-container` / `#submit-btn` |
| Maker name | — | — | **Manual** (`#maker-name`) |

`readyUrlHint`: Paid uses `account/tools/new`; Standard derives from Paid with `readyUrlHint: 'blog/tools-developers-guide-launches-on-devhunt'` via `syncMetadata` (`devhunt-standard-launch` → base `devhunt-paid-launch`, `pricing-queue` — no `/pricing` path; DevHunt returns 404).

`readyStatusHint`: tells members to sign in, skip or review any AI website draft, then fill when `#form-container` is visible.

Login: `extension/src/directory/directory-launch/siteLogin/devhunt.ts` → `https://devhunt.org/login`; logged-in when on `account/tools` without the auth gate.

Proof: `successPathRegex` `/tool/` or `/account/tools`; listing URL `a[href*='devhunt.org/tool/']`.

---

## Nick Launches field mapping

Module: `common/src/auto-launch/destination-configs/sites/nick-launches/config.ts`

### Product listing (`submit/new`)

| Form label (Nick Launches) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Name | `name` | `text` | required |
| Tagline | `tagline` | `text` | required |
| Description | `description` | `rich_html` | required |
| Website URL | `website_url` | `text` | required |
| Logo | `logo_url` | `file` | required |
| Screenshots | `profile_data.gallery_urls` | `files` | max 5 (`NICK_LAUNCHES_FORM_GALLERY_MAX`) |
| Categories | `profile_data.categories` | `tags` | max 3; `tagsCatalog: 'nick_launches_categories'` |
| Pricing type | `profile_data.pricing_type` | `select` | `selectCatalog: 'nick_launches_pricing'` |
| Open source | `profile_data.is_open_source` | `checkbox` | optional |
| X username | `profile_data.social_x` | `text` | strip `@` if present |
| Demo video | `profile_data.launch_video_url` | `text` | optional |
| Target keyword, discount, first comment, launch date, slug | — | — | **Manual** v1 |
| Plan checkout | — | — | **Manual** on `/submit/plan/` |

Free and paid listing destinations share one fixture; `readyStatusHint` differs per provider slug (`nick-launches-free-launch` vs `nick-launches-paid-launch`).

### Maker profile (`profile`)

| Form label | `profilePath` | Notes |
| --- | --- | --- |
| Headline | `tagline` | |
| Bio | `description` | plain text fill |
| Website | `website_url` | |
| Avatar | `logo_url` | file |
| Social X / GitHub / LinkedIn / YouTube | `profile_data.social_*` | known keys only |
| First name, last name, handle, banner, city, country, calendar | — | **Manual** v1 |

`readyUrlHint`: `profile` for maker profile; `submit/new` for listing variants.

Login: `extension/src/directory/directory-launch/siteLogin/nick-launches.ts` → `https://nicklaunches.com/signin/` with path-aware callback.

---

## IndieHub field mapping

Module: `common/src/auto-launch/destination-configs/sites/indiehub/config.ts`

| Form label (IndieHub) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Link | `website_url` | `text` | required; skip or review IndieHub AI AutoFill from URL |
| Name | `name` | `text` | required |
| Categories | `profile_data.categories` | `tags` | `tagsCatalog: indiehub_categories`; required |
| Tags | `profile_data.tags` | `tags` | optional |
| Description (short) | `tagline` | `text` | required — not the long introduction |
| Introduction | `description` | `rich_html` | markdown editor; required |
| Icon | `logo_url` | `file` | `fileInputIndex` 0; 1:1, max 1 MB on site |
| Image (cover) | `profile_data.gallery_urls` | `files` | `maxItems: 1` (`INDIEHUB_FORM_COVER_MAX`); 16:9 banner |
| Payment / Publish | — | — | **Manual** on wizard steps 2–3 |
| Basic vs Pro checkout | — | — | **Manual** on step 2 (Stripe) |

`readyUrlHint`: `submit`. Basic and Pro destinations share one fixture; `readyStatusHint` differs per provider slug (`indiehub-basic-launch` vs `indiehub-pro-launch`).

Login: `extension/src/directory/directory-launch/siteLogin/indiehub.ts` → `https://indiehub.best/auth/login?callbackUrl=/submit`.

Proof: `successPathRegex` `/product/` or `/submit`; listing URL `a[href*='indiehub.best/product/'], a[href*='indiehub.best/products/']`.

---

## AlternativeTo field mapping

Module: `common/src/auto-launch/destination-configs/sites/alternativeto/config.ts`

### Listing (`manage-item`)

| Step / label | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Name | `name` | `text` | required |
| Short description | `tagline` | `text` | required; inherits main `tagline` on variants when empty; manage-item resolves via **Short Description** label / “keep it short…” helper |
| Full description | `description` | `rich_html` | manage-item: **Full Description** label / “longer description…” helper; strip promo links per FAQ |
| Website | `website_url` | `text` | required |
| Tags | `profile_data.tags` (+ categories, use_cases, platforms) | `tags` | required |
| Platforms | `profile_data.platforms` | `checkbox_group` | `checkboxCatalog: alternativeto_platforms`; required |
| Company / Author | `name` | `text` | required; tweak when legal entity ≠ product name |
| X (Twitter) | `profile_data.social_x` | `text` | `socialScalar: username` on product form when present |
| Pricing / license | `profile_data.pricing_type` | `select` | `selectCatalog: alternativeto_license` |
| Open source | `profile_data.is_open_source` | `boolean` | |
| Application icon | `logo_url` | `file` | Prefer **Upload icon by URL** (public https from profile); file dropzone fallback; min ~280px; required |
| Screenshots | `profile_data.gallery_urls` | `files` | Profile storage paths use **file** upload (download from OpenQuok then dropzone); **Upload screenshot by URL** only when gallery entries are already public `https://` (not `image/download`); max 5 (`ALTERNATIVETO_FORM_GALLERY_MAX`) |
| Add a new video URL (Videos) | `profile_data.launch_video_url` | `text` | YouTube URL; inherited from main profile on variants when empty |
| Features, languages, alternatives, upsell, Submit | — | — | **Manual** v1 |

Free listing, Priority review, and We finish it share one fixture; `readyStatusHint` differs per provider slug (`alternativeto-free-listing`, `alternativeto-priority-review`, `alternativeto-finish-listing`).

### User profile (`user/edit`)

| Form label | `profilePath` | Notes |
| --- | --- | --- |
| Twitter / X | `profile_data.social_x` | `socialScalar: username` |
| GitHub | `profile_data.social_github` (+ `repository_url`) | username |
| Instagram | `profile_data.social_instagram` | username |
| YouTube | `profile_data.social_youtube` | username |
| LinkedIn | `profile_data.social_linkedin` | full URL (default scalar) |
| Reddit | — | **Manual** v1 |

`readyUrlHint`: `manage-item` for listing tiers; `user/edit` for `alternativeto-user-profile`.

Login: `extension/src/directory/directory-launch/siteLogin/alternativeto.ts` → `https://alternativeto.net/login/?returnUrl=/manage-item/`; logged-in when manage-item or user/edit forms are visible.

Proof: `successPathRegex` `/software/` or `/manage-item/` (listing); listing URL `a[href*='alternativeto.net/software/']`.

---

## Trustpilot field mapping

Module: `common/src/auto-launch/destination-configs/sites/trustpilot/config.ts`

| Step / label | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Company name | `name` | `text` | required |
| Company domain | `website_url` | `text` | required |
| Logo / Upload logo | `logo_url` | `file` | JPG/PNG ~400×300, ~1 MB on site; required |
| Describe your company | `description` | `text` | required |
| Contact info (email, phone, address) | — | — | **Manual** v1 (empty step in fixture) |
| Save and publish, homepage screenshot, domain / business-email verification | — | — | **Manual** on Trustpilot |

`readyUrlHint`: `company-settings`.

Login: `extension/src/directory/directory-launch/siteLogin/trustpilot.ts` → `https://businessapp.b2b.trustpilot.com/`; logged-in when `company-settings` pathname is visible and company name/domain/description fields are present.

**Accordions:** Expand **About your business** before name/domain/logo fill and **Company description** before description fill. Fill is blocked with a panel warning when a section is collapsed (`siteMedia/trustpilotCompanySettings.ts`).

Proof: `successPathRegex` `trustpilot.com/review/`; listing URL `a[href*='trustpilot.com/review']`. Public website links on published profiles are typically **nofollow** — confirm `rel` after publish (`directory-integration/trustpilot.md`, Build backlinks catalog).

---

## StartupInspire field mapping

Module: `common/src/auto-launch/destination-configs/sites/startupinspire/config.ts`

| Form control (`formControlName`) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Startup name | `name` | `text` | required |
| Headline | `tagline` | `text` | required |
| Description | `description` | `rich_html` | required |
| Website URL | `website_url` | `text` | required |
| Logo | `logo_url` | `file` | `fileInputIndex` 0; required |
| Technology / category | `profile_data.category` | `text` | combobox or text when visible |
| Social links, launch status, reCAPTCHA, Starter checkout, publish | — | — | **Manual** on StartupInspire |

`readyUrlHint`: `dashboard/startup` for **Starter launch**; `pricing` for **free listing** (pricing-queue sync from paid provider).

Login: `extension/src/directory/directory-launch/siteLogin/startupinspire.ts` → `https://www.startupinspire.com/login`; logged-in when dashboard paths or create-form fields are visible.

Proof: `successPathRegex` `/startup/`; listing URL `a[href*='startupinspire.com/startup/']`. Confirm `rel` on the live website button after publish (`directory-integration/startupinspire.md`, Build backlinks catalog).

---

## Manual smoke checklist

Run after changing fixtures, extension manifests, or marketing tiles. Use a dev workspace with the extension loaded from `extension/dist`.

### All sites (11)

- [ ] `pnpm --filter openquok-common test:unit` (includes destination config drift tests)
- [ ] `pnpm sync:auto-launch-configs:check` and `pnpm sync:auto-launch-destinations:check`
- [ ] `pnpm sync:directory-launch-example-docs` (or `:check` in CI) after fixture or CLI/MCP example page changes
- [ ] Add Channel shows one tile per site with bundled logo under `/icons/link-directory/{slug}.svg`
- [ ] Side panel **session bar** (above Social / Directory tabs): sign in from the bar on Social → Directory shows the same connection label and channel picker (no red sign-in banner); **Disconnect** in the bar clears the Social composer; self-host connect from the bar works without opening Social first

### Fazier

- [ ] Sign in on fazier.com; **Company page** handoff opens `page/new` with non-empty `extension_config`
- [ ] Step rail shows **Basic info** → **Overview** → **Social links**; compare lists mapped profile fields
- [ ] Extra social platform rows on the page wizard are documented as manual in `directory-integration/fazier.md`
- [ ] **Free product listing** and **Paid product listing** handoffs open `https://fazier.com/submit` when signed in
- [ ] After publish, listing URL matches proof hints (`/company/` or `/launches/` / `/p/`)
- [ ] Badge, comments, and Lite Plan checkout stay manual per operator doc
- [ ] `directory-integration/fazier.md` loads; Build Backlinks lists Fazier with PeerPush, Uneed, Open Launch, TinyLaunch

### DevHunt

- [ ] Sign in on devhunt.org; **Paid launch** handoff opens `account/tools/new` with non-empty `extension_config`
- [ ] Step rail shows **Submit tool**; compare lists name, tagline, logo, gallery, website, description, and optional GitHub, pricing, categories, demo video
- [ ] Pricing select options match `devhunt_pricing` catalog labels
- [ ] **Standard launch** opens the launch guide URL; member navigates to the new-tool form; compare config matches Paid minus `readyUrlHint`
- [ ] Do not complete $49 checkout in automation; confirm ready hints cover launch week and payment
- [ ] After publish, proof regex and listing URL selector match a live `devhunt.org/tool/` link
- [ ] `/channels/devhunt` and `directory-integration/devhunt.md` docs load; hub lists DevHunt with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier
- [ ] `dist/icons/link-directory/devhunt.svg` exists after extension build

### Nick Launches

- [ ] Sign in on nicklaunches.com; **Free launch** or **Paid launch** handoff opens `submit/new` with non-empty `extension_config`
- [ ] Step rail shows **Submit listing**; compare lists name, tagline, logo, gallery, website, description, categories, and pricing type
- [ ] Category chips match `nick_launches_categories` catalog; pricing select matches `nick_launches_pricing`
- [ ] **Maker profile** handoff opens `/profile/`; headline, bio, website, avatar, and mapped socials fill
- [ ] Do not complete `/submit/plan/` checkout in automation; confirm ready hints cover badge and plan steps
- [ ] After publish, listing URL matches proof hints on the live site
- [ ] `/channels/nick-launches` and `directory-integration/nick-launches.md` docs load; hub lists Nick Launches with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier, DevHunt
- [ ] `dist/icons/link-directory/nick-launches.svg` exists after extension build

### IndieHub

- [ ] Sign in on indiehub.best; **Basic launch** or **Pro launch** handoff opens `submit` step 1 with non-empty `extension_config`
- [ ] Step rail shows **Details**; compare lists link, name, categories, tags, tagline, introduction, icon, and cover image
- [ ] Category chips match `indiehub_categories` catalog
- [ ] Do not complete Payment or Publish in automation; confirm ready hints cover steps 2–3
- [ ] After publish, listing URL matches proof hints on the live product page
- [ ] `/channels/indiehub` and `directory-integration/indiehub.md` docs load; hub lists IndieHub with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier, DevHunt, Nick Launches
- [ ] `dist/icons/link-directory/indiehub.svg` exists after extension build

### Trustpilot

- [ ] Sign in on Trustpilot Business; **Company profile** handoff opens `company-settings` with non-empty `extension_config`
- [ ] Step rail shows **Company settings** → **Company description** → **Contact info** (empty fields); compare lists name, domain, description, and logo
- [ ] Logo file input resolves (native `input[type=file]` or siteMedia adapter if Upload logo hides the input)
- [ ] Do not complete Save and publish or domain/business-email verification in automation; confirm ready hints cover manual steps and nofollow expectation
- [ ] After publish, proof regex and listing URL selector match a live `trustpilot.com/review/` link; confirm `rel` on website link
- [ ] `/channels/trustpilot` and `directory-integration/trustpilot.md` docs load; hub lists Trustpilot with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier, DevHunt, Nick Launches, IndieHub, AlternativeTo, StartupInspire
- [ ] `dist/icons/link-directory/trustpilot.svg` exists after extension build
- [ ] `pnpm --filter @openquok/browser-extension test` — `trustpilotFormSelectors.test.ts` passes

### StartupInspire

- [ ] Sign in on startupinspire.com; **Starter launch** handoff opens `dashboard/startup/create` with non-empty `extension_config`
- [ ] **Free listing** handoff opens `pricing`; member continues to free tier or create form when ready
- [ ] Step rail shows **Create startup** → **Social & launch** (empty manual step); compare lists name, headline, description, website, logo, and technology
- [ ] Do not complete Starter checkout, reCAPTCHA, or final publish in automation; confirm ready hints cover manual steps
- [ ] After publish, proof regex and listing URL selector match a live `startupinspire.com/startup/` link; confirm `rel` on website button
- [ ] `/channels/startupinspire` and `directory-integration/startupinspire.md` docs load; hub lists StartupInspire with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier, DevHunt, Nick Launches, IndieHub, AlternativeTo, Trustpilot
- [ ] `dist/icons/link-directory/startupinspire.svg` exists after extension build

### AlternativeTo

- [ ] Sign in on alternativeto.net with verified email; **Free listing** handoff opens `manage-item` with non-empty `extension_config`
- [ ] Step rail shows **Main info** → **Tags** → **Platforms** → **Company / Author** → **Pricing / license** → **Media**; compare lists mapped profile fields
- [ ] Platform checkboxes match `alternativeto_platforms` catalog; license select matches `alternativeto_license`
- [ ] **Priority review** and **We finish it** destinations share the same form; ready hints mention $15 / $29 upsell after submit (checkout manual)
- [ ] **User profile** handoff opens `user/edit`; X, GitHub, Instagram, and YouTube fill as handles; LinkedIn keeps full URL
- [ ] Do not complete Stripe upsell or final Submit in automation; confirm manual fields in ready hints
- [ ] After publish, proof regex and listing URL selector match a live `alternativeto.net/software/` link
- [ ] `/channels/alternativeto` and `directory-integration/alternativeto.md` docs load; hub lists AlternativeTo with PeerPush, Uneed, Open Launch, TinyLaunch, Fazier, DevHunt, Nick Launches, IndieHub
- [ ] `dist/icons/link-directory/alternativeto.svg` exists after extension build

### TinyLaunch

- [ ] Sign in on tinylaunch.com; handoff opens Premium start URL with non-empty `extension_config`
- [ ] Step rail shows **Create startup**; compare lists name, tagline, logo, gallery, website, description, category
- [ ] Category select options match `tinylaunch` catalog labels
- [ ] Standard destination opens pricing URL; compare config matches Premium minus `readyUrlHint`
- [ ] After publish, proof regex `/dashboard/startups/` and listing URL selector match a live startup link
- [ ] `/channels/tinylaunch` and `directory-integration/tinylaunch` docs load; hub lists TinyLaunch with PeerPush, Uneed, Open Launch

### Regression peers (spot-check one variant each)

- [ ] Uneed paid or join line handoff
- [ ] PeerPush Standard or free queue handoff
- [ ] Open Launch premium or free queue handoff

---

## Related

- `extension/README.md` — build and directory launch wiring
- `web/src/content/docs/directory-integration/` — per-site operator guides
- `.cursor/rules/add-directory-integration.mdc` — PR file checklist