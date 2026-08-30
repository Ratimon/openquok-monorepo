/**
 * Locale layer for the Humanizer.
 *
 * Detects whether a draft is written in Thai by measuring the share of
 * Thai-block characters (\u0E00-\u0E7F) among all non-whitespace characters.
 * Thai AI-written drafts routinely mix in English brand names and loanwords,
 * so a 20% threshold keeps mixed posts on the Thai path without routing
 * mostly-English text through the Thai catalogs.
 */

import type { HumanizeLocale } from '$lib/ai-humanize/constants/locales/types';

export type { HumanizeLocale };

/** Any code point in the Thai Unicode block. */
const THAI_CHAR_RE = /[\u0E00-\u0E7F]/;

/**
 * Minimum Thai-character ratio for a draft to be treated as Thai.
 * Strictly greater-than, matching "more than a fifth of the characters".
 */
export const HUMANIZE_THAI_DETECT_THRESHOLD = 0.2;

function countMatches(text: string, test: (ch: string) => boolean): number {
	let count = 0;
	for (const ch of text) {
		if (test(ch)) count += 1;
	}
	return count;
}

/**
 * Share of Thai-block characters among non-whitespace characters.
 * Returns 0 for empty/whitespace-only input.
 */
export function thaiCharRatio(text: string): number {
	const source = text ?? '';
	const total = countMatches(source, (ch) => !/\s/.test(ch));
	if (total === 0) return 0;
	const thai = countMatches(source, (ch) => THAI_CHAR_RE.test(ch));
	return thai / total;
}

/** True when more than {@link HUMANIZE_THAI_DETECT_THRESHOLD} of the characters are Thai. */
export function isThaiText(text: string): boolean {
	return thaiCharRatio(text ?? '') > HUMANIZE_THAI_DETECT_THRESHOLD;
}

/**
 * Picks the rewrite-engine locale for a draft. Defaults to `'en'` so the
 * original English pipeline behavior is unchanged for every non-Thai input,
 * including empty strings.
 */
export function detectHumanizeLocale(text: string): HumanizeLocale {
	return isThaiText(text) ? 'th' : 'en';
}
