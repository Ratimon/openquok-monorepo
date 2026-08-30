import type {
	HumanizeLexiconEntry,
	HumanizeTier2LexiconEntry
} from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Compact first-party wordbank of stock wording that often shows up in
 * machine-written social posts. Pair each tier-1 term with a plainer stand-in
 * used by the local rewrite when the on-device Rewriter is missing.
 */
export const HUMANIZE_TIER1_VERBS: readonly HumanizeLexiconEntry[] = [
	{ term: 'revolutionize', simpler: 'change', group: 'verbs' },
	{ term: 'supercharge', simpler: 'boost', group: 'verbs' },
	{ term: 'streamline', simpler: 'simplify', group: 'verbs' },
	{ term: 'spearhead', simpler: 'lead', group: 'verbs' },
	{ term: 'underscore', simpler: 'show', group: 'verbs' },
	{ term: 'facilitate', simpler: 'help', group: 'verbs' },
	{ term: 'leverage', simpler: 'use', group: 'verbs' },
	{ term: 'utilize', simpler: 'use', group: 'verbs' },
	{ term: 'harness', simpler: 'use', group: 'verbs' },
	{ term: 'empower', simpler: 'help', group: 'verbs' },
	{ term: 'elevate', simpler: 'lift', group: 'verbs' },
	{ term: 'catalyze', simpler: 'spark', group: 'verbs' },
	{ term: 'bolster', simpler: 'support', group: 'verbs' },
	{ term: 'pinpoint', simpler: 'find', group: 'verbs' },
	{ term: 'navigate', simpler: 'work through', group: 'verbs' },
	{ term: 'embark', simpler: 'start', group: 'verbs' },
	{ term: 'unlock', simpler: 'open up', group: 'verbs' },
	{ term: 'foster', simpler: 'help', group: 'verbs' },
	{ term: 'delve', simpler: 'look', group: 'verbs' },
	{ term: 'unpack', simpler: 'explain', group: 'verbs' },
	{ term: 'cultivate', simpler: 'grow', group: 'verbs' },
	{ term: 'orchestrate', simpler: 'run', group: 'verbs' },
	{ term: 'amplify', simpler: 'boost', group: 'verbs' },
	{ term: 'ignite', simpler: 'start', group: 'verbs' },
	{ term: 'unleash', simpler: 'start', group: 'verbs' },
	{ term: 'distill', simpler: 'boil down', group: 'verbs' },
	{ term: 'operationalize', simpler: 'put in place', group: 'verbs' },
	{ term: 'ideate', simpler: 'sketch', group: 'verbs' },
	{ term: 'incentivize', simpler: 'encourage', group: 'verbs' },
	{ term: 'reimagine', simpler: 'rethink', group: 'verbs' },
	{ term: 'transcend', simpler: 'go beyond', group: 'verbs' },
	{ term: 'curate', simpler: 'pick', group: 'verbs' },
	{ term: 'resonate', simpler: 'land', group: 'verbs' },
	{ term: 'solidify', simpler: 'lock in', group: 'verbs' },
	{ term: 'illuminate', simpler: 'show', group: 'verbs' },
	{ term: 'synergize', simpler: 'work together', group: 'verbs' }
];

