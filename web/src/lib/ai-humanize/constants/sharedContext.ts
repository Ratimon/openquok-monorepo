import type { HumanizeMode } from '$lib/ai-humanize/constants/config';

import { HUMANIZE_WRITING_GUIDE } from '$lib/ai-humanize/constants/writingGuide';

/**
 * Human mode: reader-facing cleanup. Keep it a social post; strip stock
 * machine-written habits. Do not invent facts.
 */
export const COMPOSER_HUMANIZE_HUMAN_PREAMBLE =
	'Rewrite the user’s social media post so it reads less machine-written. Keep it a social post: same core message, same facts, same call to action. Prefer plain spoken wording.';

/**
 * Roughen mode: live-draft voice. One incident, casual register, room for
 * self-correction. Flag any new names/dates/prices so the user can swap real details.
 */
export const COMPOSER_HUMANIZE_ROUGHEN_PREAMBLE =
	'Rewrite the user’s social media post in a rougher, more spoken live-draft voice. Stay on one incident or point. Allow visible self-corrections, repetition, and dropped coverage. Keep the same facts the user already wrote. If you add a name, date, or price that was not in the source, mention it so the user can replace it with a real detail. Review invented details before posting.';

function uniqueJoin(values: readonly string[], separator: string): string {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const value of values) {
		const key = value.trim();
		if (!key || seen.has(key)) continue;
		seen.add(key);
		out.push(key);
	}
	return out.join(separator);
}

/**
 * Compact instruction block from the writing catalogs. Summarizes lists for
 * on-device Rewriter context — does not dump every `spot` example.
 */
export function serializeHumanizeWritingGuide(
	guide: typeof HUMANIZE_WRITING_GUIDE = HUMANIZE_WRITING_GUIDE
): string {
	const neverUse = uniqueJoin(
		guide.lexicon.tier1.map((entry) => entry.term),
		', '
	);
	const tier2 = uniqueJoin(
		guide.lexicon.tier2.map((entry) => entry.term),
		', '
	);
	const { maxPerSentence, maxPerPiece } = guide.lexicon.tier2Cluster;
	const swaps = uniqueJoin(
		guide.swapTable.map((row) =>
			row.instead ? `${row.flagged} → ${row.instead}` : `${row.flagged} → (drop)`
		),
		'; '
	);
	const tellFixes = uniqueJoin(
		guide.tells.map((tell) => `${tell.id}: ${tell.fix}`),
		' '
	);
	const guns = uniqueJoin(
		guide.smokingGuns.map((gun) => gun.label),
		'; '
	);
	const markers = uniqueJoin(
		guide.humanMarkers.map((marker) => marker.cue),
		' '
	);
	const neverDo = uniqueJoin(
		guide.rewriteConstraints.map((constraint) => constraint.rule),
		' '
	);
	const { shortMaxWords, longMinWords } = guide.burstiness;

	return (
		`Never-use (tier-1): ${neverUse}. ` +
		`Tier-2 (ok alone; not ${maxPerSentence} in one sentence or ${maxPerPiece} in one piece): ${tier2}. ` +
		`Say-instead: ${swaps}. ` +
		`Tells: ${tellFixes} ` +
		`Burstiness: mix a sentence of ${shortMaxWords} words or fewer with one of ${longMinWords}+ words. ` +
		`Strip immediately: ${guns}. ` +
		`Human markers (use sparingly): ${markers} ` +
		`Do not: ${neverDo}`
	);
}

function serializeEnabledRegisterOverlays(
	guide: typeof HUMANIZE_WRITING_GUIDE = HUMANIZE_WRITING_GUIDE
): string {
	const ste = guide.registers.simplifiedTechnicalEnglish;
	if (!ste.enabled) return '';
	return ste.sharedContext;
}

/** Mode preamble + catalog block + optional developer overlays. */
export function buildHumanizeModeSharedContext(mode: HumanizeMode): string {
	const preamble =
		mode === 'roughen' ? COMPOSER_HUMANIZE_ROUGHEN_PREAMBLE : COMPOSER_HUMANIZE_HUMAN_PREAMBLE;
	const overlay = serializeEnabledRegisterOverlays();
	return [preamble, serializeHumanizeWritingGuide(), overlay].filter(Boolean).join(' ');
}

export const COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT = buildHumanizeModeSharedContext('human');

export const COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT = buildHumanizeModeSharedContext('roughen');
