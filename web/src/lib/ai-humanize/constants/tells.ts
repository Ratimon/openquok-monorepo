import type { HumanizeTellEntry } from '$lib/ai-humanize/constants/writingGuide.types';

/** Em dash (and spaced en dash used the same way). */
export const HUMANIZE_EM_DASH_RE = /—|\s–\s/g;

/**
 * “It’s not X, it’s Y” / “it’s not X — it’s Y” inside a single sentence.
 * Bounded so it does not span unrelated sentences.
 */
export const HUMANIZE_NEGATIVE_PARALLELISM_RE =
	/\bit['\u2019]s not\b[^.!?\n]{0,80}?[,—–]\s*it['\u2019]s\b/gi;

/** Three coordinated 6+ letter words: “innovative, scalable, and holistic”. */
export const HUMANIZE_RULE_OF_THREE_RE =
	/\b[A-Za-z]{6,},\s+[A-Za-z]{6,},\s+and\s+[A-Za-z]{6,}\b/gi;

/** Trailing “, enabling X” / “, ensuring Y” style tails. */
export const HUMANIZE_PARTICIPIAL_TAIL_RE =
	/,\s+(?:enabling|ensuring|unlocking|empowering|fostering|driving|delivering)\b[^.!?\n]{0,80}/gi;

export const HUMANIZE_KICKER_PHRASES = [
	"here's the kicker",
	"here's the thing",
	"here's why that matters",
	'let that sink in',
	'plot twist'
] as const;

export const HUMANIZE_CONCLUSION_PHRASES = [
	'in conclusion',
	'in summary',
	'to recap',
	'to sum up',
	'the bottom line',
	"let's wrap up",
	'wrapping up'
] as const;

export const HUMANIZE_PEP_TALK_PHRASES = [
	"you've got this",
	"let's make it happen",
	'the future is yours',
	'now go forth',
	'ready to dive in',
	"let's do this",
	'the journey starts now',
	'together we can'
] as const;

export const HUMANIZE_COPULA_DODGE_PHRASES = [
	'serves as',
	'stands as',
	'functions as',
	'acts as a',
	'constitutes a'
] as const;

export const HUMANIZE_VAGUE_AUTHORITY_PHRASES = [
	'studies show',
	'experts say',
	'research suggests',
	'many people believe'
] as const;

export const HUMANIZE_HEDGE_STACK_PHRASES = [
	'it could be argued that',
	'it might potentially',
	'perhaps it is possible that'
] as const;

export const HUMANIZE_FALSE_RANGE_PHRASES = [
	'and everything in between',
	'whether you are a beginner or an expert',
	"whether you're a beginner or an expert"
] as const;

export const HUMANIZE_ANALOGY_REFLEX_PHRASES = ['think of it as', "it's like a", 'imagine if'] as const;

export const HUMANIZE_GRANDIOSITY_PHRASES = [
	'in the history of',
	'never before seen',
	'unlike anything else'
] as const;

/** Bold lead-in on a list row: `- **Label**:`. */
export const HUMANIZE_BOLD_FIRST_BULLET_RE = /^[\t ]*(?:[-*]|\d+[.)])\s+\*\*[^*]+\*\*/gm;

/** Emoji (or dingbat) used as a list marker at the start of a line. */
export const HUMANIZE_EMOJI_BULLET_RE =
	/^\s*(?:\p{Extended_Pictographic}(?:\uFE0F)?|[✅✨⭐🔥💡🚀✔✓])\s+/gmu;

