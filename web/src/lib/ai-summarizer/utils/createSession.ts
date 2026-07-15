import type { ComposerSummarizerCreateCoreOptions } from '$lib/ai-summarizer/utils/buildCreateOptions';

import { isSummarizerSupported } from '$lib/ai-summarizer/utils/availability';
import { buildComposerSummarizerCreateOptions } from '$lib/ai-summarizer/utils/buildCreateOptions';

export type CreateComposerSummarizerOptions = {
	signal?: AbortSignal;
	/** Called with download fraction in `[0, 1]` while the on-device model is fetched. */
	onDownloadProgress?: (loaded: number) => void;
	/** Constraint-aware create options; defaults to Global Edit–scale limits. */
	createOptions?: ComposerSummarizerCreateCoreOptions;
};

/** Chrome Summarizer API session created by {@link createComposerSummarizer}. */
export type SummarizerSession = Summarizer;

/**
 * Creates a Summarizer instance configured for social-post shortening in the composer.
 * Triggers model download when needed; wires `downloadprogress` for UI %.
 */
export async function createComposerSummarizer(
	options: CreateComposerSummarizerOptions = {}
): Promise<SummarizerSession> {
	if (!isSummarizerSupported()) {
		throw new Error('Chrome Summarizer API is not available in this browser.');
	}

	const { signal, onDownloadProgress, createOptions } = options;
	const core = createOptions ?? buildComposerSummarizerCreateOptions();

	return Summarizer.create({
		type: core.type,
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
