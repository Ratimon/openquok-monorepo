---
title: Adding a Humanizer language
description: Contributor guide for adding a Humanizer locale to OpenQuok — detection, catalogs, local rewrite, UI copy, and tests.
order: 2
lastUpdated: 2026-08-30
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

This guide lives under **Contribution opportunities** — scoped product work open to contributors.

The OpenQuok **Humanizer** (<Badge text="/tools/humanizer" variant="path" />) rewrites social drafts so they read less AI-written. 

Adding another language means extending the locale folder under <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/"><Badge text="web/src/lib/ai-humanize/constants/locales/" variant="path" /></DocsExternalLink>.

```text
web/src/lib/ai-humanize/constants/locales/
  types.ts           # HumanizeLocale union — extend when adding a locale
  index.ts           # HUMANIZE_UI_COPY aggregate + re-exports
  en/                # English catalogs + localRewrite + ui + sharedContext
  th/                # Thai catalogs + localRewrite + ui + rewriterContext
```

## What you add per locale

| Topic | What contributors add |
| --- | --- |
| Detection | Extend <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/localeDetect.ts"><Badge text="localeDetect.ts" variant="path" /></DocsExternalLink> — script ratio, regex, or threshold so mixed drafts route correctly |
| Catalogs | <Badge text="lexicon.ts" variant="path" />, <Badge text="tells.ts" variant="path" />, <Badge text="swapTable.ts" variant="path" />, <Badge text="smokingGuns.ts" variant="path" /> under <Badge text="locales/&lt;code&gt;/" variant="path" /> |
| Local rewrite | <Badge text="locales/&lt;code&gt;/localRewrite.ts" variant="path" /> + co-located <Badge text="localRewrite.test.ts" variant="path" /> |
| Rewriter path | <Badge text="locales/&lt;code&gt;/rewriterContext.ts" variant="path" /> (or reuse EN <Badge text="sharedContext.ts" variant="path" /> when appropriate) + wire in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/buildCreateOptions.ts"><Badge text="buildCreateOptions.ts" variant="path" /></DocsExternalLink> |
| UI labels | <Badge text="locales/&lt;code&gt;/ui.ts" variant="path" /> + register in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/uiLocale.ts"><Badge text="uiLocale.ts" variant="path" /></DocsExternalLink> and <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/index.ts"><Badge text="locales/index.ts" variant="path" /></DocsExternalLink> |
| Router | Branch in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/localRewrite.ts"><Badge text="localRewrite.ts" variant="path" /></DocsExternalLink> so the new locale runs its cleanup function |
| Tests | <Badge text="cd web && pnpm exec vitest run src/lib/ai-humanize" variant="path" /> |

English-only modules today (do not duplicate unless the locale needs them): <Badge text="humanMarkers.ts" variant="path" />, <Badge text="registers.ts" variant="path" />, <Badge text="rewriteConstraints.ts" variant="path" />, <Badge text="writingGuide.ts" variant="path" /> under <Badge text="locales/en/" variant="path" />. Thai ships a slimmer barrel via <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/th/index.ts"><Badge text="th/index.ts" variant="path" /></DocsExternalLink>.

