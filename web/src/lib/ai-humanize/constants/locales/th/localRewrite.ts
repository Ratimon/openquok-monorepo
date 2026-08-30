import { HUMANIZE_TIER1_LEXICON } from '$lib/ai-humanize/constants/locales/th/lexicon';
import { HUMANIZE_SMOKING_GUNS } from '$lib/ai-humanize/constants/locales/th/smokingGuns';
import { HUMANIZE_SWAP_TABLE } from '$lib/ai-humanize/constants/locales/th/swapTable';
import {
	HUMANIZE_CONCLUSION_PHRASES,
	HUMANIZE_FRACTAL_SUMMARY_PHRASES,
	HUMANIZE_NEGATIVE_PARALLELISM_RE,
	HUMANIZE_PEP_TALK_PHRASES,
	HUMANIZE_PROMPT_ECHO_PHRASES
} from '$lib/ai-humanize/constants/locales/th/tells';
import {
	collapseWhitespace,
	dropMatchingLastSentence,
	escapeRegExp,
	flattenCurlyDoubleQuotes,
	stripEmojiBullets,
	stripMarkdownResidue,
	tidyPunctuation
} from '$lib/ai-humanize/utils/localRewriteShared';

/**
 * Substring drop without word boundaries — Thai words run together, so
 * `(?<![A-Za-z0-9])…(?![A-Za-z0-9])` guards from EN {@link dropPhrase} would
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
		HUMANIZE_NEGATIVE_PARALLELISM_RE.source,
		HUMANIZE_NEGATIVE_PARALLELISM_RE.flags
	);
	return text.replace(pattern, 'คือ');
}

function applySwapTableTh(text: string): string {
	const rows = [...HUMANIZE_SWAP_TABLE].sort((a, b) => b.flagged.length - a.flagged.length);
	let next = text;
	for (const { flagged, instead } of rows) {
		if (!instead) {
			next = dropPhraseSubstr(next, flagged);
			continue;
		}
		next = next.split(flagged).join(instead);
	}
	return next;
}

function applyLexiconTh(text: string): string {
	const entries = [...HUMANIZE_TIER1_LEXICON].sort(
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
		...HUMANIZE_CONCLUSION_PHRASES,
		...HUMANIZE_PROMPT_ECHO_PHRASES,
		...HUMANIZE_FRACTAL_SUMMARY_PHRASES
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
export function applyLocalHumanizeRewriteTh(source: string): string {
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
	const withoutPepTalkEnding = dropMatchingLastSentence(next, HUMANIZE_PEP_TALK_PHRASES);
	next =
		withoutPepTalkEnding.length > 0
			? withoutPepTalkEnding
			: HUMANIZE_PEP_TALK_PHRASES.reduce(dropPhraseSubstr, next);
	next = tidyPunctuationTh(next);
	next = collapseWhitespace(next);
	return next || source;
}
