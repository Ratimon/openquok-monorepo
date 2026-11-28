---
title: Adding a directory channel
description: Contributor guide for shipping a new directory launch destination with extension autofill in OpenQuok
order: 2
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';

const directoryContribPaths = {
	linkDirectoryIcon: '/icons/link-directory/{slug}.svg',
	channelsSlug: '/channels/{slug}',
	pricingQueueFixture: "{ ...base, readyUrlHint: 'pricing' }",
	providerSlugFormat: '{site}-{variant}'
};
</script>

## Overview

A **directory channel** is not a social <Badge text="SocialProvider" variant="default" />. Members keep a **product profile** in OpenQuok, open the directory site in Chrome, and use the <a href="/docs/installation/chrome-extension">browser extension</a> to autofill forms. OpenQuok does not submit listings on their behalf.

Each shipped destination is one **provider slug** (for example <Badge text="peerpush-standard-launch" variant="default" />) with:

- Rows in <Badge text="auto_launch_destinations" variant="param" /> (start URL, published flag, optional link-directory opportunity)
- Typed <Badge text="extension_config" variant="param" /> JSON (steps, fields, selectors, proof rules)
- Extension content scripts + side panel handoff

Pick reference sites by shape (see also <a href="/docs/directory-integration">Directory integration</a> and the reference cards at the bottom of this page):

| Pattern | Example sites | Notes |
| --- | --- | --- |
| Single paid submit form | PeerPush Standard, DevHunt paid launch, IndieHub Basic / Pro | One fixture per path; optional free **pricing-queue** sibling |
| Pricing queue + premium wizard | Open Launch, TinyLaunch, Nick Launches, StartupInspire | Base fixture + <Badge text="readyUrlHint: 'pricing'" variant="param" /> variant in TS |
| Multiple independent forms | Uneed, Fazier, AlternativeTo, Nick Launches | Separate fixtures per form; composite SQL when seeds share one module |
| Profile or listing wizard (single path) | Trustpilot company profile | Often one provider slug; verify business email on the live site |

<Callout type="note">
<p><strong>Convention reference:</strong> Use <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/.cursor/rules/add-directory-integration.mdc"><Badge text=".cursor/rules/add-directory-integration.mdc" variant="path" /></DocsExternalLink> as the file-level checklist and <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/docs/auto-launch/extension-ui-patterns.md"><Badge text="docs/auto-launch/extension-ui-patterns.md" variant="path" /></DocsExternalLink> for field mapping and manual smoke.</p>
</Callout>

## Identifier contract

| Concept | Format | Must align across |
| --- | --- | --- |
| **Site slug** | kebab-case (`peerpush`, `tinylaunch`) | Link-directory catalog, <Badge text={directoryContribPaths.linkDirectoryIcon} variant="path" />, Add Channel tiles |
| **Opportunity slug** | per tier (`standard-launch`, `premium-launch`) | <Badge text="link_directory_opportunities.slug" variant="param" /> |
| **Provider slug** | <code>{directoryContribPaths.providerSlugFormat}</code> | DB, <Badge text="destination-configs" variant="path" />, extension registration, tests |

Wire opportunities with <Badge text="auto_launch_enabled" variant="param" /> and <Badge text="auto_launch_provider_slug" variant="param" />. Use <Badge text="picker_group_key" variant="param" /> when one Add Channel card exposes multiple variants.

## End-to-end flow

1. Member chooses a destination on **My Products** or the extension **Directory** tab.
2. Backend <Badge text="POST /api/v1/auto-launch/submissions/intent" variant="path" /> returns <Badge text="startUrl" variant="param" />, launch token, and <Badge text="extension_config" variant="param" />.
3. Extension opens the directory tab and shows the on-page step rail (fill / compare).
4. Member edits and **submits on the directory site**, then marks complete in OpenQuok.

<Callout type="warning" title="Not social OAuth">
<p>Do not add <Badge text="backend/integrations/providers/*" variant="path" /> entries or social composer tiles for directory-only launches. Directory connect is extension + product profile — see <a href="/docs/platforms">Platforms</a> → Directory launch.</p>
</Callout>

