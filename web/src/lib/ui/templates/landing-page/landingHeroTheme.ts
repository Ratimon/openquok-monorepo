/** Rotating accent words for the main landing hero title ("Save ___"). */
export const LANDING_HERO_HOURS_ROTATE_TEXTS = [
	'hours',
	'money',
	'man-days',
	'busywork',
	'headaches'
] as const;

/** Rotating phrases for the main landing hero slogan ("___" highlight). */
export const LANDING_HERO_SLOGAN_NOT_ROTATE_TEXTS = [
	'not hours',
	'not money',
	'not man-days',
	'not busywork'
] as const;

const LANDING_HERO_TITLE_GRADIENT_PRIMARY =
	'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';

const LANDING_HERO_TITLE_GRADIENT_ACCENT =
	'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

type LandingHeroTitleSegment = { text: string; highlight: boolean };

/** Longest first so regex alternation prefers multi-word phrases over substrings. */
const LANDING_HERO_TITLE_HIGHLIGHT_WORDS = [
	'free alternative scheduler',
	'alternative scheduler',
	'social platforms',
	'social networks',
	'modify further',
	'thread replies',
	'trending audio',
	'inbox upload',
	'viral formats',
	'scheduling playbooks',
	'marketing playbooks',
	'content calendar',
	'building blocks',
	'MCP servers',
	'social scheduling',
	'agent-native',
	'conversation',
	'effortlessly',
	'per-platform',
	'perfect plan',
	'social media',
	'viral format',
	'agent hosts',
	'Claude Code',
	'confidently',
	'efficiently',
	'MCP clients',
	'dockerized',
	'MCP-native',
	'analytics',
	'carousels',
	'checklist',
	'correctly',
	'in action',
	'instagram',
	'one place',
	'questions',
	'ThinkRail',
	'thumbnail',
	'workspace',
	'AI draft',
	'best fit',
	'channels',
	'facebook',
	'Grok Bot',
	'interate',
	'linkedin',
	'openclaw',
	'OpenQuok',
	'profiles',
	'securely',
	'sessions',
	'terminal',
	'approve',
	'minimal',
	'quickly',
	'threads',
	'winners',
	'youtube',
	'agents',
	'Dev.to',
	'X'
	'editor',
	'hermes',
	'prompt',
	'repost',
	'replies',
	'series',
	'Shorts',
	'tiktok',
	'tweets',
	'batch',
	'cloud',
	'craft',
	'layer',
	'plans',
	'plugs',
	'reels',
	'scale',
	'setup',
	'stack',
	'steps',
	'track',
	'bulk',
	'plan',
	'tags',
	'B2B',
	'cli',
	'vs'
] as const;

const TITLE_PART_HIGHLIGHT_PHRASE = new RegExp(
	`^(?:${LANDING_HERO_TITLE_HIGHLIGHT_WORDS.join('|')})$`,
	'i'
);

const TITLE_PART_HIGHLIGHT_SPLIT = new RegExp(
	`\\b(${LANDING_HERO_TITLE_HIGHLIGHT_WORDS.join('|')})\\b`,
	'gi'
);

function parseLandingHeroTitlePartSegments(text: string): LandingHeroTitleSegment[] {
	if (!text) return [];
	const parts = text.split(TITLE_PART_HIGHLIGHT_SPLIT);
	const out: LandingHeroTitleSegment[] = [];
	for (const p of parts) {
		if (p === '') continue;
		out.push({ text: p, highlight: TITLE_PART_HIGHLIGHT_PHRASE.test(p) });
	}
	return out;
}

function landingHeroTitlePartHasHighlight(segments: LandingHeroTitleSegment[]): boolean {
	return segments.some((segment) => segment.highlight);
}

function titleSegmentClass(
	segmentIndex: number,
	segments: LandingHeroTitleSegment[]
): string {
	let nonHighlightBefore = 0;
	for (let i = 0; i < segmentIndex; i++) {
		if (!segments[i].highlight) nonHighlightBefore++;
	}
	return nonHighlightBefore === 0
		? LANDING_HERO_TITLE_GRADIENT_PRIMARY
		: LANDING_HERO_TITLE_GRADIENT_ACCENT;
}

export const landingHeroTheme = {
	hoursRotateTexts: LANDING_HERO_HOURS_ROTATE_TEXTS,
	sloganNotRotateTexts: LANDING_HERO_SLOGAN_NOT_ROTATE_TEXTS,
	subtitleClass: 'text-xs font-bold tracking-wider text-primary uppercase sm:text-sm',
	descriptionClass:
		'pt-2 text-base font-medium leading-relaxed text-pretty text-base-content/70 sm:text-lg',
	ctaButtonClass:
		'my-2 w-full max-w-xs justify-center rounded-full px-10 text-sm sm:text-base lg:text-lg',
	imageClass: 'h-auto w-full rounded-lg shadow-2xl ring-1 ring-base-content/10',
	titlePartClass: (index: number, total: number) => {
		if (index === 0) return 'text-base-content';
		if (total >= 3 && index === total - 1) return LANDING_HERO_TITLE_GRADIENT_ACCENT;
		return LANDING_HERO_TITLE_GRADIENT_PRIMARY;
	},
	titleSegmentClass,
	parseLandingHeroTitlePartSegments,
	landingHeroTitlePartHasHighlight
};

export type LandingHeroTheme = typeof landingHeroTheme;
