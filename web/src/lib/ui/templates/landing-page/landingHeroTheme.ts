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
	// API & programmatic SEO (longest phrases first)
	'scheduling API payload',
	'posting API payload',
	'scheduling API platforms',
	'posting API platforms',
	'best time to post calculator',
	'every connected channel',
	'API payload wizard',
	'alternative scheduler',
	'structured response',
	'marketing playbooks',
	'scheduling playbooks',
	'document carousels',
	'photo carousels',
	'social media tools',
	'content calendar',
	'building blocks',
	'social platforms',
	'social networks',
	'publish on time',
	'Scheduling API',
	'Posting API',
	'Twitter / X',
	'payload wizard',
	'thread replies',
	'trending audio',
	'inbox upload',
	'viral formats',
	'social scheduling',
	'photo editor',
	'skill builder',
	'free tools',
	'public API',
	'post payloads',
	'every channel',
	'schedule once',
	'three steps',
	'your product',
	'one request',
	'modify further',
	'AI humanizer',
	'per-platform',
	'perfect plan',
	'viral format',
	'in action',
	'one place',
	'AI draft',
	'best fit',
	'humanize',
	// Autonomous agent hosts
	'Grok Bot',
	'Dots',
	'Meta Muse',
	'ThinkRail',
	'Manus',
	'openclaw',
	'hermes',
	'agent hosts',
	'agents',
	// MCP clients & agent tooling
	'VS Code / Copilot',
	'Antigravity CLI',
	'Devin Desktop',
	'Claude Cowork',
	'Claude Code',
	'Muse Code',
	'MCP servers',
	'MCP clients',
	'MCP-native',
	'agent-native',
	'ChatGPT',
	'Codex',
	'Cursor',
	'Claude',
	'Warp',
	'Amp',
	'dockerized',
	// Social channels & networks
	'instagram',
	'facebook',
	'linkedin',
	'youtube',
	'threads',
	'tiktok',
	'bluesky',
	'Dev.to',
	'channels',
	'Shorts',
	'reels',
	'tweets',
	'X',
	'Reels',
	'Storys',
	'@mentions',
	// Protected account app heroes
	'Reusable Templates',
	'Media Library',
	'My Playbooks',
	'playbooks & backlinks',
	'My Dashboard',
	'Auto Plugs',
	'Calendar',
	// Product & workflow terms
	'OpenQuok',
	'carousels',
	'analytics',
	'Admin',
	'Member',
	'workspace',
	'thumbnail',
	'conversation',
	'effortlessly',
	'confidently',
	'efficiently',
	'checklist',
	'correctly',
	'workflow',
	'profiles',
	'terminal',
	'sessions',
	'securely',
	'approve',
	'minimal',
	'quickly',
	'winners',
	'interate',
	'editor',
	'prompt',
	'repost',
	'replies',
	'series',
	'response',
	'request',
	'typescript',
	'Node.js',
	'batch',
	'cloud',
	'craft',
	'layer',
	'plans',
	'plugs',
	'scale',
	'setup',
	'stack',
	'steps',
	'track',
	'tags',
	'bulk',
	'plan',
	'B2B',
	'cli',
	'vs',
	'questions'
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
	/** Docs CTA uses a longer label — skip max-w-xs so glitch text is not clipped. */
	docsCtaButtonClass:
		'my-2 w-full max-w-none justify-center rounded-full px-10 text-sm whitespace-nowrap sm:w-auto sm:text-base lg:text-lg',
	/** Hero CTAs: stack full-width on small screens; row + wrap from `sm`. */
	dualCtaRowClass:
		'flex w-full max-w-md flex-col items-stretch gap-2 pt-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start',
	compactCtaButtonClass:
		'w-full max-w-full justify-center rounded-full px-5 text-sm sm:w-auto sm:max-w-none sm:shrink-0 sm:px-7 sm:text-base',
	compactDocsCtaButtonClass:
		'w-full max-w-full justify-center rounded-full px-5 text-sm sm:w-auto sm:max-w-none sm:shrink-0 sm:px-7 sm:text-base',
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
