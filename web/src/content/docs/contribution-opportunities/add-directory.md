---
title: Adding a directory channel
description: Contributor guide for shipping a new directory launch destination with extension autofill in OpenQuok
order: 2
lastUpdated: 2026-11-18
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

Pick reference sites by shape:

| Pattern | Example | Notes |
| --- | --- | --- |
| Single paid submit form | PeerPush Standard | One fixture; optional free **pricing-queue** variant |
| Pricing queue + premium wizard | Open Launch, TinyLaunch | Base fixture + <Badge text="readyUrlHint: 'pricing'" variant="param" /> variant in TS |
| Multiple independent forms | Uneed | Three fixtures; composite SQL seed module |

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

**Tier order:** <Badge text="502_*_extension_configs.sql" variant="path" /> (UPDATE configs) before <Badge text="503" variant="path" />–<Badge text="506" variant="path" /> destination INSERT modules.

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
- Follow <a href="/docs/documentation-contribution">Documentation contribution</a> for MDX badges and callouts

</Steps>

## Sync scripts (when to run what)

| Script | Updates | Run when |
| --- | --- | --- |
| <Badge text="pnpm sync:auto-launch-configs" variant="default" /> | <Badge text="502_*_extension_configs.sql" variant="path" /> (UPDATE <Badge text="extension_config" variant="param" />) | Fixture step JSON changed |
| <Badge text="pnpm sync:auto-launch-destinations" variant="default" /> | <Badge text="503" variant="path" />–<Badge text="506" variant="path" /> INSERT modules | <Badge text="destinationSeeds.ts" variant="path" /> or embedded config on INSERT changed |
| <Badge text="pnpm sync:auto-launch-*:check" variant="default" /> | CI / pre-PR | Ensures SQL matches TS |

Source of truth for destination **rows** is <Badge text="destinationSeeds.ts" variant="path" />; for **extension_config** shape is <Badge text="sites/*/config.ts" variant="path" />.

## Reference implementations

<CardGrid>
<LinkCard title="PeerPush" description="Standard launch + free pricing queue" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join line, paid launch, maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Open Launch" description="Premium wizard + free queue" href="/docs/directory-integration/open-launch" />
<LinkCard title="TinyLaunch" description="Premium create-startup + Standard pricing queue" href="/docs/directory-integration/tinylaunch" />
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
</CardGrid>