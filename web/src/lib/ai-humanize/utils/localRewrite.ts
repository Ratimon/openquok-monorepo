import type { HumanizeMode } from '$lib/ai-humanize/constants/config';

import { HUMANIZE_TIER1_LEXICON } from '$lib/ai-humanize/constants/lexicon';
import { HUMANIZE_TIER1_LEXICON_TH } from '$lib/ai-humanize/constants/lexicon-th';
import { HUMANIZE_SMOKING_GUNS } from '$lib/ai-humanize/constants/smokingGuns';
import { HUMANIZE_SMOKING_GUNS_TH } from '$lib/ai-humanize/constants/tells-th';
import { HUMANIZE_SWAP_TABLE } from '$lib/ai-humanize/constants/swapTable';
import { HUMANIZE_SWAP_TABLE_TH } from '$lib/ai-humanize/constants/swapTable-th';
import {
	HUMANIZE_CURLY_DOUBLE_QUOTE_RE,
	HUMANIZE_EMOJI_BULLET_RE,
	HUMANIZE_MARKDOWN_FENCE_RE,
	HUMANIZE_MARKDOWN_HEADING_RE,
	HUMANIZE_NEGATIVE_PARALLELISM_RE,
	HUMANIZE_PEP_TALK_PHRASES
} from '$lib/ai-humanize/constants/tells';
import {
	HUMANIZE_CONCLUSION_PHRASES_TH,
	HUMANIZE_FRACTAL_SUMMARY_PHRASES_TH,
	HUMANIZE_NEGATIVE_PARALLELISM_TH_RE,
	HUMANIZE_PEP_TALK_PHRASES_TH,
	HUMANIZE_PROMPT_ECHO_PHRASES_TH
} from '$lib/ai-humanize/constants/tells-th';

import { detectHumanizeLocale } from '$lib/ai-humanize/utils/localeDetect';

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

