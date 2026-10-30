import type { LandingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
import { splitPublicHeroTitleLines } from '$lib/ui/templates/titles/splitPublicLandingTitleParts';

export type LandingHeroDictionaryTitlePiece =
	| { kind: 'highlight'; text: string }
	| { kind: 'gradient'; text: string; class: string };

export function buildLandingHeroDictionaryTitleLines(
	title: string,
	heroTheme: Pick<
		LandingHeroTheme,
		'parseLandingHeroTitlePartSegments' | 'titleSegmentClassWithOffset'
	>
): { lines: string[]; linePieces: LandingHeroDictionaryTitlePiece[][] } {
	const lines = splitPublicHeroTitleLines(title);
	let nonHighlightOffset = 0;
	const linePieces = lines.map((line) => {
		const segments = heroTheme.parseLandingHeroTitlePartSegments(line);
		const pieces: LandingHeroDictionaryTitlePiece[] = segments.map((seg, segmentIndex) => {
			if (seg.highlight) {
				return { kind: 'highlight', text: seg.text };
			}
			return {
				kind: 'gradient',
				text: seg.text,
				class: heroTheme.titleSegmentClassWithOffset(
					segmentIndex,
					segments,
					nonHighlightOffset
				)
			};
		});
		for (const seg of segments) {
			if (!seg.highlight) nonHighlightOffset++;
		}
		return pieces;
	});
	return { lines, linePieces };
}
