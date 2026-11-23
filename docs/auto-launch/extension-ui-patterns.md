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

**Site count for smoke:** **6** directory sites (12 provider variants total).

Picker groups: TinyLaunch, Open Launch, Fazier, and DevHunt group variants under one Add Channel tile per site (`picker_group_key` = site slug).

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

## Manual smoke checklist

Run after changing fixtures, extension manifests, or marketing tiles. Use a dev workspace with the extension loaded from `extension/dist`.

### All sites (6)

- [ ] `pnpm --filter openquok-common test:unit` (includes destination config drift tests)
- [ ] `pnpm sync:auto-launch-configs:check` and `pnpm sync:auto-launch-destinations:check`
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