export const HUMANIZE_TIER1_NOUNS: readonly HumanizeLexiconEntry[] = [
	{ term: 'game-changer', simpler: 'big shift', group: 'nouns' },
	{ term: 'game changer', simpler: 'big shift', group: 'nouns' },
	{ term: 'cornerstone', simpler: 'basis', group: 'nouns' },
	{ term: 'testament', simpler: 'sign', group: 'nouns' },
	{ term: 'tapestry', simpler: 'mix', group: 'nouns' },
	{ term: 'landscape', simpler: 'field', group: 'nouns' },
	{ term: 'paradigm', simpler: 'model', group: 'nouns' },
	{ term: 'synergy', simpler: 'teamwork', group: 'nouns' },
	{ term: 'plethora', simpler: 'lot', group: 'nouns' },
	{ term: 'beacon', simpler: 'guide', group: 'nouns' },
	{ term: 'realm', simpler: 'area', group: 'nouns' },
	{ term: 'ecosystem', simpler: 'setup', group: 'nouns' },
	{ term: 'north star', simpler: 'goal', group: 'nouns' },
	{ term: 'secret sauce', simpler: 'trick', group: 'nouns' },
	{ term: 'moving parts', simpler: 'pieces', group: 'nouns' },
	{ term: 'thought leadership', simpler: 'ideas', group: 'nouns' },
	{ term: 'deep dive', simpler: 'look', group: 'nouns' },
	{ term: "bird's-eye view", simpler: 'overview', group: 'nouns' },
	{ term: 'low-hanging fruit', simpler: 'easy wins', group: 'nouns' },
	{ term: 'wheelhouse', simpler: 'skill', group: 'nouns' },
	{ term: 'value proposition', simpler: 'offer', group: 'nouns' },
	{ term: 'deliverable', simpler: 'work', group: 'nouns' }
];

export const HUMANIZE_TIER1_ADJECTIVES: readonly HumanizeLexiconEntry[] = [
	{ term: 'cutting-edge', simpler: 'new', group: 'adjectives' },
	{ term: 'groundbreaking', simpler: 'new', group: 'adjectives' },
	{ term: 'multifaceted', simpler: 'varied', group: 'adjectives' },
	{ term: 'holistic', simpler: 'full', group: 'adjectives' },
	{ term: 'seamless', simpler: 'smooth', group: 'adjectives' },
	{ term: 'pivotal', simpler: 'key', group: 'adjectives' },
	{ term: 'robust', simpler: 'solid', group: 'adjectives' },
	{ term: 'myriad', simpler: 'many', group: 'adjectives' },
	{ term: 'transformative', simpler: 'big', group: 'adjectives' },
	{ term: 'best-in-class', simpler: 'strong', group: 'adjectives' },
	{ term: 'world-class', simpler: 'strong', group: 'adjectives' },
	{ term: 'next-generation', simpler: 'new', group: 'adjectives' },
	{ term: 'mission-critical', simpler: 'important', group: 'adjectives' },
	{ term: 'unprecedented', simpler: 'new', group: 'adjectives' },
	{ term: 'unparalleled', simpler: 'rare', group: 'adjectives' },
	{ term: 'frictionless', simpler: 'easy', group: 'adjectives' },
	{ term: 'turnkey', simpler: 'ready', group: 'adjectives' },
	{ term: 'end-to-end', simpler: 'full', group: 'adjectives' },
	{ term: 'data-driven', simpler: 'based on numbers', group: 'adjectives' },
	{ term: 'future-proof', simpler: 'lasting', group: 'adjectives' },
	{ term: 'hyper-personalized', simpler: 'tailored', group: 'adjectives' },
	{ term: 'bespoke', simpler: 'custom', group: 'adjectives' }
];

export const HUMANIZE_TIER1_STOCK_PHRASES: readonly HumanizeLexiconEntry[] = [
	{ term: "in today's fast-paced world", simpler: 'now', group: 'stockPhrases' },
	{ term: 'in this day and age', simpler: 'now', group: 'stockPhrases' },
	{ term: 'at the end of the day', simpler: 'finally', group: 'stockPhrases' },
	{ term: "it's important to note", simpler: '', group: 'stockPhrases' },
	{ term: 'it is important to note', simpler: '', group: 'stockPhrases' },
	{ term: 'it goes without saying', simpler: '', group: 'stockPhrases' },
	{ term: 'needless to say', simpler: '', group: 'stockPhrases' },
	{ term: 'it is worth noting that', simpler: '', group: 'stockPhrases' },
	{ term: 'as a matter of fact', simpler: '', group: 'stockPhrases' },
	{ term: 'the fact of the matter is', simpler: '', group: 'stockPhrases' },
	{ term: 'at the intersection of', simpler: 'between', group: 'stockPhrases' },
	{ term: 'when it comes to', simpler: 'for', group: 'stockPhrases' },
	{ term: 'move the needle', simpler: 'help', group: 'stockPhrases' },
	{ term: 'circle back', simpler: 'follow up', group: 'stockPhrases' },
	{ term: 'take it to the next level', simpler: 'improve', group: 'stockPhrases' },
	{ term: 'think outside the box', simpler: 'try a new angle', group: 'stockPhrases' },
	{ term: 'hit the ground running', simpler: 'start fast', group: 'stockPhrases' },
	{ term: 'raise the bar', simpler: 'do better', group: 'stockPhrases' },
	{ term: 'in order to', simpler: 'to', group: 'stockPhrases' },
	{ term: 'due to the fact that', simpler: 'because', group: 'stockPhrases' },
	{ term: 'at this point in time', simpler: 'now', group: 'stockPhrases' },
	{ term: 'with regard to', simpler: 'about', group: 'stockPhrases' },
	{ term: 'in the event that', simpler: 'if', group: 'stockPhrases' },
	{ term: 'a large number of', simpler: 'many', group: 'stockPhrases' },
	{ term: 'has the ability to', simpler: 'can', group: 'stockPhrases' },
	{ term: 'is able to', simpler: 'can', group: 'stockPhrases' }
];

