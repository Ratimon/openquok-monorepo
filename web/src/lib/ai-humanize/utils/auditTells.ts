import { HUMANIZE_TIER1_TERMS } from '$lib/ai-humanize/constants/locales/en/lexicon';
import { HUMANIZE_SMOKING_GUNS } from '$lib/ai-humanize/constants/locales/en/smokingGuns';
import {
	HUMANIZE_CONCLUSION_PHRASES,
	HUMANIZE_COPULA_DODGE_PHRASES,
	HUMANIZE_EM_DASH_RE,
	HUMANIZE_EMOJI_BULLET_RE,
	HUMANIZE_KICKER_PHRASES,
	HUMANIZE_MARKDOWN_BOLD_RE,
	HUMANIZE_MARKDOWN_FENCE_RE,
	HUMANIZE_MARKDOWN_HEADING_RE,
	HUMANIZE_MARKDOWN_LINK_RE,
	HUMANIZE_NEGATIVE_PARALLELISM_RE,
	HUMANIZE_PEP_TALK_PHRASES,
	HUMANIZE_RULE_OF_THREE_RE,
	HUMANIZE_UNIFORM_SENTENCE_CV_MAX,
	HUMANIZE_UNIFORM_SENTENCE_MIN_COUNT
} from '$lib/ai-humanize/constants/locales/en/tells';

export type HumanizeTellKind =
	| 'emDash'
	| 'lexicon'
	| 'negativeParallelism'
	| 'ruleOfThree'
	| 'kicker'
	| 'signpostedConclusion'
	| 'pepTalkEnding'
	| 'uniformSentenceLength'
	| 'smokingGun'
	| 'emojiBullet'
	| 'markdownResidue'
	| 'copulaDodge';

export type HumanizeTellHit = {
	kind: HumanizeTellKind;
	excerpt: string;
	index: number;
};

export type HumanizeAuditResult = {
	tellCount: number;
	hits: HumanizeTellHit[];
	byKind: Record<HumanizeTellKind, number>;
};

const EMPTY_BY_KIND: Record<HumanizeTellKind, number> = {
	emDash: 0,
	lexicon: 0,
	negativeParallelism: 0,
	ruleOfThree: 0,
	kicker: 0,
	signpostedConclusion: 0,
	pepTalkEnding: 0,
	uniformSentenceLength: 0,
	smokingGun: 0,
	emojiBullet: 0,
	markdownResidue: 0,
	copulaDodge: 0
};

const MARKDOWN_PATTERNS = [
	HUMANIZE_MARKDOWN_BOLD_RE,
	HUMANIZE_MARKDOWN_HEADING_RE,
	HUMANIZE_MARKDOWN_FENCE_RE,
	HUMANIZE_MARKDOWN_LINK_RE
];

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeApostrophes(text: string): string {
	return text.replace(/\u2019/g, "'");
}

function lexiconPattern(): RegExp {
	const terms = HUMANIZE_TIER1_TERMS.map(escapeRegExp).join('|');
	return new RegExp(`\\b(?:${terms})\\b`, 'gi');
}

function collectRegexHits(
	text: string,
	pattern: RegExp,
	kind: HumanizeTellKind
): HumanizeTellHit[] {
	const hits: HumanizeTellHit[] = [];
	const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
	let match: RegExpExecArray | null;
	while ((match = re.exec(text)) !== null) {
		hits.push({ kind, excerpt: match[0], index: match.index });
		if (match[0].length === 0) re.lastIndex += 1;
	}
	return hits;
}

function collectPhraseHits(
	normalized: string,
	original: string,
	phrases: readonly string[],
	kind: HumanizeTellKind
): HumanizeTellHit[] {
	const hits: HumanizeTellHit[] = [];
	const haystack = normalized.toLowerCase();
	for (const phrase of phrases) {
		const needle = phrase.toLowerCase();
		let from = 0;
		while (from < haystack.length) {
			const index = haystack.indexOf(needle, from);
			if (index === -1) break;
			const before = index === 0 || !/[A-Za-z0-9]/.test(haystack[index - 1]!);
			const afterIndex = index + needle.length;
			const after =
				afterIndex >= haystack.length || !/[A-Za-z0-9]/.test(haystack[afterIndex]!);
			if (!before || !after) {
				from = index + 1;
				continue;
			}
			hits.push({
				kind,
				excerpt: original.slice(index, index + needle.length),
				index
			});
			from = afterIndex;
		}
	}
	return hits;
}