## Contributor checklist

<Steps
	howToName="How to add a directory channel"
	howToDescription="Ship catalog rows, auto-launch seeds, TypeScript fixtures, and extension autofill for a new directory site"
>

### 1. Catalog and migrations

Add link-directory **site + opportunities** (SQL under <Badge text="backend/supabase/db/link-directory/" variant="path" /> or hub catalog backfill JSON when the site is catalog-only — see existing TinyLaunch wiring).

Register **auto-launch destination rows** in <Badge text="common/src/auto-launch/destination-configs/destinationSeeds.ts" variant="path" /> (next tier-<Badge text="507+" variant="param" /> SQL filename, stable destination UUIDs, <Badge text="start_url" variant="param" />, opportunity slug).

Run code generation — **do not hand-edit** generated JSON blobs:

```bash
pnpm common:build
pnpm sync:auto-launch-configs
pnpm sync:auto-launch-destinations
pnpm backend:db:aggregate-migrations-all
```

Apply migrations on your local Supabase so <Badge text="provider_slug" variant="param" /> resolves (extension side panel “destination not found” usually means the row is missing locally).

**Catalog-only sites** (TinyLaunch, Fazier, …): opportunities are not re-inserted on <Badge text="supabase db reset" variant="default" /> — run the local backfill **after** reset (see <a href="#rollout-local-and-production">Rollout</a>).

**Tier order:** <Badge text="502_*_extension_configs.sql" variant="path" /> (UPDATE configs) before <Badge text="503" variant="path" />–<Badge text="507+" variant="path" /> destination INSERT modules.

### 2. TypeScript fixtures (`destination-configs`)

Per site under <Badge text="common/src/auto-launch/destination-configs/sites/<site>/" variant="path" />:

| File | Purpose |
| --- | --- |
| <Badge text="config.ts" variant="path" /> | <Badge text="*_EXTENSION_CONFIG" variant="param" /> fixtures, <Badge text="*_DIRECTORY_LAUNCH_PROVIDERS" variant="param" /> (`hostPatterns`, `contentScriptEntry`, `defaultStartUrl`) |
| <Badge text="sync.ts" variant="path" /> | <Badge text="pricing-queue" variant="param" /> vs <Badge text="independent" variant="param" /> derivation rules |
| <Badge text="catalog.test.ts" variant="path" /> | Official category/tag/select labels when the form uses catalogs |

