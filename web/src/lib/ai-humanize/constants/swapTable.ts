import type { HumanizeSwapRow } from '$lib/ai-humanize/constants/writingGuide.types';

import { HUMANIZE_CONCLUSION_PHRASES, HUMANIZE_KICKER_PHRASES } from '$lib/ai-humanize/constants/tells';

/**
 * Flagged → say-instead rows. Empty `instead` drops the phrase.
 * Local rewrite applies these before leftover tier-1 `simpler` swaps.
 */
export const HUMANIZE_SWAP_TABLE: readonly HumanizeSwapRow[] = [
	{ flagged: 'delve into', instead: 'look at' },
	{ flagged: 'leverage', instead: 'use' },
	{ flagged: 'utilize', instead: 'use' },
	{ flagged: 'harness', instead: 'use' },
	{ flagged: 'in order to', instead: 'to' },
	{ flagged: 'due to the fact that', instead: 'because' },
	{ flagged: 'at this point in time', instead: 'now' },
	{ flagged: 'with regard to', instead: 'about' },
	{ flagged: 'in terms of', instead: 'for' },
	{ flagged: 'in the event that', instead: 'if' },
	{ flagged: 'for the purpose of', instead: 'to' },
	{ flagged: 'a large number of', instead: 'many' },
	{ flagged: 'has the ability to', instead: 'can' },
	{ flagged: 'is able to', instead: 'can' },
	{ flagged: 'make a decision to', instead: 'decide to' },
	{ flagged: 'provide assistance', instead: 'help' },
	{ flagged: 'conduct an analysis', instead: 'analyze' },
	{ flagged: 'at the end of the day', instead: 'finally' },
	{ flagged: "it's important to note", instead: '' },
	{ flagged: 'it is important to note', instead: '' },
	{ flagged: 'it is worth noting that', instead: '' },
	{ flagged: 'it goes without saying', instead: '' },
	{ flagged: 'needless to say', instead: '' },
	{ flagged: 'as a matter of fact', instead: '' },
	{ flagged: 'the fact of the matter is', instead: '' },
	{ flagged: 'please note that', instead: '' },
	{ flagged: 'as mentioned above', instead: '' },
	{ flagged: 'as previously mentioned', instead: '' },
	{ flagged: "let's dive in", instead: '' },
	{ flagged: 'without further ado', instead: '' },
	{ flagged: 'furthermore', instead: 'also' },
	{ flagged: 'moreover', instead: 'also' },
	{ flagged: 'additionally', instead: 'also' },
	{ flagged: 'subsequently', instead: 'then' },
	...HUMANIZE_CONCLUSION_PHRASES.map((flagged) => ({ flagged, instead: '' })),
	...HUMANIZE_KICKER_PHRASES.map((flagged) => ({ flagged, instead: '' }))
];
