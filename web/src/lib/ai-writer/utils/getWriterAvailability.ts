import type { ComposerWriterCreateCoreOptions } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';

import { buildComposerWriterCreateOptions } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';
import { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';

export type WriterAvailability = Availability;

/**
 * Resolves Chrome Writer model availability for the given create options
 * (or composer defaults when omitted).
 * Returns `'unavailable'` when the API is missing or the model cannot be used.
 */
export async function getWriterAvailability(
	createOptions?: ComposerWriterCreateCoreOptions
): Promise<WriterAvailability> {
	if (!isWriterSupported()) return 'unavailable';
	const core = createOptions ?? buildComposerWriterCreateOptions();
	try {
		return await Writer.availability({
			tone: core.tone,
			format: core.format,
			length: core.length,
			expectedInputLanguages: core.expectedInputLanguages,
			expectedContextLanguages: core.expectedContextLanguages,
			outputLanguage: core.outputLanguage
		});
	} catch {
		return 'unavailable';
	}
}
