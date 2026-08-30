import { HUMANIZE_REGISTER_OVERLAYS } from '$lib/ai-humanize/constants/config';
import { HUMANIZE_HUMAN_MARKERS } from '$lib/ai-humanize/constants/locales/en/humanMarkers';
import {
	HUMANIZE_TIER1_LEXICON,
	HUMANIZE_TIER1_LEXICON_BY_GROUP,
	HUMANIZE_TIER2_CLUSTER,
	HUMANIZE_TIER2_LEXICON
} from '$lib/ai-humanize/constants/locales/en/lexicon';
import { HUMANIZE_REWRITE_CONSTRAINTS } from '$lib/ai-humanize/constants/locales/en/rewriteConstraints';
import { HUMANIZE_SMOKING_GUNS } from '$lib/ai-humanize/constants/locales/en/smokingGuns';
import { HUMANIZE_SWAP_TABLE } from '$lib/ai-humanize/constants/locales/en/swapTable';
import {
	HUMANIZE_BURSTINESS_LONG_MIN_WORDS,
	HUMANIZE_BURSTINESS_SHORT_MAX_WORDS,
	HUMANIZE_TELLS
} from '$lib/ai-humanize/constants/locales/en/tells';

/**
 * Single object for tests and the Rewriter context builder.
 * Add a verb, swap, or tell in the catalog files — do not rewrite prompts.
 */
export const HUMANIZE_WRITING_GUIDE = {
	lexicon: {
		tier1: HUMANIZE_TIER1_LEXICON,
		tier1ByGroup: HUMANIZE_TIER1_LEXICON_BY_GROUP,
		tier2: HUMANIZE_TIER2_LEXICON,
		tier2Cluster: HUMANIZE_TIER2_CLUSTER
	},
	swapTable: HUMANIZE_SWAP_TABLE,
	tells: HUMANIZE_TELLS,
	smokingGuns: HUMANIZE_SMOKING_GUNS,
	humanMarkers: HUMANIZE_HUMAN_MARKERS,
	rewriteConstraints: HUMANIZE_REWRITE_CONSTRAINTS,
	burstiness: {
		shortMaxWords: HUMANIZE_BURSTINESS_SHORT_MAX_WORDS,
		longMinWords: HUMANIZE_BURSTINESS_LONG_MIN_WORDS
	},
	registers: HUMANIZE_REGISTER_OVERLAYS
} as const;

export type {
	HumanizeLexiconEntry,
	HumanizeLexiconGroupId,
	HumanizeMarkerEntry,
	HumanizeRegisterOverlay,
	HumanizeRewriteConstraint,
	HumanizeSmokingGunEntry,
	HumanizeSwapRow,
	HumanizeTellCategory,
	HumanizeTellDetectability,
	HumanizeTellEntry,
	HumanizeTier2LexiconEntry
} from '$lib/ai-humanize/constants/writingGuide.types';
