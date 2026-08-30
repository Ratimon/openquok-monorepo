import type { HumanizeMarkerEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Positive cues for a spoken social post. Rewriter should use them sparingly;
 * do not dump every marker into one rewrite.
 */
export const HUMANIZE_HUMAN_MARKERS: readonly HumanizeMarkerEntry[] = [
	{ id: 'contractions', cue: 'Contractions (don’t, I’m, it’s) when the register is casual.' },
	{ id: 'texturedNumbers', cue: 'Textured numbers (about 40, a couple dozen) instead of fake precision.' },
	{ id: 'namedThings', cue: 'Keep named people, products, and places the user already wrote.' },
	{ id: 'parentheticalAside', cue: 'At most one short parenthetical aside.' },
	{
		id: 'hedgeOnce',
		cue: 'At most one of I think / honestly / to be fair — not a stack.'
	},
	{ id: 'andButBecause', cue: 'An And / But / Because sentence opener is allowed once.' },
	{ id: 'singleSentenceParagraph', cue: 'One single-sentence paragraph is allowed.' },
	{ id: 'unresolvedEdge', cue: 'Leave a mild unresolved edge if the source has one.' },
	{
		id: 'droppedOxford',
		cue: 'In casual register, a dropped Oxford comma is fine.'
	},
	{ id: 'plainIs', cue: 'Prefer a plain is over copula dodges (serves as, stands as).' }
];
