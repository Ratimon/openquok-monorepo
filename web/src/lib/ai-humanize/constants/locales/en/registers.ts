import type { HumanizeRegisterOverlayId } from '$lib/ai-humanize/constants/writingGuide.types';

/**
 * Developer register overlays appended into Rewriter sharedContext when enabled.
 * Human and Roughen stay the only modal modes — these are not a third toggle.
 */
export const HUMANIZE_REGISTERS: Record<
	HumanizeRegisterOverlayId,
	{ id: HumanizeRegisterOverlayId; sharedContext: string }
> = {
	simplifiedTechnicalEnglish: {
		id: 'simplifiedTechnicalEnglish',
		sharedContext:
			'Developer overlay: keep sentences short and make one idea per sentence. Prefer a small set of plain verbs (use, show, start, stop, keep, give, take). This is a clarity overlay, not a third rewrite mode.'
	}
};
