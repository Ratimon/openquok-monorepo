import type { ComposerRewriterCreateCoreOptions } from '$lib/ai-writer/utils/buildComposerRewriterCreateOptions';

import { buildComposerRewriterCreateOptions } from '$lib/ai-writer/utils/buildComposerRewriterCreateOptions';
import { isRewriterSupported } from '$lib/ai-writer/utils/isRewriterSupported';

export type RewriterAvailability = Availability;

/**
 * Resolves Chrome Rewriter model availability for the given create options
 * (or as-is defaults when omitted).
 * Returns `'unavailable'` when the API is missing or the model cannot be used.
 */
export async function getRewriterAvailability(
	createOptions?: ComposerRewriterCreateCoreOptions
): Promise<RewriterAvailability> {
	if (!isRewriterSupported()) return 'unavailable';
	const core = createOptions ?? buildComposerRewriterCreateOptions();
	try {
		const withOptions = await Rewriter.availability({
			tone: core.tone,
			format: core.format,
			length: core.length,
			expectedInputLanguages: core.expectedInputLanguages,
			expectedContextLanguages: core.expectedContextLanguages,
			outputLanguage: core.outputLanguage
		});
		// Option-specific checks can be stricter than the model itself; fall back
		// to a bare probe so we do not hide refine chips on false "unavailable".
		if (withOptions !== 'unavailable') return withOptions;
		return await Rewriter.availability();
	} catch {
		try {
			return await Rewriter.availability();
		} catch {
			return 'unavailable';
		}
	}
}
