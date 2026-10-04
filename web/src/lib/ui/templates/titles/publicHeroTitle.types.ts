/** Segments from `landingHeroTheme.parseLandingHeroTitlePartSegments`. */
export type PublicHeroDictionarySegment = {
	text: string;
	highlight: boolean;
};

/** Explicit segments (e.g. creator listing OpenQuok upsell hero). */
export type PublicHeroStyledSegmentStyle = 'plain' | 'sticker' | 'underline';

export type PublicHeroStyledSegment = {
	text: string;
	style: PublicHeroStyledSegmentStyle;
};

export type PublicHeroTitleHeadingLevel = 'h1' | 'h2' | 'h3';
