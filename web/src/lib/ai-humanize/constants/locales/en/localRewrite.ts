import type { HumanizeMode } from '$lib/ai-humanize/constants/config';

import { HUMANIZE_TIER1_LEXICON } from '$lib/ai-humanize/constants/locales/en/lexicon';
import { HUMANIZE_SMOKING_GUNS } from '$lib/ai-humanize/constants/locales/en/smokingGuns';
import { HUMANIZE_SWAP_TABLE } from '$lib/ai-humanize/constants/locales/en/swapTable';
import {
	HUMANIZE_NEGATIVE_PARALLELISM_RE,
	HUMANIZE_PEP_TALK_PHRASES
} from '$lib/ai-humanize/constants/locales/en/tells';
import {
	collapseWhitespace,
	dropMatchingLastSentence,
	escapeRegExp,
	flattenCurlyDoubleQuotes,
	stripEmojiBullets,
	stripMarkdownResidue,
	tidyPunctuation
} from '$lib/ai-humanize/utils/localRewriteShared';

function normalizeApostrophes(text: string): string {
	return text.replace(/\u2019/g, "'");
}

function preserveCase(original: string, replacement: string): string {
	if (!replacement) return '';
	if (original.length > 1 && original === original.toUpperCase()) {
		return replacement.toUpperCase();
	}
	const first = original.charAt(0);
	if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
		return replacement.charAt(0).toUpperCase() + replacement.slice(1);
	}
	return replacement;
}

function replaceEmDashes(text: string): string {
	return text.replace(/\s*[—–]\s*/g, (_match, offset: number, full: string) => {
		const rest = full.slice(Number(offset) + _match.length).trimStart();
		return /^[A-Z]/.test(rest) ? '. ' : ', ';
	});
}

function flattenNegativeParallelism(text: string): string {
	const pattern = new RegExp(
		HUMANIZE_NEGATIVE_PARALLELISM_RE.source,
		HUMANIZE_NEGATIVE_PARALLELISM_RE.flags
	);
	return text.replace(pattern, (match, offset: number) => {
		const keepMatch = /it['\u2019]s$/i.exec(match);
		const keep = keepMatch?.[0] ?? "it's";
		const atStart = offset === 0 || /[.!?]\s*$/.test(text.slice(0, offset));
		if (atStart) return keep.charAt(0).toUpperCase() + keep.slice(1);
		return keep;
	});
}

function dropPhrase(text: string, phrase: string): string {
	const re = new RegExp(
		`(?<![A-Za-z0-9])${escapeRegExp(phrase)}(?![A-Za-z0-9])[,:;\\s]*[.!?]*`,
		'gi'
	);
	return text.replace(re, '');
}

function applySwapTable(text: string): string {
	const rows = [...HUMANIZE_SWAP_TABLE].sort((a, b) => b.flagged.length - a.flagged.length);
	let next = text;
	for (const { flagged, instead } of rows) {
		if (!instead) {
			next = dropPhrase(next, flagged);
			continue;
		}
		const re = new RegExp(`\\b${escapeRegExp(flagged)}\\b`, 'gi');
		next = next.replace(re, (matched) => preserveCase(matched, instead));
	}
	return next;
}

function replaceLexicon(text: string): string {
	const entries = [...HUMANIZE_TIER1_LEXICON].sort((a, b) => b.term.length - a.term.length);
	let next = text;
	for (const { term, simpler } of entries) {
		const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
		next = next.replace(re, (matched) => preserveCase(matched, simpler));
	}
	return next;
}

function stripSmokingGuns(text: string): string {
	let next = text;
	for (const gun of HUMANIZE_SMOKING_GUNS) {
		if (gun.pattern) {
			const re = new RegExp(
				gun.pattern.source,
				gun.pattern.flags.includes('g') ? gun.pattern.flags : `${gun.pattern.flags}g`
			);
			next = next.replace(re, '');
		}
		if (gun.phrases) {
			for (const phrase of gun.phrases) {
				next = dropPhrase(next, phrase);
			}
		}
	}
	return next;
}

function applyContractions(text: string): string {
	return text
		.replace(/\bdo not\b/gi, (m) => preserveCase(m, "don't"))
		.replace(/\bdoes not\b/gi, (m) => preserveCase(m, "doesn't"))
		.replace(/\bis not\b/gi, (m) => preserveCase(m, "isn't"))
		.replace(/\bare not\b/gi, (m) => preserveCase(m, "aren't"))
		.replace(/\bcannot\b/gi, (m) => preserveCase(m, "can't"))
		.replace(/\bwe are\b/gi, (m) => preserveCase(m, "we're"))
		.replace(/\byou are\b/gi, (m) => preserveCase(m, "you're"))
		.replace(/\bI am\b/g, "I'm");
}

function dropCoverageOpeners(text: string): string {
	return text.replace(/^\s*(?:moreover|furthermore|additionally|in addition),?\s+/i, '');
}

/**
 * Deterministic cleanup used when Chrome Rewriter is missing.
 * Human: strip stock tells. Roughen: same cleanup plus contractions; never invents facts.
 */
export function applyLocalHumanizeRewriteEn(text: string, mode: HumanizeMode): string {
	const source = (text ?? '').trim();
	if (!source) return '';

	let next = normalizeApostrophes(source);
	next = stripSmokingGuns(next);
	next = stripMarkdownResidue(next);
	next = stripEmojiBullets(next);
	next = flattenCurlyDoubleQuotes(next);
	next = replaceEmDashes(next);
	next = flattenNegativeParallelism(next);
	if (mode === 'roughen') {
		next = dropCoverageOpeners(next);
	}
	next = applySwapTable(next);
	next = replaceLexicon(next);
	next = dropMatchingLastSentence(next, HUMANIZE_PEP_TALK_PHRASES);

	if (mode === 'roughen') {
		next = applyContractions(next);
	}

	next = tidyPunctuation(next);
	next = collapseWhitespace(next);
	return next || source;
}