function dedupeHits(hits: HumanizeTellHit[]): HumanizeTellHit[] {
	const seen = new Set<string>();
	const out: HumanizeTellHit[] = [];
	for (const hit of hits) {
		const key = `${hit.kind}:${hit.index}:${hit.excerpt.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(hit);
	}
	return out;
}

function splitSentences(text: string): { text: string; index: number }[] {
	const sentences: { text: string; index: number }[] = [];
	const re = /[^.!?]+[.!?]*\s*/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(text)) !== null) {
		const slice = match[0].trim();
		if (slice) sentences.push({ text: slice, index: match.index });
	}
	if (sentences.length === 0 && text.trim()) {
		sentences.push({ text: text.trim(), index: 0 });
	}
	return sentences;
}

function coefficientOfVariation(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((sum, n) => sum + n, 0) / values.length;
	if (mean === 0) return 0;
	const variance =
		values.reduce((sum, n) => sum + (n - mean) ** 2, 0) / values.length;
	return Math.sqrt(variance) / mean;
}

function pepTalkHits(original: string, normalized: string): HumanizeTellHit[] {
	const sentences = splitSentences(normalized);
	const last = sentences[sentences.length - 1];
	if (!last) return [];
	const lastLower = last.text.toLowerCase();
	for (const phrase of HUMANIZE_PEP_TALK_PHRASES) {
		const at = lastLower.indexOf(phrase);
		if (at === -1) continue;
		return [
			{
				kind: 'pepTalkEnding',
				excerpt: original.slice(last.index + at, last.index + at + phrase.length),
				index: last.index + at
			}
		];
	}
	return [];
}

function uniformSentenceHit(text: string): HumanizeTellHit[] {
	const sentences = splitSentences(text).filter((s) => s.text.length > 0);
	if (sentences.length < HUMANIZE_UNIFORM_SENTENCE_MIN_COUNT) return [];
	const lengths = sentences.map((s) => s.text.length);
	if (coefficientOfVariation(lengths) > HUMANIZE_UNIFORM_SENTENCE_CV_MAX) return [];
	return [
		{
			kind: 'uniformSentenceLength',
			excerpt: sentences[0]!.text,
			index: sentences[0]!.index
		}
	];
}

function smokingGunHits(original: string, normalized: string): HumanizeTellHit[] {
	const hits: HumanizeTellHit[] = [];
	for (const gun of HUMANIZE_SMOKING_GUNS) {
		if (gun.pattern) {
			hits.push(...collectRegexHits(original, gun.pattern, 'smokingGun'));
		}
		if (gun.phrases) {
			hits.push(...collectPhraseHits(normalized, original, gun.phrases, 'smokingGun'));
		}
	}
	return hits;
}

function markdownHits(text: string): HumanizeTellHit[] {
	return MARKDOWN_PATTERNS.flatMap((pattern) =>
		collectRegexHits(text, pattern, 'markdownResidue')
	);
}

function emptyResult(): HumanizeAuditResult {
	return { tellCount: 0, hits: [], byKind: { ...EMPTY_BY_KIND } };
}

/**
 * Counts first-party writing tells in `text` (lexicon, em dashes, stock setups).
 * Pure and deterministic so Humanize still has a useful local path without Rewriter.
 */
export function auditHumanizeTells(text: string): HumanizeAuditResult {
	const original = text ?? '';
	if (!original.trim()) return emptyResult();

	const normalized = normalizeApostrophes(original);
	const hits = dedupeHits([
		...collectRegexHits(original, HUMANIZE_EM_DASH_RE, 'emDash'),
		...collectRegexHits(normalized, lexiconPattern(), 'lexicon'),
		...collectRegexHits(normalized, HUMANIZE_NEGATIVE_PARALLELISM_RE, 'negativeParallelism'),
		...collectRegexHits(normalized, HUMANIZE_RULE_OF_THREE_RE, 'ruleOfThree'),
		...collectPhraseHits(normalized, original, HUMANIZE_KICKER_PHRASES, 'kicker'),
		...collectPhraseHits(
			normalized,
			original,
			HUMANIZE_CONCLUSION_PHRASES,
			'signpostedConclusion'
		),
		...pepTalkHits(original, normalized),
		...uniformSentenceHit(normalized),
		...smokingGunHits(original, normalized),
		...collectRegexHits(original, HUMANIZE_EMOJI_BULLET_RE, 'emojiBullet'),
		...markdownHits(original),
		...collectPhraseHits(normalized, original, HUMANIZE_COPULA_DODGE_PHRASES, 'copulaDodge')
	]);

	hits.sort((a, b) => a.index - b.index || a.kind.localeCompare(b.kind));

	const byKind = { ...EMPTY_BY_KIND };
	for (const hit of hits) {
		byKind[hit.kind] += 1;
	}

	return { tellCount: hits.length, hits, byKind };
}
