# feat(ai-humanize): Thai language support for the Humanizer

## Motivation

Thai AI-written content has exploded: local LLM wrappers, chat-generated social
posts, and marketing copy are now routinely drafted in Thai. Those drafts carry
the same machine tells as English ones — stock openers ("ในยุคดิจิทัล…"),
grandiose verbs ("ปฏิวัติวงการ"), signposted conclusions ("โดยสรุป…"), pep-talk
closers — plus Thai-specific habits like stiff translated phrasing and the
"ไม่ใช่ X แต่คือ Y" negative-parallelism pattern. The Humanizer currently only
ships English catalogs, so Thai users get no local cleanup and the Rewriter
path steers output toward English defaults.

This PR adds a **locale layer** on top of the existing engine instead of
touching any EN file's behavior.

## Architecture

- `utils/localeDetect.ts` (new) — measures the share of `\u0E00-\u0E7F`
  characters among non-whitespace chars; >20% routes a draft to `'th'`,
  everything else (including empty input) keeps `'en'`.
- `utils/localRewrite.ts` — dispatches at the top of
  `applyLocalHumanizeRewrite`; the EN pipeline below is byte-for-byte
  unchanged. The Thai branch reuses shared steps (markdown/emoji/quote
  cleanup) and swaps in the th catalogs:
  - swap table + lexicon applied as literal substring replacement
    (Thai has no word boundaries → no `\b`, and no `preserveCase` since the
    script has no capitalization), longest-flagged-first;
  - em dash → comma (the uppercase-start heuristic is meaningless in Thai);
  - "ไม่ใช่ X แต่คือ Y" flattened to "…คือ Y";
  - conclusion/prompt-echo/fractal-summary phrases dropped inline; pep-talk
    endings drop the last sentence, or just the phrase for single-sentence
    drafts.
- Rewriter path (`buildCreateOptions.ts`) — accepts `text` (auto-detect) or an
  explicit `locale`. Thai sessions get
  `expectedInputLanguages: ['th','en']`, `outputLanguage: 'th'`, and a Thai
  instruction block in `sharedContext` demanding natural Thai output without
  stock clichés; session cache keys diverge automatically.
- UI (`AiHumanizeModal.svelte`) — presentation-only locale from ordered
  `navigator.languages` (`th*` wins if it appears before `en*`). Thai mode
  labels/descriptions (`HUMANIZE_MODE_OPTIONS_TH`) and section copy
  (`HUMANIZE_UI_COPY`); rewrite behavior still follows the draft text itself.
- Phase-1 catalogs (`lexicon-th.ts`, `tells-th.ts`, `swapTable-th.ts`) are
  already type-safe against `writingGuide.types.ts`.

EN behavior is regression-guarded by the untouched original tests.

## Test coverage

`cd web && npx vitest run src/lib/ai-humanize` → **69 passing** (42 pre-existing + 27 new):

| Suite | New | Covers |
| --- | --- | --- |
| `localeDetect.test.ts` | 6 | threshold, mixed-script routing, empty input |
| `localRewrite.th.test.ts` | 12 | em dash, Thai swaps, negative parallelism, pep talk (multi/single sentence), signpost/echo drops, smoking guns, embedded brand names untouched, mode parity |
| `buildCreateOptions.test.ts` (+4) | 4 | th language options, explicit override, en default untouched, distinct cache key |
| `uiLocale.test.ts` | 5 | detection order, TH rows, copy map |

Fixtures use real Thai AI-stock sentences ("ในยุคดิจิทัล…", "ปฏิวัติวงการ…",
"โดยสรุป…", "ไม่ใช่ X แต่คือ Y"). Typecheck adds zero new errors.

## Out of scope / follow-ups

- `auditTells` still counts EN patterns only; countable Thai auditing is a
  natural next step.
- Secondary modal actions (Close/Rewrite/Copy…) remain EN; this PR covers the
  mode toggle, descriptions, section headers, and chips.

Thai-support docs: `web/src/lib/ai-humanize/README-th.md`.

---

Developed by SoloCorp OS 2.4
