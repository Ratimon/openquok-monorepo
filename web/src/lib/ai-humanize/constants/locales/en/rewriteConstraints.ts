import type { HumanizeRewriteConstraint } from '$lib/ai-humanize/constants/writingGuide.types';

/** What not to do while cleaning a draft. */
export const HUMANIZE_REWRITE_CONSTRAINTS: readonly HumanizeRewriteConstraint[] = [
	{ id: 'noThesaurusSalad', rule: 'Do not swap in rarer synonyms just to sound different.' },
	{ id: 'noRandomTypos', rule: 'Do not add typos, keyboard slips, or fake misspellings.' },
	{ id: 'keepPersonality', rule: 'Do not scrub personality, humor, or the user’s register.' },
	{
		id: 'noInventedFacts',
		rule: 'Do not invent names, dates, prices, stats, quotes, or anecdotes.'
	},
	{
		id: 'keepLongSentences',
		rule: 'Do not shrink every long sentence; vary length instead.'
	}
];