<Callout type="warning" title="Out of scope for a locale PR">
<p><Badge text="auditTells" variant="param" /> (<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/auditTells.ts"><Badge text="auditTells.ts" variant="path" /></DocsExternalLink>) still reads EN catalogs only — localized tell chips are a follow-up. Full Humanizer modal i18n beyond the strings in <Badge text="ui.ts" variant="path" /> is optional.</p>
</Callout>

## Contributor checklist

<Steps
	howToName="Add a Humanizer locale"
	howToDescription="Extend OpenQuok Humanizer with a new rewrite locale — catalogs, detection, UI copy, and tests."
>

### Extend the locale type

Add your ISO-style code to <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/types.ts"><Badge text="types.ts" variant="path" /></DocsExternalLink>:

```typescript
export type HumanizeLocale = 'en' | 'th' | 'xx';
```

Use a short stable slug (`th`, not `th-TH`) — the same value appears in detection, Rewriter language tags, and folder names.

### Add detection

Update <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/localeDetect.ts"><Badge text="localeDetect.ts" variant="path" /></DocsExternalLink> so <Badge text="detectHumanizeLocale()" variant="param" /> returns your code when the draft matches.

Thai uses a <strong>script-ratio</strong> heuristic: more than 20% of non-whitespace characters in the Thai Unicode block (<Badge text="\u0E00-\u0E7F" variant="param" />) routes to <Badge text="th" variant="param" />. Mixed Thai/English brand names stay on the Thai path without sending mostly-English posts through Thai catalogs.

For a new script, prefer a measurable rule (ratio, dominant script, or a small set of locale-specific markers) and export a named threshold constant with unit tests.

### Create the locale folder and catalogs

Add <Badge text="web/src/lib/ai-humanize/constants/locales/&lt;code&gt;/" variant="path" /> mirroring Thai:

| File | Purpose |
| --- | --- |
| <Badge text="lexicon.ts" variant="path" /> | Tier-1/tier-2 stock wording → plainer stand-ins for local rewrite |
| <Badge text="tells.ts" variant="path" /> | Opener phrases, pep-talk endings, negative parallelism patterns, etc. |
| <Badge text="swapTable.ts" variant="path" /> | Phrase-level replacements (order matters — longer phrases first) |
| <Badge text="smokingGuns.ts" variant="path" /> | High-confidence stock openers to strip entirely |
| <Badge text="index.ts" variant="path" /> | Re-export the modules above (plus <Badge text="rewriterContext.ts" variant="path" /> / <Badge text="ui.ts" variant="path" />) |

Copy structure and naming from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/th/"><Badge text="locales/th/" variant="path" /></DocsExternalLink>. Entries use shared types from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/writingGuide.types.ts"><Badge text="writingGuide.types.ts" variant="path" /></DocsExternalLink>.

<Callout type="tip" title="Script-aware matching">
<p>English local rewrite uses word-boundary guards; Thai uses <strong>substring</strong> matching because words are not space-delimited. Match the strategy your language needs in <Badge text="localRewrite.ts" variant="path" />.</p>
</Callout>

### Implement local rewrite + tests

Add <Badge text="localRewrite.ts" variant="path" /> exporting <Badge text="applyLocalHumanizeRewriteXx()" variant="param" /> (follow the <Badge text="applyLocalHumanizeRewriteTh" variant="param" /> / <Badge text="applyLocalHumanizeRewriteEn" variant="param" /> pattern).

Co-locate <Badge text="localRewrite.test.ts" variant="path" /> with realistic before/after sentences: em-dash cleanup, tier-1 swaps, swap-table rows, smoking-gun drops. Thai tests live beside the locale file; English coverage is in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/localRewrite.test.ts"><Badge text="utils/localRewrite.test.ts" variant="path" /></DocsExternalLink>.

Wire the router in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/localRewrite.ts"><Badge text="utils/localRewrite.ts" variant="path" /></DocsExternalLink>:

```typescript
return detectHumanizeLocale(source) === 'xx'
  ? applyLocalHumanizeRewriteXx(source)
  : detectHumanizeLocale(source) === 'th'
    ? applyLocalHumanizeRewriteTh(source)
    : applyLocalHumanizeRewriteEn(source, mode);
```

(Use a clear dispatch — switch or a small map — rather than a long ternary chain when you add a third locale.)

### Wire Rewriter language settings

Add <Badge text="rewriterContext.ts" variant="path" /> with a compact instruction block (see Thai <Badge text="COMPOSER_HUMANIZE_TH_LANGUAGE_CONTEXT" variant="param" />). Update <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/buildCreateOptions.ts"><Badge text="buildCreateOptions.ts" variant="path" /></DocsExternalLink>:

- <Badge text="rewriterLanguagesFor()" variant="param" /> — set <Badge text="expectedInputLanguages" variant="param" />, <Badge text="expectedContextLanguages" variant="param" />, and <Badge text="outputLanguage" variant="param" /> for on-device Rewriter.
- <Badge text="buildComposerHumanizeSharedContext()" variant="param" /> — append your language context when the rewrite locale matches.

English keeps using <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/en/sharedContext.ts"><Badge text="en/sharedContext.ts" variant="path" /></DocsExternalLink> for Human and Roughen preambles.

### Add UI copy

Create <Badge text="ui.ts" variant="path" /> with <Badge text="HUMANIZE_MODE_OPTIONS" variant="param" /> and <Badge text="HUMANIZE_UI_COPY" variant="param" /> (same keys as English — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/en/ui.ts"><Badge text="en/ui.ts" variant="path" /></DocsExternalLink>).

Register in:

- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/constants/locales/index.ts"><Badge text="locales/index.ts" variant="path" /></DocsExternalLink> — import UI copy and add to <Badge text="HUMANIZE_UI_COPY" variant="param" />.
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/ai-humanize/utils/uiLocale.ts"><Badge text="uiLocale.ts" variant="path" /></DocsExternalLink> — map browser language tags (e.g. <Badge text="th*" variant="param" /> → <Badge text="th" variant="param" />) in <Badge text="detectHumanizeUiLocale()" variant="param" />, <Badge text="humanizeModeOptionsFor()" variant="param" />, and <Badge text="humanizeUiCopyFor()" variant="param" />.

### Run tests and open a PR

```bash
cd web && pnpm exec vitest run src/lib/ai-humanize
```

Follow <a href="/docs/developer-guidelines/submit-a-pr">Submit a pull request</a> for fork/branch workflow. Keep copy neutral — no third-party project names in code or docs.

</Steps>

## PR review prompts

Before opening a PR, confirm:

- <Badge text="HumanizeLocale" variant="param" /> extended; detection has tests for edge cases (empty draft, mixed scripts, mostly-English with a few foreign words).
- Catalogs cover realistic AI-stock phrasing for the target language; local rewrite tests assert concrete before/after strings.
- <Badge text="buildCreateOptions.ts" variant="path" /> sets Rewriter languages and shared context for the new locale.
- <Badge text="ui.ts" variant="path" /> registered; browser tag mapping documented in a short comment if non-obvious.
- <Badge text="utils/localRewrite.ts" variant="path" /> dispatches to the new cleanup function.
- No secrets or third-party attribution in comments or docs (repo neutrality rule).

## Related

<CardGrid>
<LinkCard title="Contribution opportunities" description="Other scoped product tasks for external contributors" href="/docs/contribution-opportunities" />
<LinkCard title="Submit a pull request" description="Fork the repo, run checks locally, and open a code PR on GitHub" href="/docs/developer-guidelines/submit-a-pr" />
<LinkCard title="Humanizer tool" description="Try the guest composer and channel-specific pages" href="/tools/humanizer" />
</CardGrid>
