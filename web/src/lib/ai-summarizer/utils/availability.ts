import type { ComposerSummarizerCreateCoreOptions } from '$lib/ai-summarizer/utils/buildCreateOptions';

import { buildComposerSummarizerCreateOptions } from '$lib/ai-summarizer/utils/buildCreateOptions';

export type SummarizerAvailability = Availability;

/**
 * Returns whether the browser exposes the Summarizer API on the global object.
 * Safe during SSR (always false when `globalThis` has no Summarizer).
 */
export function isSummarizerSupported(): boolean {
	return typeof globalThis !== 'undefined' && 'Summarizer' in globalThis;
}

/**
 * Resolves Chrome Summarizer model availability for the given create options
 * (or composer defaults when omitted).
 * Returns `'unavailable'` when the API is missing or the model cannot be used.
 */
export async function getSummarizerAvailability(
	createOptions?: ComposerSummarizerCreateCoreOptions
): Promise<SummarizerAvailability> {
	if (!isSummarizerSupported()) return 'unavailable';
	const core = createOptions ?? buildComposerSummarizerCreateOptions();
	try {
		const withOptions = await Summarizer.availability({
			type: core.type,
			format: core.format,
			length: core.length,
			expectedInputLanguages: core.expectedInputLanguages,
			expectedContextLanguages: core.expectedContextLanguages,
			outputLanguage: core.outputLanguage
		});
		// Option-specific checks can be stricter than the model itself; fall back
		// to a bare probe so we do not hide the modal on false "unavailable".
		if (withOptions !== 'unavailable') return withOptions;
		return await Summarizer.availability();
	} catch {
		try {
			return await Summarizer.availability();
		} catch {
			return 'unavailable';
		}
	}
}