export const HUMANIZE_TIER1_NARRATIVE_CLICHES: readonly HumanizeLexiconEntry[] = [
	{ term: 'in a world where', simpler: '', group: 'narrativeCliches' },
	{ term: 'little did they know', simpler: '', group: 'narrativeCliches' },
	{ term: 'the rest is history', simpler: '', group: 'narrativeCliches' },
	{ term: 'against all odds', simpler: '', group: 'narrativeCliches' },
	{ term: 'once upon a time', simpler: '', group: 'narrativeCliches' },
	{ term: 'what happened next', simpler: 'then', group: 'narrativeCliches' },
	{ term: "and that's when everything changed", simpler: 'then', group: 'narrativeCliches' },
	{ term: 'spoiler alert', simpler: '', group: 'narrativeCliches' }
];

export const HUMANIZE_TIER1_LEXICON_BY_GROUP = {
	verbs: HUMANIZE_TIER1_VERBS,
	nouns: HUMANIZE_TIER1_NOUNS,
	adjectives: HUMANIZE_TIER1_ADJECTIVES,
	stockPhrases: HUMANIZE_TIER1_STOCK_PHRASES,
	narrativeCliches: HUMANIZE_TIER1_NARRATIVE_CLICHES
} as const;

export const HUMANIZE_TIER1_LEXICON: readonly HumanizeLexiconEntry[] = [
	...HUMANIZE_TIER1_VERBS,
	...HUMANIZE_TIER1_NOUNS,
	...HUMANIZE_TIER1_ADJECTIVES,
	...HUMANIZE_TIER1_STOCK_PHRASES,
	...HUMANIZE_TIER1_NARRATIVE_CLICHES
];

/**
 * Mild jargon that is fine once. A cluster is two of these in one sentence
 * or five in one piece — Rewriter instruction only, not a local tell.
 */
export const HUMANIZE_TIER2_LEXICON: readonly HumanizeTier2LexiconEntry[] = [
	{ term: 'innovative' },
	{ term: 'impactful' },
	{ term: 'actionable' },
	{ term: 'scalable' },
	{ term: 'strategic' },
	{ term: 'comprehensive' },
	{ term: 'significant' },
	{ term: 'insights' },
	{ term: 'stakeholders' },
	{ term: 'takeaway' },
	{ term: 'framework' },
	{ term: 'playbook' },
	{ term: 'cadence' },
	{ term: 'alignment' },
	{ term: 'optimize' },
	{ term: 'enhance' },
	{ term: 'implement' }
];

/** Cluster thresholds for tier-2 terms (Rewriter context; not audited locally). */
export const HUMANIZE_TIER2_CLUSTER = {
	maxPerSentence: 2,
	maxPerPiece: 5
} as const;

/** Unique terms, longest first so multi-word matches win over fragments. */
export const HUMANIZE_TIER1_TERMS: string[] = [...HUMANIZE_TIER1_LEXICON]
	.map((entry) => entry.term)
	.sort((a, b) => b.length - a.length);

export type { HumanizeLexiconEntry };
