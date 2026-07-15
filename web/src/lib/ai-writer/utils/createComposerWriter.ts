import type { ComposerWriterCreateCoreOptions } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';

import { buildComposerWriterCreateOptions } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';
import { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';

export type CreateComposerWriterOptions = {
	signal?: AbortSignal;
	/** Called with download fraction in `[0, 1]` while the on-device model is fetched. */
	onDownloadProgress?: (loaded: number) => void;
	/** Constraint-aware create options; defaults to Global Edit–scale limits. */
	createOptions?: ComposerWriterCreateCoreOptions;
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

	const { signal, onDownloadProgress, createOptions } = options;
	const core = createOptions ?? buildComposerWriterCreateOptions();

	return Writer.create({
		tone: core.tone,
		format: core.format,
		length: core.length,
		expectedInputLanguages: core.expectedInputLanguages,
		expectedContextLanguages: core.expectedContextLanguages,
		outputLanguage: core.outputLanguage,
		sharedContext: core.sharedContext,
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
