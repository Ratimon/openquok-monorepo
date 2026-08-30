import type { HumanizeModeOption, HumanizeUiCopy } from '$lib/ai-humanize/constants/config';

/** Mode toggle labels and short helper copy for the Humanize modal. */
export const HUMANIZE_MODE_OPTIONS = [
	{
		id: 'human' as const,
		label: 'Human',
		description: 'Rewrite so it reads less machine-written.'
	},
	{
		id: 'roughen' as const,
		label: 'Roughen',
		description: 'Rougher, more spoken. Review any invented details before you post.'
	}
] as const satisfies readonly HumanizeModeOption[];

/** Short UI strings shown around the Humanize modal sections (English UI). */
export const HUMANIZE_UI_COPY = {
	modeSection: 'Mode',
	draftSection: 'Post draft',
	rewriteSection: 'Rewrite',
	localCleanupChip: 'Local cleanup',
	charactersSuffix: 'characters',
	tellsSuffix: 'tells'
} as const satisfies HumanizeUiCopy;
