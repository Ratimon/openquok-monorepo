import type { CardPatternCell } from '$lib/ui/patterns/types';

export const DEFAULT_CARD_PATTERN_SEQUENCE: CardPatternCell[][] = [
	[
		[7, 1],
		[8, 3],
		[9, 5]
	],
	[
		[6, 2],
		[8, 4],
		[10, 1]
	],
	[
		[7, 4],
		[9, 2],
		[11, 5]
	],
	[
		[8, 1],
		[10, 3],
		[12, 2]
	],
	[
		[6, 5],
		[9, 1],
		[11, 4]
	],
	[
		[7, 2],
		[8, 5],
		[10, 3]
	]
];

export function cardPatternAtIndex(
	index: number,
	patterns: CardPatternCell[][] = DEFAULT_CARD_PATTERN_SEQUENCE
): CardPatternCell[] {
	return patterns[index % patterns.length];
}