Register in <Badge text="destination-configs/index.ts" variant="path" /> (<Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" />), <Badge text="directoryLaunchRegistry.ts" variant="path" />, and <Badge text="fieldCatalogRegistry.ts" variant="path" /> when fields use catalogs.

**Pricing-queue variant:** second slug’s fixture = <Badge text={directoryContribPaths.pricingQueueFixture} variant="param" />; destination <Badge text="start_url" variant="param" /> points at pricing; validators in <Badge text="extensionConfigDerivation.ts" variant="path" /> enforce parity.

### 3. Browser extension

- Thin entry: <Badge text="extension/src/content/directory-launch/<site>-host.ts" variant="path" /> → <Badge text="registerDirectoryLaunchProvider('…')" variant="param" />
- <Badge text="extension/scripts/build-extension.mjs" variant="path" /> + <Badge text="extension/manifest.json" variant="path" /> `content_scripts` and `host_permissions`
- Site login adapter: <Badge text="extension/src/directory/directory-launch/siteLogin/<site>.ts" variant="path" /> + register in <Badge text="detectDirectorySiteLogin.ts" variant="path" />
- Extend <Badge text="readFormField.ts" variant="path" /> / <Badge text="fillEngine.ts" variant="path" /> + tests when DOM does not match existing selectors

Build: <Badge text="pnpm common:build" variant="default" /> && <Badge text="pnpm --filter @openquok/browser-extension build" variant="default" />, then load <Badge text="extension/dist/" variant="path" /> unpacked.

### 4. Web dashboard and marketing

| Action | Path |
| --- | --- |
| Logo | <Badge text="web/static/icons/link-directory/<site>.svg" variant="path" /> |
| Add Channel tiles | <Badge text="web/src/lib/auto-launch/buildDirectoryAddChannelTiles.ts" variant="path" /> |
| New <Badge text="profilePath" variant="param" /> | <Badge text="businessProfileData.ts" variant="path" />, composer validation, readiness tests |
| Operator guide | <Badge text="web/src/content/docs/directory-integration/<site>.md" variant="path" /> |
| Public channel page | landing data + <Badge text={directoryContribPaths.channelsSlug} variant="path" /> when the site is marketed |

Backend API surface is usually unchanged (<Badge text="AutoLaunchRoute" variant="path" /> already serves intents). Extend <Badge text="AutoLaunchService.unit.test.ts" variant="path" /> only when behavior changes.

### 5. Documentation (same PR)

- Update <Badge text="docs/auto-launch/extension-ui-patterns.md" variant="path" /> — destination table and smoke site count
- Add <Badge text="directory-integration/<site>.md" variant="path" /> and a <Badge text="LinkCard" variant="default" /> on <a href="/docs/directory-integration">Directory integration overview</a>
- Add <Badge text="cli-examples/<site-slug>.md" variant="path" /> and <Badge text="mcp-examples/<site-slug>.md" variant="path" /> (workflow sections only — listings, variants, SEO); append matching <Badge text="LinkCard" variant="default" /> rows on <a href="/docs/cli-examples">CLI examples overview</a> and <a href="/docs/mcp-examples">MCP examples overview</a>
- Add <Badge text="SITE_CURATED" variant="param" /> for the site in <Badge text="backend/scripts/sync-directory-launch-example-docs.mjs" variant="path" /> (<Badge text="manual" variant="param" /> on-site steps + example <Badge text="patch" variant="param" /> JSON), then run <Badge text="pnpm sync:directory-launch-example-docs" variant="default" /> so <strong>Profile fields wired to autofill</strong> (union + per-<Badge text="providerSlug" variant="param" /> tables from fixtures) is inserted into both example pages
- Extend the <strong>Reference implementations</strong> <Badge text="LinkCard" variant="default" /> grid on this page when the site is a useful contributor pattern (keep in sync with the directory-integration index)
- Follow <a href="/docs/documentation-contribution">Documentation contribution</a> for MDX badges and callouts

</Steps>

<h2 id="rollout-local-and-production">Rollout: local and production</h2>

Run these **in order** after your PR merges (or on a branch-linked staging DB). Full production context: <a href="/docs/installation/production-deployment#supabase-production-migrations">Production — Supabase migrations</a>. Catalog CLI details: <a href="/docs/admin/link-directory-catalog-backfill">Catalog backfill</a>.

<Callout type="note">
<p><strong>Catalog-only vs SQL seed:</strong> On <strong>production</strong>, if the site lives in catalog JSON only, run <strong>catalog backfill before</strong> applying the <Badge text="auto-launch/*_seed_*_destination.sql" variant="path" /> module so destination INSERTs can join <Badge text="link_directory_opportunities" variant="param" />. On <strong>local</strong> <Badge text="supabase db reset" variant="default" />, destination seeds run inside migrations first — run catalog backfill <strong>after</strong> reset; the backfill CLI then <strong>relinks</strong> <Badge text="auto_launch_destinations" variant="path" /> to hub opportunities (no second manual seed run). SQL <Badge text="link-directory/504_*_seed_<site>.sql" variant="path" /> sites get hub rows from migrations automatically.</p>
</Callout>

### Local (after `supabase db reset` or fresh clone)

From the **repo root**:

```bash
pnpm common:build
pnpm sync:auto-launch-configs
pnpm sync:auto-launch-destinations
pnpm backend:db:aggregate-migrations-all
```

From <Badge text="backend/" variant="path" />:

```bash
supabase db reset
```

**Catalog-only site** — restore hub rows (replace <Badge text="<site-slug>" variant="param" />):

```bash
pnpm backend:db:backfill-link-directory-catalog -- --dry-run --slug <site-slug>
pnpm backend:db:backfill-link-directory-catalog -- --slug <site-slug>
```

Optional dev user (skip browser signup): <Badge text="pnpm backend:db:bootstrap-local-dev-user" variant="default" /> — see <a href="/docs/admin/super-admin">First setup as super admin</a>.

Build and load the extension, then manual smoke per <Badge text="extension-ui-patterns.md" variant="path" />.

### Production — apply database changes

Use <Badge text="&lt;YYYYMMDD&gt;" variant="param" /> from the current <Badge text="backend/supabase/migrations/*_core_structure.sql" variant="path" /> filename (date segment only).

**A. Catalog-only or JSON copy change** — run **first** when the site is JSON-backed or you changed hub opportunities:

```bash
pnpm backend:db:backfill-link-directory-catalog:prod -- --dry-run --slug <site-slug>
pnpm backend:db:backfill-link-directory-catalog:prod -- --slug <site-slug> --force
```

Use <Badge text="--force" variant="param" /> when rows already exist (editorial updates). Requires <Badge text="backend/.env.production.local" variant="path" />.

**B. Destination rows + `extension_config`** — apply your site’s module, for example <Badge text="backend/supabase/db/auto-launch/507_20261120_seed_fazier_destination.sql" variant="path" /> (run the **entire file** in Supabase **SQL Editor**), **or** CLI push:

```bash
cd backend
pnpm db:production:push-db:dry-run
pnpm db:production:push-db
```

<Callout type="tip">
<p>After a manual SQL delta (Option 2), you do not need the Fazier-only block from <Badge text="502_*_extension_configs.sql" variant="path" /> if the destination seed already embedded <Badge text="extension_config" variant="param" />. Run <Badge text="pnpm sync:auto-launch-configs" variant="default" /> only when fixtures changed and you need standalone UPDATEs later.</p>
</Callout>

**C. Sync migration history** — after Option 2 (SQL Editor) or when history lags schema:

```bash
cd backend
npx supabase@latest migration repair <YYYYMMDD> --status applied --remote
pnpm db:production:migration-list
```

**D. Deploy app surfaces** when code changed (from repo root):

```bash
pnpm vercel:deploy:backend:prod
pnpm vercel:deploy:web:prod
```

Publish the <a href="/docs/installation/chrome-extension">Chrome extension</a> when content scripts or manifest hosts changed — API/DB alone does not update members’ browsers.

Hub/API cache may lag a few minutes after catalog backfill when caching is enabled; see <a href="/docs/admin/link-directory-catalog-backfill">Catalog backfill</a>.

## Sync scripts (when to run what)

| Script | Updates | Run when |
| --- | --- | --- |
| <Badge text="pnpm sync:auto-launch-configs" variant="default" /> | <Badge text="502_*_extension_configs.sql" variant="path" /> (UPDATE <Badge text="extension_config" variant="param" />) | Fixture step JSON changed |
| <Badge text="pnpm sync:auto-launch-destinations" variant="default" /> | <Badge text="503" variant="path" />–<Badge text="507+" variant="path" /> INSERT modules | <Badge text="destinationSeeds.ts" variant="path" /> or embedded config on INSERT changed |
| <Badge text="pnpm backend:db:backfill-link-directory-catalog" variant="default" /> | Hub <Badge text="link_directory_*" variant="param" /> rows from JSON; relinks <Badge text="auto_launch_destinations" variant="path" /> | Local after reset; catalog-only sites |
| <Badge text="pnpm backend:db:backfill-link-directory-catalog:prod" variant="default" /> | Same against production | **Before** destination SQL when opportunities must exist |
| <Badge text="pnpm sync:auto-launch-*:check" variant="default" /> | CI / pre-PR | Ensures SQL matches TS |
| <Badge text="pnpm sync:directory-launch-example-docs" variant="default" /> | <Badge text="cli-examples/<site>.md" variant="path" /> + <Badge text="mcp-examples/<site>.md" variant="path" /> field sections | After fixture or <Badge text="SITE_CURATED" variant="param" /> changes |
| <Badge text="pnpm sync:directory-launch-example-docs:check" variant="default" /> | CI via <Badge text="destination-configs.test.ts" variant="path" /> | Example docs match fixtures |

Source of truth for destination **rows** is <Badge text="destinationSeeds.ts" variant="path" />; for **extension_config** shape is <Badge text="sites/*/config.ts" variant="path" />; for CLI/MCP **profilePath** badges is <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> (generated sections).

## Reference implementations

Operator guides, CLI recipes, and MCP prompts share the same **site slug** (for example <Badge text="devhunt" variant="default" />) in paths under <Badge text="directory-integration/" variant="path" />, <Badge text="cli-examples/" variant="path" />, and <Badge text="mcp-examples/" variant="path" />.

<CardGrid>
<LinkCard title="PeerPush" description="Standard launch and free queue — profile fields and public landing" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Open Launch" description="Premium launch and free queue — tech stack, extension wizard autofill" href="/docs/directory-integration/open-launch" />
<LinkCard title="TinyLaunch" description="Premium and Standard create-startup — category catalog, pledge manual" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Fazier" description="Company page wizard and product launch — badge and tier steps manual" href="/docs/directory-integration/fazier" />
<LinkCard title="DevHunt" description="Free listing and paid launch week — developer tools, screenshots, manual checkout" href="/docs/directory-integration/devhunt" />
<LinkCard title="Nick Launches" description="Free launch, paid tiers, and maker profile — categories, badge, manual plan checkout" href="/docs/directory-integration/nick-launches" />
<LinkCard title="IndieHub" description="Basic and Pro paid listings — submit wizard step 1 autofill, manual payment and publish" href="/docs/directory-integration/indiehub" />
<LinkCard title="AlternativeTo" description="Free listing, paid review tiers, and user profile — manage-item autofill" href="/docs/directory-integration/alternativeto" />
<LinkCard title="Trustpilot" description="Company profile on Trustpilot Business — settings autofill, business email verify, nofollow" href="/docs/directory-integration/trustpilot" />
<LinkCard title="StartupInspire" description="Free listing and Starter launch — create form autofill, manual checkout, dofollow verify" href="/docs/directory-integration/startupinspire" />
</CardGrid>

## Verification before PR

- <Badge text="pnpm --filter openquok-common test:unit" variant="default" /> (includes <Badge text="destination-configs.test.ts" variant="path" /> sync <Badge text="--check" variant="param" />)
- <Badge text="pnpm --filter @openquok/browser-extension test" variant="default" /> when extension fill/read logic changed
- Manual smoke per <Badge text="extension-ui-patterns.md" variant="path" /> — sign in on extension, pick channel avatar, handoff, fill on live site
- No secrets or third-party project names in comments (source neutrality)
- Do not edit aggregated <Badge text="*_core_structure.sql" variant="path" /> directly

## Related

<CardGrid>
<LinkCard title="Directory submission" description="End-user workflow from My Products" href="/docs/directory-submission" />
<LinkCard title="Directory integration (operators)" description="Per-site operator guides for self-host" href="/docs/directory-integration" />
<LinkCard title="Adding a social provider" description="OAuth / credentials / extension social channels — different path" href="/docs/contribution-opportunities/add-provider" />
<LinkCard title="Submit a pull request" description="Fork, checks, and GitHub PR workflow" href="/docs/developer-guidelines/submit-a-pr" />
<LinkCard title="Catalog backfill (operators)" description="JSON hub destinations and prod flags" href="/docs/admin/link-directory-catalog-backfill" />
<LinkCard title="Production deployment" description="Vercel, workers, Supabase push vs SQL Editor" href="/docs/installation/production-deployment" />
</CardGrid>