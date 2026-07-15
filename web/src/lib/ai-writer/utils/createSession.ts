import type {
	ComposerRewriterCreateCoreOptions,
	ComposerWriterCreateCoreOptions
} from '$lib/ai-writer/utils/buildCreateOptions';

import { isRewriterSupported, isWriterSupported } from '$lib/ai-writer/utils/availability';
import {
	buildComposerRewriterCreateOptions,
	buildComposerWriterCreateOptions
} from '$lib/ai-writer/utils/buildCreateOptions';

export type CreateComposerWriterOptions = {
	signal?: AbortSignal;
	/** Called with download fraction in `[0, 1]` while the on-device model is fetched. */
	onDownloadProgress?: (loaded: number) => void;
	/** Constraint-aware create options; defaults to Global Edit–scale limits. */
	createOptions?: ComposerWriterCreateCoreOptions;
};

export type CreateComposerRewriterOptions = {
	signal?: AbortSignal;
	/** Called with download fraction in `[0, 1]` while the on-device model is fetched. */
	onDownloadProgress?: (loaded: number) => void;
	/** Refine-action create options; defaults to as-is tone/length with Global Edit constraints. */
	createOptions?: ComposerRewriterCreateCoreOptions;
};

/** Chrome Writer API session created by {@link createComposerWriter}. */
export type WriterSession = Writer;

/** Chrome Rewriter API session created by {@link createComposerRewriter}. */
export type RewriterSession = Rewriter;

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

/**
 * Creates a Rewriter instance for tone/length refine in the composer AI Writer modal.
 * Triggers model download when needed; wires `downloadprogress` for UI %.
 */
export async function createComposerRewriter(
	options: CreateComposerRewriterOptions = {}
): Promise<RewriterSession> {
	if (!isRewriterSupported()) {
		throw new Error('Chrome Rewriter API is not available in this browser.');
	}

	const { signal, onDownloadProgress, createOptions } = options;
	const core = createOptions ?? buildComposerRewriterCreateOptions();

	return Rewriter.create({
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
