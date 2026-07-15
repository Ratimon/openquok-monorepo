import type {
	ComposerRewriterCreateCoreOptions,
	ComposerWriterCreateCoreOptions
} from '$lib/ai-writer/utils/buildCreateOptions';

import {
	buildComposerRewriterCreateOptions,
	buildComposerWriterCreateOptions
} from '$lib/ai-writer/utils/buildCreateOptions';

export type WriterAvailability = Availability;
export type RewriterAvailability = Availability;

/**
 * Returns whether the browser exposes the Writer API on the global object.
 * Safe during SSR (always false when `globalThis` has no Writer).
 */
export function isWriterSupported(): boolean {
	return typeof globalThis !== 'undefined' && 'Writer' in globalThis;
}

/**
 * Returns whether the browser exposes the Rewriter API on the global object.
 * Safe during SSR (always false when `globalThis` has no Rewriter).
 */
export function isRewriterSupported(): boolean {
	return typeof globalThis !== 'undefined' && 'Rewriter' in globalThis;
}

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