function stripMarkdownResidue(text: string): string {
	let next = text.replace(new RegExp(HUMANIZE_MARKDOWN_FENCE_RE.source, 'g'), '');
	next = next.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
	next = next.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
	next = next.replace(
		new RegExp(HUMANIZE_MARKDOWN_HEADING_RE.source, HUMANIZE_MARKDOWN_HEADING_RE.flags),
		''
	);
	next = next.replace(/`([^`]+)`/g, '$1');
	return next;
}

function stripEmojiBullets(text: string): string {
	return text.replace(
		new RegExp(HUMANIZE_EMOJI_BULLET_RE.source, HUMANIZE_EMOJI_BULLET_RE.flags),
		''
	);
}

function flattenCurlyDoubleQuotes(text: string): string {
	return text.replace(new RegExp(HUMANIZE_CURLY_DOUBLE_QUOTE_RE.source, 'g'), '"');
}

function splitSentences(text: string): string[] {
	const parts = text.match(/[^.!?]+[.!?]*\s*/g);
	if (!parts) return text.trim() ? [text] : [];
	return parts.map((part) => part.trim()).filter(Boolean);
}

function dropMatchingLastSentence(text: string, phrases: readonly string[]): string {
	const sentences = splitSentences(text);
	if (sentences.length === 0) return text;
	const last = sentences[sentences.length - 1]!.toLowerCase();
	const matches = phrases.some((phrase) => last.includes(phrase));
	if (!matches) return text.trim();
	return sentences.slice(0, -1).join(' ').trim();
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

function tidyPunctuation(text: string): string {
	return text
		.replace(/\.\s*,\s*/g, '. ')
		.replace(/!\s*,\s*/g, '! ')
		.replace(/\?\s*,\s*/g, '? ')
		.replace(/^[,\s;:]+/gm, '')
		.replace(/\s+,/g, ',')
		.replace(/,(?:,|\s)*,/g, ',');
}

function collapseWhitespace(text: string): string {
	return text.replace(/[ 	]+\n/g, '\n').replace(/[ 	]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/* ------------------------------------------------------------------ */
/* Thai (th) pipeline — locale layer on top of the EN engine.          */
/* ภาษาไทยไม่มี word boundary และไม่มี capitalization                  */
/* ------------------------------------------------------------------ */

/**
 * Substring drop without word boundaries — Thai words run together, so
 * `(?<![A-Za-z0-9])…(?![A-Za-z0-9])` guards from {@link dropPhrase} would
 * never match. Also eats surrounding spaces/punctuation left behind.
 */
function dropPhraseSubstr(text: string, phrase: string): string {
	const re = new RegExp(`${escapeRegExp(phrase)}[\\s]*[.!?]*[\\s]*`, 'g');
	return text.replace(re, '');
}

/** Em dash → จุด/จุลภาค. No capitalization heuristic exists in Thai. */
function replaceEmDashesTh(text: string): string {
	return text.replace(/\s*[—–]\s*/g, ', ');
}

/**
 * "ไม่ใช่ X แต่คือ Y" → "…คือ Y". Keeps the affirmative statement by keeping
 * only the copula plus what follows; no case handling needed in Thai.
 */
function flattenNegativeParallelismTh(text: string): string {
	const pattern = new RegExp(
		HUMANIZE_NEGATIVE_PARALLELISM_TH_RE.source,
		HUMANIZE_NEGATIVE_PARALLELISM_TH_RE.flags
	);
	return text.replace(pattern, 'คือ');
}

function applySwapTableTh(text: string): string {
	// Longest flagged phrase first so overlapping rows resolve predictably.
	const rows = [...HUMANIZE_SWAP_TABLE_TH].sort((a, b) => b.flagged.length - a.flagged.length);
	let next = text;
	for (const { flagged, instead } of rows) {
		if (!instead) {
			next = dropPhraseSubstr(next, flagged);
			continue;
		}
		// Literal global substring swap via split/join; preserveCase is a no-op
		// for Thai because the script has no capitalization.
		next = next.split(flagged).join(instead);
	}
	return next;
}

function applyLexiconTh(text: string): string {
	const entries = [...HUMANIZE_TIER1_LEXICON_TH].sort(
		(a, b) => b.term.length - a.term.length || (a.group < b.group ? -1 : 1)
	);
	let next = text;
	for (const { term, simpler } of entries) {
		if (!simpler) {
			next = dropPhraseSubstr(next, term);
			continue;
		}
		next = next.split(term).join(simpler);
	}
	return next;
}

function stripSmokingGunsTh(text: string): string {
	let next = text;
	for (const gun of HUMANIZE_SMOKING_GUNS_TH) {
		if (gun.pattern) {
			const re = new RegExp(
				gun.pattern.source,
				gun.pattern.flags.includes('g') ? gun.pattern.flags : `${gun.pattern.flags}g`
			);
			next = next.replace(re, '');
		}
		if (gun.phrases) {
			for (const phrase of gun.phrases) {
				next = dropPhraseSubstr(next, phrase);
			}
		}
	}
	return next;
}

/** Deletes conclusion signposts, prompt echoes, and fractal recaps inline. */
function dropThaiStockSignposts(text: string): string {
	let next = text;
	for (const phrase of [
		...HUMANIZE_CONCLUSION_PHRASES_TH,
		...HUMANIZE_PROMPT_ECHO_PHRASES_TH,
		...HUMANIZE_FRACTAL_SUMMARY_PHRASES_TH
	]) {
		next = dropPhraseSubstr(next, phrase);
	}
	return next;
}

/** Space before sentence punctuation never reads naturally in Thai drafts. */
function tidyPunctuationTh(text: string): string {
	return tidyPunctuation(text).replace(/\s+([.!?])/g, '$1');
}

/**
 * Deterministic cleanup for Thai drafts when Chrome Rewriter is missing.
 * The local Thai pass is identical across modes — EN-only extras such as
 * contractions have no Thai equivalent; `mode` still shapes the Rewriter
 * session upstream.
 */
function applyLocalHumanizeRewriteTh(source: string): string {
	let next = source;
	next = stripSmokingGunsTh(next);
	next = stripMarkdownResidue(next);
	next = stripEmojiBullets(next);
	next = flattenCurlyDoubleQuotes(next);
	next = replaceEmDashesTh(next);
	next = flattenNegativeParallelismTh(next);
	next = dropThaiStockSignposts(next);
	next = applySwapTableTh(next);
	next = applyLexiconTh(next);
	// Drop the final sentence when it is a rally cry; when that would erase
	// everything (single-sentence drafts), strip just the phrase instead.
	const withoutPepTalkEnding = dropMatchingLastSentence(next, HUMANIZE_PEP_TALK_PHRASES_TH);
	next =
		withoutPepTalkEnding.length > 0
			? withoutPepTalkEnding
			: HUMANIZE_PEP_TALK_PHRASES_TH.reduce(dropPhraseSubstr, next);
	next = tidyPunctuationTh(next);
	next = collapseWhitespace(next);
	return next || source;
}

/**
 * Deterministic cleanup used when Chrome Rewriter is missing.
 * Locale-aware: Thai drafts (detected via the Thai Unicode block) run through
 * the th catalogs; every other input keeps the original EN pipeline.
 * Human: strip stock tells. Roughen: same cleanup plus contractions; never invents facts.
 */
export function applyLocalHumanizeRewrite(text: string, mode: HumanizeMode): string {
	const source = (text ?? '').trim();
	if (!source) return '';

	if (detectHumanizeLocale(source) === 'th') {
		return applyLocalHumanizeRewriteTh(source);
	}

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