export const HUMANIZE_MARKDOWN_BOLD_RE = /\*\*[^*]+\*\*|__[^_]+__/g;
export const HUMANIZE_MARKDOWN_HEADING_RE = /^#{1,6}\s+/gm;
export const HUMANIZE_MARKDOWN_FENCE_RE = /```/g;
export const HUMANIZE_MARKDOWN_LINK_RE = /\[[^\]]+\]\([^)]+\)/g;
export const HUMANIZE_CURLY_DOUBLE_QUOTE_RE = /[\u201C\u201D]/g;

/** Minimum sentence count before uniform-length is considered a tell. */
export const HUMANIZE_UNIFORM_SENTENCE_MIN_COUNT = 4;

/** Coefficient of variation at or below this counts as uniform sentence length. */
export const HUMANIZE_UNIFORM_SENTENCE_CV_MAX = 0.18;

/** Short end of a bursty mix (words). */
export const HUMANIZE_BURSTINESS_SHORT_MAX_WORDS = 6;

/** Long end of a bursty mix (words). */
export const HUMANIZE_BURSTINESS_LONG_MIN_WORDS = 25;

/**
 * Construction, punctuation, structure, and content tells.
 * `detect: 'local'` rows are mechanically countable; the rest stay Rewriter-only.
 */
export const HUMANIZE_TELLS: readonly HumanizeTellEntry[] = [
	{
		id: 'negativeParallelism',
		category: 'construction',
		detect: 'local',
		spot: 'It’s not X, it’s Y in one sentence.',
		fix: 'Keep the second clause only.',
		pattern: HUMANIZE_NEGATIVE_PARALLELISM_RE
	},
	{
		id: 'ruleOfThree',
		category: 'construction',
		detect: 'local',
		spot: 'Three long coordinated adjectives or nouns.',
		fix: 'Keep one concrete word.',
		pattern: HUMANIZE_RULE_OF_THREE_RE
	},
	{
		id: 'copulaDodge',
		category: 'construction',
		detect: 'local',
		spot: 'Serves as / stands as / functions as instead of is.',
		fix: 'Use a plain is or does.',
		phrases: HUMANIZE_COPULA_DODGE_PHRASES
	},
	{
		id: 'participialTail',
		category: 'construction',
		detect: 'rewriter',
		spot: 'A comma tail with enabling, ensuring, unlocking.',
		fix: 'Split into a second short sentence or drop the tail.',
		pattern: HUMANIZE_PARTICIPIAL_TAIL_RE
	},
	{
		id: 'rhetoricalQnA',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Why does this matter? Because…',
		fix: 'State the point; skip the planted question.'
	},
	{
		id: 'falseRange',
		category: 'construction',
		detect: 'rewriter',
		spot: 'From X to Y and everything in between.',
		fix: 'Name the actual range or drop it.',
		phrases: HUMANIZE_FALSE_RANGE_PHRASES
	},
	{
		id: 'hedgeStack',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Stacked might / potentially / perhaps.',
		fix: 'Pick one hedge or commit.',
		phrases: HUMANIZE_HEDGE_STACK_PHRASES
	},
	{
		id: 'vagueAuthority',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Studies show / experts say with no name.',
		fix: 'Cite a real source or drop the appeal.',
		phrases: HUMANIZE_VAGUE_AUTHORITY_PHRASES
	},
	{
		id: 'falseSuspense',
		category: 'construction',
		detect: 'local',
		spot: 'Here’s the kicker / let that sink in.',
		fix: 'Lead with the fact.',
		phrases: HUMANIZE_KICKER_PHRASES
	},
	{
		id: 'analogyReflex',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Think of it as… / it’s like a…',
		fix: 'Describe the thing; skip the stock analogy.',
		phrases: HUMANIZE_ANALOGY_REFLEX_PHRASES
	},
	{
		id: 'inventedLabels',
		category: 'construction',
		detect: 'rewriter',
		spot: 'The X Framework / the Y Method coined in the rewrite.',
		fix: 'Use the user’s name for the thing, or none.'
	},
	{
		id: 'inspirationalPivot',
		category: 'construction',
		detect: 'local',
		spot: 'Pep-talk closer after a practical update.',
		fix: 'End on the fact or ask; drop the rally.',
		phrases: HUMANIZE_PEP_TALK_PHRASES
	},
	{
		id: 'grandiosity',
		category: 'construction',
		detect: 'rewriter',
		spot: 'In the history of / never before seen.',
		fix: 'Scale the claim to what the user actually wrote.',
		phrases: HUMANIZE_GRANDIOSITY_PHRASES
	},
	{
		id: 'anaphora',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Three sentences in a row starting with the same word.',
		fix: 'Vary the openings.'
	},
	{
		id: 'deadMetaphor',
		category: 'construction',
		detect: 'rewriter',
		spot: 'Move the needle / raise the bar used as filler.',
		fix: 'Say what actually changed.'
	},
	{
		id: 'emDash',
		category: 'punctuation',
		detect: 'local',
		spot: 'Em dashes, or spaced en dashes used the same way.',
		fix: 'Use a comma or a period. Target at most one dash in the whole post.',
		pattern: HUMANIZE_EM_DASH_RE
	},
	{
		id: 'boldFirstBullet',
		category: 'punctuation',
		detect: 'rewriter',
		spot: 'List rows that start **Label**:',
		fix: 'Write a normal sentence or a plain list.',
		pattern: HUMANIZE_BOLD_FIRST_BULLET_RE
	},
	{
		id: 'emojiBullet',
		category: 'punctuation',
		detect: 'local',
		spot: 'Lines that open with an emoji as a bullet.',
		fix: 'Drop the emoji marker; keep the line.',
		pattern: HUMANIZE_EMOJI_BULLET_RE
	},
	{
		id: 'titleCaseColon',
		category: 'punctuation',
		detect: 'rewriter',
		spot: 'Title Case Phrases: as a heading inside a social post.',
		fix: 'Use a normal sentence case opener.'
	},
	{
		id: 'markdownResidue',
		category: 'punctuation',
		detect: 'local',
		spot: 'Leftover **, headings, fences, or markdown links.',
		fix: 'Plain text only.',
		pattern: HUMANIZE_MARKDOWN_BOLD_RE
	},
	{
		id: 'curlyQuotes',
		category: 'punctuation',
		detect: 'rewriter',
		spot: 'Typographic double quotes in a draft meant for plain social text.',
		fix: 'Use straight quotes if you need quotes at all.',
		pattern: HUMANIZE_CURLY_DOUBLE_QUOTE_RE
	},
	{
		id: 'semicolonPreference',
		category: 'punctuation',
		detect: 'rewriter',
		spot: 'Stacked semicolons holding clauses that could be sentences.',
		fix: 'Prefer a period.'
	},
	{
		id: 'burstiness',
		category: 'structure',
		detect: 'rewriter',
		spot: 'Every sentence in the same length band.',
		fix: `Mix a sentence of ${HUMANIZE_BURSTINESS_SHORT_MAX_WORDS} words or fewer with one of ${HUMANIZE_BURSTINESS_LONG_MIN_WORDS}+ words.`
	},
	{
		id: 'fractalSummary',
		category: 'structure',
		detect: 'rewriter',
		spot: 'A short summary at the start and another wrap-up at the end.',
		fix: 'Say it once.'
	},
	{
		id: 'signpostedConclusion',
		category: 'structure',
		detect: 'local',
		spot: 'In conclusion / to recap / the bottom line.',
		fix: 'Delete the signpost; keep the point.',
		phrases: HUMANIZE_CONCLUSION_PHRASES
	},
	{
		id: 'pepTalkEnding',
		category: 'structure',
		detect: 'local',
		spot: 'Last sentence is a rally cry.',
		fix: 'Drop that last sentence.',
		phrases: HUMANIZE_PEP_TALK_PHRASES
	},
	{
		id: 'promptEcho',
		category: 'structure',
		detect: 'rewriter',
		spot: 'The rewrite restates these instructions.',
		fix: 'Output only the post.'
	},
	{
		id: 'listicleTrenchcoat',
		category: 'structure',
		detect: 'rewriter',
		spot: 'A short post that is secretly a numbered list.',
		fix: 'Keep one or two points, or own that it is a list.'
	},
	{
		id: 'uniformStaccato',
		category: 'structure',
		detect: 'local',
		spot: 'Several sentences of almost the same length.',
		fix: 'Vary length; do not chop every long sentence.'
	},
	{
		id: 'noConcreteImagery',
		category: 'content',
		detect: 'rewriter',
		spot: 'No object, place, or sensory detail.',
		fix: 'Keep a concrete noun the user already wrote; do not invent one.'
	},
	{
		id: 'properNounAvoidance',
		category: 'content',
		detect: 'rewriter',
		spot: 'Every name swapped for a generic team / users / folks.',
		fix: 'Keep names the user already used.'
	},
	{
		id: 'uniformPositivity',
		category: 'content',
		detect: 'rewriter',
		spot: 'Every clause is upbeat.',
		fix: 'Allow a scratchy or unresolved edge if the source has one.'
	},
	{
		id: 'bothSidesing',
		category: 'content',
		detect: 'rewriter',
		spot: 'A false both-sides wrap the user did not write.',
		fix: 'Stay with the user’s actual stance.'
	},
	{
		id: 'tidyAnecdotes',
		category: 'content',
		detect: 'rewriter',
		spot: 'A too-neat beginning-middle-end story added in the rewrite.',
		fix: 'Do not invent an anecdote.'
	},
	{
		id: 'registerScrubbing',
		category: 'content',
		detect: 'rewriter',
		spot: 'Personality, slang, or humor washed out.',
		fix: 'Keep the user’s register; only drop stock machine habits.'
	}
];
