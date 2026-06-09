const LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS =
	'bg-white text-black px-3 py-1 rounded-md -rotate-1 inline-block';

const LANDING_HERO_TITLE_GRADIENT_PRIMARY =
	'bg-gradient-to-r from-emerald-300 via-lime-300 to-amber-300 bg-clip-text text-transparent';

const LANDING_HERO_TITLE_GRADIENT_ACCENT =
	'bg-gradient-to-r from-fuchsia-300 via-rose-300 to-orange-300 bg-clip-text text-transparent';

type LandingHeroTitleSegment = { text: string; highlight: boolean };

const LANDING_HERO_TITLE_HIGHLIGHT_WORDS = [
	'minimal',
	'in action',
	'effortlessly',
	'confidently',
	'efficiently',
	'correctly',
	'channels',
	'perfect plan',
	'plan',
	'questions',
	'bulk',
	'agents',
	'approve',
	'scale',
	'track',
	'one place',
	'interate',
	'facebook',
	'threads'
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
	titleHighlightPillClass: LANDING_HERO_TITLE_HIGHLIGHT_PILL_CLASS,
	parseLandingHeroTitlePartSegments,
	landingHeroTitlePartHasHighlight
};

export type LandingHeroTheme = typeof landingHeroTheme;
