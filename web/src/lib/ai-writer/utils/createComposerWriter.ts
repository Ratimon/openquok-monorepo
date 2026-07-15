import { COMPOSER_WRITER_DEFAULTS } from '$lib/ai-writer/constants/config';
import { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';

export type CreateComposerWriterOptions = {
	signal?: AbortSignal;
	/** Called with download fraction in `[0, 1]` while the on-device model is fetched. */
	onDownloadProgress?: (loaded: number) => void;
};

/** Chrome Writer API session created by {@link createComposerWriter}. */
export type WriterSession = Writer;

/**
 * Creates a Writer instance configured for social-post drafting in the composer.
 * Triggers model download when needed; wires `downloadprogress` for UI %.
 */
export async function createComposerWriter(
	options: CreateComposerWriterOptions = {}
): Promise<WriterSession> {
	if (!isWriterSupported()) {
		throw new Error('Chrome Writer API is not available in this browser.');
	}

	const { signal, onDownloadProgress } = options;

	return Writer.create({
		tone: COMPOSER_WRITER_DEFAULTS.tone,
		format: COMPOSER_WRITER_DEFAULTS.format,
		length: COMPOSER_WRITER_DEFAULTS.length,
		expectedInputLanguages: COMPOSER_WRITER_DEFAULTS.expectedInputLanguages,
		expectedContextLanguages: COMPOSER_WRITER_DEFAULTS.expectedContextLanguages,
		outputLanguage: COMPOSER_WRITER_DEFAULTS.outputLanguage,
		sharedContext: COMPOSER_WRITER_DEFAULTS.sharedContext,
		signal,
		monitor: onDownloadProgress
			? (m) => {
					m.addEventListener('downloadprogress', (e) => {
						const loaded = Number.isFinite(e.loaded) ? e.loaded : 0;
						onDownloadProgress(Math.min(1, Math.max(0, loaded)));
					});
				}
			: undefined
	});
}
