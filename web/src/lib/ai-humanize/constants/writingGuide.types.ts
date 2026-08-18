/** Grouping for tier-1 wordbank rows. */
export type HumanizeLexiconGroupId =
	| 'verbs'
	| 'nouns'
	| 'adjectives'
	| 'stockPhrases'
	| 'narrativeCliches';

export type HumanizeLexiconEntry = {
	term: string;
	/** Plain stand-in for the local rewrite. Empty string drops the term. */
	simpler: string;
	group: HumanizeLexiconGroupId;
};

export type HumanizeTier2LexiconEntry = {
	term: string;
};

export type HumanizeSwapRow = {
	flagged: string;
	/** Plain stand-in. Empty string means drop the flagged phrase. */
	instead: string;
};

export type HumanizeTellCategory = 'construction' | 'punctuation' | 'structure' | 'content';

/** `local` = mechanically countable; `rewriter` = instruction-only. */
export type HumanizeTellDetectability = 'local' | 'rewriter';

export type HumanizeTellEntry = {
	id: string;
	category: HumanizeTellCategory;
	detect: HumanizeTellDetectability;
	spot: string;
	fix: string;
	phrases?: readonly string[];
	pattern?: RegExp;
};

export type HumanizeSmokingGunEntry = {
	id: string;
	/** Compact label serialized into Rewriter context. */
	label: string;
	phrases?: readonly string[];
	pattern?: RegExp;
};

export type HumanizeMarkerEntry = {
	id: string;
	cue: string;
};

export type HumanizeRewriteConstraint = {
	id: string;
	rule: string;
};

export type HumanizeRegisterOverlayId = 'simplifiedTechnicalEnglish';

export type HumanizeRegisterOverlay = {
	id: HumanizeRegisterOverlayId;
	enabled: boolean;
	sharedContext: string;
};
