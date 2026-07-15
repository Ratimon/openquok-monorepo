import { COMPOSER_WRITER_DEFAULTS } from '$lib/ai-writer/constants/config';
import { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';

export type WriterAvailability = Availability;

/**
 * Resolves Chrome Writer model availability for composer defaults.
 * Returns `'unavailable'` when the API is missing or the model cannot be used.
 */
export async function getWriterAvailability(): Promise<WriterAvailability> {
	if (!isWriterSupported()) return 'unavailable';
	try {
		return await Writer.availability({
			tone: COMPOSER_WRITER_DEFAULTS.tone,
			format: COMPOSER_WRITER_DEFAULTS.format,
			length: COMPOSER_WRITER_DEFAULTS.length,
			expectedInputLanguages: COMPOSER_WRITER_DEFAULTS.expectedInputLanguages,
			expectedContextLanguages: COMPOSER_WRITER_DEFAULTS.expectedContextLanguages,
			outputLanguage: COMPOSER_WRITER_DEFAULTS.outputLanguage
		});
	} catch {
		return 'unavailable';
	}
}
